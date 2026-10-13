import { describe, it, expect } from 'vitest';
import { getSafeUrl, buildToast, DEFAULT_TITLE } from '../../js/lib/notifications.js';

const origin = 'https://example.com';

describe('getSafeUrl', () => {
	it('accepts absolute http(s) links', () => {
		expect(getSafeUrl('https://other.com/page', origin)).toBe('https://other.com/page');
		expect(getSafeUrl('http://other.com/', origin)).toBe('http://other.com/');
	});

	it('resolves relative links against the site', () => {
		expect(getSafeUrl('/profile?tab=1', origin)).toBe('https://example.com/profile?tab=1');
	});

	it('rejects other protocols', () => {
		expect(getSafeUrl('javascript:alert(1)', origin)).toBeNull();
		expect(getSafeUrl('data:text/html,<b>x</b>', origin)).toBeNull();
	});

	it('returns null without a link', () => {
		expect(getSafeUrl(undefined, origin)).toBeNull();
		expect(getSafeUrl('', origin)).toBeNull();
	});
});

describe('buildToast', () => {
	it('fills title, body and link', () => {
		const $toast = buildToast($, { data: { title: 'Hello', body: 'Hi there', url: '/news' } }, origin);

		expect($toast.find('.toast-title').text()).toBe('Hello');
		expect($toast.find('.toast-body span').text()).toBe('Hi there');
		expect($toast.find('.toast-link').attr('href')).toBe('https://example.com/news');
	});

	it('uses a default title and hides the button without a link', () => {
		const $toast = buildToast($, { data: { body: 'Hi there' } }, origin);

		expect($toast.find('.toast-title').text()).toBe(DEFAULT_TITLE);
		expect($toast.find('.toast-link').length).toBe(0);
	});

	it('hides the button for unsafe links', () => {
		const $toast = buildToast($, { data: { body: 'Hi', url: 'javascript:alert(1)' } }, origin);
		expect($toast.find('.toast-link').length).toBe(0);
	});

	it('does not render HTML coming from the message', () => {
		const $toast = buildToast($, { data: { title: '<b>x</b>', body: '<img src=x onerror=alert(1)>' } }, origin);

		expect($toast.find('img, b').length).toBe(0);
		expect($toast.find('.toast-body span').text()).toBe('<img src=x onerror=alert(1)>');
	});
});
