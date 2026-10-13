// Helpers for push notifications, shared by the foreground handler in main.js.
// Keep buildChatUrl in sync with firebase-messaging-sw.js (service workers can't import ES modules here).

export const NOTIFICATION_TITLE = 'You got a new message';

export function buildChatUrl(origin, data) {
	const paramName = data.action == 'sending' ? 'from' : 'action';
	return origin + '/chat.html?' + paramName + '=' + encodeURIComponent(data.fromId);
}

// True when the user is already looking at the chat the message belongs to
export function isChatOpen(location, data) {
	if ( location.pathname != '/chat.html' ) {
		return false;
	}
	const params = new URLSearchParams(location.search);
	return params.get('from') == data.fromId || params.get('action') == data.fromId;
}

export const toastTemplate = `<div class="toast-container position-fixed bottom-0 end-0 p-3" id="notification-toast">
  <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
      <strong class="me-auto toast-title">Website</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      <span></span>
      <div class="mt-2 pt-2 border-top">
        <a class="btn btn-primary btn-sm toast-link" href="#">Read now</a>
      </div>
    </div>
  </div>
</div>`;

// Builds the toast element for a message payload. Text is set with .text() so it can't inject HTML.
export function buildToast($, payload, origin) {
	const $toast = $(toastTemplate);
	$toast.find('.toast-title').text(NOTIFICATION_TITLE);
	$toast.find('.toast-body span').text(payload.data.body);
	$toast.find('.toast-link').attr('href', buildChatUrl(origin, payload.data));
	return $toast;
}
