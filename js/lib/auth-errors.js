// Maps Firebase Auth error codes to messages that can be shown to users.
// Full list: https://firebase.google.com/docs/reference/js/auth#autherrorcodes

const messages = {
	'auth/invalid-email': 'Please enter a valid email address.',
	'auth/missing-email': 'Please enter your email address.',
	'auth/missing-password': 'Please enter your password.',
	'auth/weak-password': 'The password must be at least 6 characters long.',
	'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
	'auth/invalid-credential': 'Wrong email or password.',
	'auth/invalid-login-credentials': 'Wrong email or password.',
	'auth/wrong-password': 'Wrong email or password.',
	'auth/user-not-found': 'Wrong email or password.',
	'auth/user-disabled': 'This account has been disabled.',
	'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
	'auth/network-request-failed': 'Network error. Check your connection and try again.',
	'auth/popup-blocked': 'The login popup was blocked by the browser. Please allow popups for this site.',
	'auth/account-exists-with-different-credential': 'An account with this email already exists with a different sign-in method.'
};

// Errors caused by the user closing the popup: nothing to report
const silentCodes = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

export const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export function getAuthErrorMessage(error) {
	if ( !error || silentCodes.includes(error.code) ) {
		return null;
	}
	return messages[error.code] || DEFAULT_ERROR_MESSAGE;
}

// Shows the error message for `error` in `$container`, or hides it when there is nothing to show
export function showAuthError($container, error) {
	const message = getAuthErrorMessage(error);
	if ( message ) {
		$container.text(message).removeClass('d-none');
	} else {
		$container.text('').addClass('d-none');
	}
}
