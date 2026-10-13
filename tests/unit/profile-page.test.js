import { describe, it, expect, vi, beforeEach } from 'vitest';
import profilePage from '../../js/pages/profile.js';

describe('profile page', () => {
	let redirect;

	beforeEach(() => {
		document.body.innerHTML = '<h1 id="profile-name"></h1>';
		redirect = vi.spyOn(profilePage, 'redirect').mockImplementation(() => {});
	});

	it('shows the display name', () => {
		profilePage.init({}, { displayName: 'Jane Doe', email: 'jane@example.com' });
		expect($('#profile-name').text()).toBe('Jane Doe');
	});

	it('does not show the email of users without a display name', () => {
		profilePage.init({}, { displayName: null, email: 'jane@example.com' });
		expect($('#profile-name').text()).toBe('');
	});

	it('redirects signed-out visitors to the login page', () => {
		expect(() => profilePage.init({}, null)).not.toThrow();
		expect(redirect).toHaveBeenCalledWith('./login.html');
	});
});
