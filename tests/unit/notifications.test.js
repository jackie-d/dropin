import { describe, it, expect } from 'vitest';
import { buildChatUrl, isChatOpen, buildToast, NOTIFICATION_TITLE } from '../../js/lib/notifications.js';

const origin = 'https://example.com';

describe('buildChatUrl', () => {
	it('opens the chat with the sender for "sending" messages', () => {
		expect(buildChatUrl(origin, { action: 'sending', fromId: 'abc' })).toBe('https://example.com/chat.html?from=abc');
	});

	it('uses the action parameter otherwise', () => {
		expect(buildChatUrl(origin, { fromId: 'abc' })).toBe('https://example.com/chat.html?action=abc');
	});

	it('encodes the sender id', () => {
		expect(buildChatUrl(origin, { action: 'sending', fromId: 'a&b=c' })).toBe('https://example.com/chat.html?from=a%26b%3Dc');
	});
});

describe('isChatOpen', () => {
	const data = { fromId: 'abc' };

	it('is true on the chat with the sender', () => {
		expect(isChatOpen({ pathname: '/chat.html', search: '?from=abc' }, data)).toBe(true);
		expect(isChatOpen({ pathname: '/chat.html', search: '?action=abc' }, data)).toBe(true);
	});

	it('is false on other chats and pages', () => {
		expect(isChatOpen({ pathname: '/chat.html', search: '?from=other' }, data)).toBe(false);
		// a plain substring match would wrongly accept this one
		expect(isChatOpen({ pathname: '/chat.html', search: '?from=abcdef' }, data)).toBe(false);
		expect(isChatOpen({ pathname: '/index.html', search: '?from=abc' }, data)).toBe(false);
	});
});

describe('buildToast', () => {
	it('fills title, body and link', () => {
		const $toast = buildToast($, { data: { body: 'Hi there', fromId: 'abc', action: 'sending' } }, origin);

		expect($toast.find('.toast-title').text()).toBe(NOTIFICATION_TITLE);
		expect($toast.find('.toast-body span').text()).toBe('Hi there');
		expect($toast.find('.toast-link').attr('href')).toBe('https://example.com/chat.html?from=abc');
	});

	it('does not render HTML coming from the message', () => {
		const $toast = buildToast($, { data: { body: '<img src=x onerror=alert(1)>', fromId: 'abc' } }, origin);

		expect($toast.find('img').length).toBe(0);
		expect($toast.find('.toast-body span').text()).toBe('<img src=x onerror=alert(1)>');
	});
});
