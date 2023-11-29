import { } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";


const module = {

	firebase: null,
    user: null,
	
	init: function(firebase, user) {
		console.log(firebase);

		this.firebase = firebase;
        this.user = user;

		const that = this;

        this.loadData();

	},

    loadData: async function() {
        $('#profile-name').text(this.user.displayName);
    }

};

export default module;