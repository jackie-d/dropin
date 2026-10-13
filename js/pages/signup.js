import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { showAuthError } from "../lib/auth-errors.js";

const module = {

	firebase: null,

	init: function(firebase) {
		this.firebase = firebase;

		const that = this;
		// form submit also handles the Enter key
		$('#signup-form').on('submit', function(event) {
			event.preventDefault();
			that.signupByEmail();
		});

		$('#signup-google-button').on('click', function() {
			that.signupByGoogle();
		});

		$('#signup-facebook-button').on('click', function() {
			that.signupByFacebook();
		});
	},

	signupByEmail: function() {
		const auth = getAuth(this.firebase);

		const email = $('#email').val().trim();
		const password = $('#password').val();

		this.setError(null);
		return createUserWithEmailAndPassword(auth, email, password)
			.then(() => {
				this.redirect('./?create=true');
			})
			.catch((error) => {
				console.log('signup error', error);
				this.setError(error);
			});
	},

	signupByGoogle: function() {
		const auth = getAuth(this.firebase);
		const provider = new GoogleAuthProvider();

		this.setError(null);
		return signInWithPopup(auth, provider)
			.then(() => {
				this.redirect('./?create=true');
			})
			.catch((error) => {
				console.log('signup error', error);
				this.setError(error);
			});
	},

	signupByFacebook: function() {
		// TODO: implement with FacebookAuthProvider
	},

	setError: function(error) {
		showAuthError($('#signup-error'), error);
	},

	redirect: function(url) {
		location.href = url;
	}

};

export default module;
