import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { showAuthError } from "../lib/auth-errors.js";


const module = {

	firebase: null,

	init: function(firebase) {
		this.firebase = firebase;

		const that = this;
		// form submit also handles the Enter key
		$('#login-form').on('submit', function(event) {
			event.preventDefault();
			that.loginByEmail();
		});

		$('#login-button-google').on('click', function() {
			that.loginByGoogle();
		});

		$('#login-button-facebook').on('click', function() {
			that.loginByFacebook();
		});
	},

	loginByEmail: function() {
		const auth = getAuth(this.firebase);

		const email = $('#email').val().trim();
		const password = $('#password').val();

		this.setError(null);
		return signInWithEmailAndPassword(auth, email, password)
			.then(() => {
				this.redirect('./');
			})
			.catch((error) => {
				console.log('login error', error);
				this.setError(error);
			});
	},

	loginByGoogle: function() {
		const auth = getAuth(this.firebase);
		const provider = new GoogleAuthProvider();

		this.setError(null);
		return signInWithPopup(auth, provider)
			.then(() => {
				this.redirect('./');
			})
			.catch((error) => {
				console.log('login error', error);
				this.setError(error);
			});
	},

	loginByFacebook: function() {
		// TODO: implement with FacebookAuthProvider
	},

	setError: function(error) {
		showAuthError($('#login-error'), error);
	},

	redirect: function(url) {
		location.href = url;
	}

};

export default module;
