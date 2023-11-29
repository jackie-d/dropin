import firebase from './firebase-loader.js';

import { getMessaging, onMessage } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging.js";


let user = null;


$(() => {init()});

async function init() {

	console.log('init');

	user = await initAuth();
	initNotification();

	const pageId = $('body').attr("id");
	switch(pageId) {
		case 'signup':
			initSignup();
			break;
		case 'login':
			initLogin();
			break;
		case 'profile':
			initProfile();
			break;
		default:
			console.log('Init default case page id');
	}

}


function initAuth(){
	return import("./services/auth.js").then((authModule) => {
		authModule = authModule.default;
		return authModule.init(firebase).then((user) => {
			initLayoutOnAuth(user);
			return user;
		})
	});
}

function initSignup() {
	import("./pages/signup.js").then((signupModule) => {
		signupModule = signupModule.default;
		signupModule.init(firebase);
	});
}

function initLogin() {
	import("./pages/login.js").then((loginModule) => {
		loginModule = loginModule.default;
		loginModule.init(firebase, user);
	});
}

function initProfile() {
	import("./pages/profile.js").then((profileModule) => {
		profileModule = profileModule.default;
		profileModule.init(firebase, user);
	});
}

function initLayoutOnAuth(user) {

	console.log(user);


	if ( user ) {
		$('#topbar-user').show();
	} else {
		$('#topbar-signup').show();
	}


}

// push notifications

let toastBootstrap;


function initNotification() {
	const messaging = getMessaging(firebase);

	const toast = `<div class="toast-container position-fixed bottom-0 end-0 p-3">
<div class="toast show" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
  <div class="toast-header">
    <!--<img src="..." class="rounded me-2" alt="...">-->
    <strong class="me-auto toast-title">Website</strong>
    <!--<small class='label'>11 mins ago</small>-->
    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
  </div>
  <div class="toast-body">
    <span>Hello, world! This is a toast message.</span>
	<div class="mt-2 pt-2 border-top">
      <a type="button" class="btn btn-primary btn-sm toast-link" href="#">Read now</a>
    </div>
  </div>
</div>
  </div>

`;

	onMessage(messaging, (payload) => {
		console.log('Message received. ', payload);

		if ( location.pathname == '/chat.html' && location.search.indexOf('=' + payload.data.fromId ) != -1 ) {
				return;
		}

		let $toast = $(toast);
		$toast.find('.toast-body span').text(payload.data.body);
		$toast.find('.toast-title').text('You got a new message');
		// 			window.open(event.notification.data.url);
  	const paramName = payload.data.action == 'sending' ? 'from' : 'action';
	  const destinationUrl = self.location.protocol + '//' + self.location.host + '/chat.html?' + paramName + '=' + payload.data.fromId
	  $toast.find('.toast-link').attr('href', destinationUrl);
		$toast.appendTo('body');

		if ( toastBootstrap ) toastBootstrap.hide();
		toastBootstrap = new bootstrap.Toast($toast.get(0), {autohide: false})
		toastBootstrap.show();
	});
}