import { describe, it, expect } from 'vitest';
import { getAuthErrorMessage, showAuthError, DEFAULT_ERROR_MESSAGE } from '../../js/lib/auth-errors.js';

describe('getAuthErrorMessage', () => {
	it('maps known Firebase error codes to friendly messages', () => {
		expect(getAuthErrorMessage({ code: 'auth/email-already-in-use' })).toMatch(/already exists/);
		expect(getAuthErrorMessage({ code: 'auth/weak-password' })).toMatch(/6 characters/);
	});

	it('uses the same message for wrong email and wrong password', () => {
		const codes = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'];
		const messages = codes.map((code) => getAuthErrorMessage({ code }));
		expect(new Set(messages).size).toBe(1);
	});

	it('falls back to a generic message for unknown errors', () => {
		expect(getAuthErrorMessage({ code: 'auth/something-new' })).toBe(DEFAULT_ERROR_MESSAGE);
		expect(getAuthErrorMessage(new Error('boom'))).toBe(DEFAULT_ERROR_MESSAGE);
	});

	it('returns null when there is nothing to report', () => {
		expect(getAuthErrorMessage(null)).toBeNull();
		expect(getAuthErrorMessage({ code: 'auth/popup-closed-by-user' })).toBeNull();
		expect(getAuthErrorMessage({ code: 'auth/cancelled-popup-request' })).toBeNull();
	});
});

describe('showAuthError', () => {
	it('shows the message and hides it again', () => {
		const $box = $('<div class="d-none"></div>');

		showAuthError($box, { code: 'auth/invalid-email' });
		expect($box.hasClass('d-none')).toBe(false);
		expect($box.text()).toMatch(/valid email/);

		showAuthError($box, null);
		expect($box.hasClass('d-none')).toBe(true);
		expect($box.text()).toBe('');
	});
});
