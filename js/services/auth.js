import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

const module = {

	firebase: null,

	user: null,
	
	init: function(firebase) {

		this.firebase = firebase;


		const auth = getAuth();

		const that = this;

		const promise = new Promise(function(resolve, reject) {

			onAuthStateChanged(auth, (user) => {
			  if (user) {
			    // User is signed in, see docs for a list of available properties
			    // https://firebase.google.com/docs/reference/js/auth.user
			    const uid = user.uid;

			    that.user = user;
			    console.log(user);
			    resolve(user);
			    // ...
			  } else {

			  	that.user = null;
			  	resolve(null);
			    // User is signed out
			    // ...
			  }
			});


		});

		// handle signout button
		$('.signout-button').click(() => {
			signOut(auth).then(() => {
			  location.href = './'
			}).catch((error) => {
			 	console.log(error);
			});
		})

		// ---

		return promise;

	}

};

export default module;