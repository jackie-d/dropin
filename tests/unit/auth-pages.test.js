import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, getAuth } from '../stubs/firebase-auth.js';
import loginPage from '../../js/pages/login.js';
import signupPage from '../../js/pages/signup.js';

const app = { name: 'test-app' };

// login and signup pages share the same structure: run the same tests on both
const pages = [
	{
		name: 'login',
		page: loginPage,
		emailAuth: signInWithEmailAndPassword,
		googleButton: '#login-button-google',
		successUrl: './'
	},
	{
		name: 'signup',
		page: signupPage,
		emailAuth: createUserWithEmailAndPassword,
		googleButton: '#signup-google-button',
		successUrl: './?create=true'
	}
];

describe.each(pages)('$name page', ({ name, page, emailAuth, googleButton, successUrl }) => {
	let redirect;

	beforeEach(() => {
		document.body.innerHTML = `
			<form id="${name}-form">
				<input id="email" value="  user@example.com ">
				<input id="password" value="secret123">
				<div id="${name}-error" class="d-none"></div>
				<button type="submit">Go</button>
			</form>
			<button id="${googleButton.slice(1)}">Google</button>`;
		redirect = vi.spyOn(page, 'redirect').mockImplementation(() => {});
		page.init(app);
	});

	const submit = () => $(`#${name}-form`).trigger('submit');
	const $error = () => $(`#${name}-error`);

	it('authenticates with the trimmed email on form submit and redirects', async () => {
		submit();

		await vi.waitFor(() => expect(redirect).toHaveBeenCalledWith(successUrl));
		expect(emailAuth).toHaveBeenCalledWith({ app }, 'user@example.com', 'secret123');
	});

	it('does not reload the page on submit', () => {
		const event = $.Event('submit');
		$(`#${name}-form`).trigger(event);
		expect(event.isDefaultPrevented()).toBe(true);
	});

	it('shows the error and stays on the page when email auth fails', async () => {
		emailAuth.mockRejectedValueOnce({ code: 'auth/invalid-email' });
		submit();

		await vi.waitFor(() => expect($error().hasClass('d-none')).toBe(false));
		expect($error().text()).toMatch(/valid email/);
		expect(redirect).not.toHaveBeenCalled();
	});

	it('clears a previous error on a new attempt', async () => {
		emailAuth.mockRejectedValueOnce({ code: 'auth/invalid-email' });
		submit();
		await vi.waitFor(() => expect($error().hasClass('d-none')).toBe(false));

		submit();
		await vi.waitFor(() => expect(redirect).toHaveBeenCalled());
		expect($error().hasClass('d-none')).toBe(true);
	});

	it('signs in with Google using the app instance and redirects', async () => {
		$(googleButton).trigger('click');

		await vi.waitFor(() => expect(redirect).toHaveBeenCalledWith(successUrl));
		expect(getAuth).toHaveBeenCalledWith(app);
		expect(signInWithPopup).toHaveBeenCalledTimes(1);
	});

	it('handles Google errors without customData', async () => {
		signInWithPopup.mockRejectedValueOnce({ code: 'auth/network-request-failed' });
		$(googleButton).trigger('click');

		await vi.waitFor(() => expect($error().text()).toMatch(/Network error/));
		expect(redirect).not.toHaveBeenCalled();
	});

	it('shows nothing when the user closes the Google popup', async () => {
		signInWithPopup.mockRejectedValueOnce({ code: 'auth/popup-closed-by-user' });
		await page[name == 'login' ? 'loginByGoogle' : 'signupByGoogle']();

		expect($error().hasClass('d-none')).toBe(true);
		expect(redirect).not.toHaveBeenCalled();
	});
});
