import { describe, it, expect, vi, beforeEach } from 'vitest';
import profilePage from '../../js/pages/profile.js';
import push from '../../js/services/push.js';

describe('profile page', () => {
	let redirect;

	beforeEach(() => {
		document.body.innerHTML = `
			<h1 id="profile-name"></h1>
			<button id="enable-notifications" class="d-none">Enable notifications</button>`;
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

	describe('enable notifications button', () => {
		const user = { displayName: 'Jane Doe' };
		const $button = () => $('#enable-notifications');

		it('is hidden when notifications cannot be asked', () => {
			vi.spyOn(push, 'canAskPermission').mockReturnValue(false);
			profilePage.init({}, user);
			expect($button().hasClass('d-none')).toBe(true);
		});

		it('enables notifications on click and then hides', async () => {
			const canAsk = vi.spyOn(push, 'canAskPermission').mockReturnValue(true);
			const enable = vi.spyOn(push, 'enable').mockImplementation(async () => {
				canAsk.mockReturnValue(false);
				return 'token';
			});
			profilePage.init({}, user);
			expect($button().hasClass('d-none')).toBe(false);

			$button().trigger('click');
			await vi.waitFor(() => expect($button().hasClass('d-none')).toBe(true));
			expect(enable).toHaveBeenCalledTimes(1);
		});

		it('stays available if enabling fails', async () => {
			vi.spyOn(push, 'canAskPermission').mockReturnValue(true);
			vi.spyOn(push, 'enable').mockRejectedValue(new Error('no service worker'));
			profilePage.init({}, user);

			$button().trigger('click');
			await vi.waitFor(() => expect($button().prop('disabled')).toBe(false));
			expect($button().hasClass('d-none')).toBe(false);
		});
	});
});
