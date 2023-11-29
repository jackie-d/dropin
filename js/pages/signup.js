import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

const module = {

	firebase: null,
	
	init: function(firebase) {
		console.log(firebase);

		this.firebase = firebase;

		const that = this;
		$('#signupButton').click(function(){
			that.signupByEmail();
		});

		$('#signup-google-button').click(function(){
			that.signupByGoogle();
		});

		$('#signup-facebook-button').click(function(){
			that.signupByFacebook();
		});
	},

	signupByEmail: function() {

		const auth = getAuth(this.firebase);

		const email = $('#email').val();
		const password = $('#password').val();
	
		createUserWithEmailAndPassword(auth, email, password)
		  .then((userCredential) => {
		    // Signed up 
		    const user = userCredential.user;
		    console.log(user);
		    location.href = "./?create=true";
		  })
		  .catch((error) => {
		    const errorCode = error.code;
		    const errorMessage = error.message;
		    // ..
		  });

	},

	signupByGoogle: function() {
		const provider = new GoogleAuthProvider();

		const auth = getAuth();
		signInWithPopup(auth, provider)
		  .then((result) => {
		    const credential = GoogleAuthProvider.credentialFromResult(result);
		    const token = credential.accessToken;
		    const user = result.user;

		    location.href = "./?create=true";
		  }).catch((error) => {
		    const errorCode = error.code;
		    const errorMessage = error.message;
		    const email = error.customData.email;
		    const credential = GoogleAuthProvider.credentialFromError(error);
		    console.log('error', error);
		  });
	}

};

export default module;