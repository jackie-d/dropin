import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isSupported, onMessage } from '../stubs/firebase-messaging.js';
import { onAuthStateChanged } from '../stubs/firebase-auth.js';
import { init, initLayoutOnAuth, showNotificationToast } from '../../js/main.js';

const toastInstances = [];

beforeEach(() => {
	toastInstances.length = 0;
	globalThis.bootstrap = {
		Toast: vi.fn(function(element) {
			this.element = element;
			this.show = vi.fn();
			this.dispose = vi.fn();
			toastInstances.push(this);
		})
	};
});

describe('initLayoutOnAuth', () => {
	beforeEach(() => {
		document.body.innerHTML = `
			<div id="topbar-signup" style="display: none"></div>
			<div id="topbar-user" style="display: none"></div>`;
	});

	it('shows the user menu when signed in', () => {
		initLayoutOnAuth({ uid: '1' });
		expect($('#topbar-user').css('display')).not.toBe('none');
		expect($('#topbar-signup').css('display')).toBe('none');
	});

	it('shows login/signup buttons when signed out', () => {
		initLayoutOnAuth(null);
		expect($('#topbar-signup').css('display')).not.toBe('none');
		expect($('#topbar-user').css('display')).toBe('none');
	});
});

describe('showNotificationToast', () => {
	const payload = { data: { title: 'News', body: 'Hello', url: '/news' } };

	it('shows a toast with the message', () => {
		showNotificationToast(payload);

		expect($('#notification-toast .toast-body span').text()).toBe('Hello');
		expect(toastInstances).toHaveLength(1);
		expect(toastInstances[0].element).toBe($('#notification-toast .toast').get(0));
		expect(toastInstances[0].show).toHaveBeenCalled();
	});

	it('replaces the previous toast instead of stacking them', () => {
		showNotificationToast(payload);
		showNotificationToast({ data: { ...payload.data, body: 'Second' } });

		expect($('#notification-toast').length).toBe(1);
		expect($('#notification-toast .toast-body span').text()).toBe('Second');
		expect(toastInstances[0].dispose).toHaveBeenCalled();
	});

	it('ignores payloads without data', () => {
		showNotificationToast({ notification: { title: 'x' } });
		expect($('#notification-toast').length).toBe(0);
	});
});

describe('init', () => {
	beforeEach(() => {
		onAuthStateChanged.mockImplementation((auth, callback) => {
			setTimeout(() => callback(null));
			return () => {};
		});
	});

	it('does not use messaging when the browser does not support it', async () => {
		isSupported.mockResolvedValue(false);
		await init();
		await vi.waitFor(() => expect(isSupported).toHaveBeenCalled());
		expect(onMessage).not.toHaveBeenCalled();
	});

	it('listens for foreground messages when supported', async () => {
		isSupported.mockResolvedValue(true);
		await init();
		await vi.waitFor(() => expect(onMessage).toHaveBeenCalledWith(expect.anything(), showNotificationToast));
	});
});
