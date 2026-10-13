import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onAuthStateChanged, signOut, getAuth } from '../stubs/firebase-auth.js';
import authService from '../../js/services/auth.js';
import push from '../../js/services/push.js';

const app = { name: 'test-app' };

describe('auth service', () => {
	let redirect;

	beforeEach(() => {
		document.body.innerHTML = '<a href="#" class="signout-button">Sign out</a>';
		redirect = vi.spyOn(authService, 'redirect').mockImplementation(() => {});
	});

	function emitAuthState(user) {
		const unsubscribe = vi.fn();
		onAuthStateChanged.mockImplementation((auth, callback) => {
			setTimeout(() => callback(user));
			return unsubscribe;
		});
		return unsubscribe;
	}

	it('resolves with the signed-in user and stops listening', async () => {
		const user = { uid: '1', email: 'a@b.c' };
		const unsubscribe = emitAuthState(user);

		await expect(authService.init(app)).resolves.toBe(user);
		expect(authService.user).toBe(user);
		expect(unsubscribe).toHaveBeenCalled();
		expect(getAuth).toHaveBeenCalledWith(app);
	});

	it('resolves with null when signed out', async () => {
		emitAuthState(null);

		await expect(authService.init(app)).resolves.toBeNull();
		expect(authService.user).toBeNull();
	});

	it('signs out and goes home when the signout button is clicked', async () => {
		emitAuthState({ uid: '1' });
		await authService.init(app);

		$('.signout-button').trigger('click');
		await vi.waitFor(() => expect(redirect).toHaveBeenCalledWith('./'));
		expect(signOut).toHaveBeenCalledTimes(1);
	});

	it('stops push notifications before signing out', async () => {
		const calls = [];
		vi.spyOn(push, 'disable').mockImplementation(async () => { calls.push('disable'); });
		signOut.mockImplementationOnce(async () => { calls.push('signOut'); });
		emitAuthState({ uid: '1' });
		await authService.init(app);

		$('.signout-button').trigger('click');
		await vi.waitFor(() => expect(redirect).toHaveBeenCalled());
		expect(calls).toEqual(['disable', 'signOut']);
	});

	it('stays on the page if signing out fails', async () => {
		emitAuthState({ uid: '1' });
		signOut.mockRejectedValueOnce(new Error('offline'));
		await authService.init(app);

		$('.signout-button').trigger('click');
		await vi.waitFor(() => expect(signOut).toHaveBeenCalled());
		await new Promise((resolve) => setTimeout(resolve));
		expect(redirect).not.toHaveBeenCalled();
	});
});
