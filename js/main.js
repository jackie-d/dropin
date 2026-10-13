import firebase, { vapidKey } from './firebase-loader.js';

import push from './services/push.js';
import { buildToast } from './lib/notifications.js';


let user = null;


$(() => {init()});

export async function init() {

	user = await initAuth();
	await initNotification();

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
			// pages without their own module (e.g. home)
	}

}


async function initAuth(){
	const authModule = (await import("./services/auth.js")).default;
	const user = await authModule.init(firebase);
	initLayoutOnAuth(user);
	return user;
}

async function initSignup() {
	const signupModule = (await import("./pages/signup.js")).default;
	signupModule.init(firebase);
}

async function initLogin() {
	const loginModule = (await import("./pages/login.js")).default;
	loginModule.init(firebase, user);
}

async function initProfile() {
	const profileModule = (await import("./pages/profile.js")).default;
	profileModule.init(firebase, user);
}

export function initLayoutOnAuth(user) {
	if ( user ) {
		$('#topbar-user').show();
	} else {
		$('#topbar-signup').show();
	}
}

// push notifications

let toastBootstrap;

function initNotification() {
	return push.init(firebase, user, { vapidKey, onForegroundMessage: showNotificationToast });
}

export function showNotificationToast(payload) {
	if ( !payload.data ) {
		return;
	}

	if ( toastBootstrap ) toastBootstrap.dispose();
	$('#notification-toast').remove();

	const $toast = buildToast($, payload, location.origin);
	$toast.appendTo('body');

	toastBootstrap = new bootstrap.Toast($toast.find('.toast').get(0), {autohide: false});
	toastBootstrap.show();
}
