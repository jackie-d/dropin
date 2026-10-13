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
	},

	loadData: function() {
		$('#profile-name').text(this.user.displayName || '');
	},

	redirect: function(url) {
		location.href = url;
	}

};

export default module;
