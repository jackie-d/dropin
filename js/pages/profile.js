import push from "../services/push.js";

const module = {

	firebase: null,
	user: null,

	init: function(firebase, user) {
		this.firebase = firebase;
		this.user = user;

		// the profile page is only for signed-in users
		if ( !user ) {
			this.redirect('./login.html');
			return;
		}

		this.loadData();
		this.initNotificationsButton();
	},

	loadData: function() {
		$('#profile-name').text(this.user.displayName || '');
	},

	// browsers only allow asking the notification permission after a user action
	initNotificationsButton: function() {
		const $button = $('#enable-notifications');
		if ( !push.canAskPermission() ) {
			return;
		}

		$button.removeClass('d-none').on('click', async () => {
			$button.prop('disabled', true);
			try {
				await push.enable();
			} catch (error) {
				console.log('push enable error', error);
			}
			// granted or denied: there is nothing more to ask
			$button.toggleClass('d-none', !push.canAskPermission()).prop('disabled', false);
		});
	},

	redirect: function(url) {
		location.href = url;
	}

};

export default module;
