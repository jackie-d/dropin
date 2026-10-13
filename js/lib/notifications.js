// Helpers for push notifications, used by the foreground handler in main.js.
// Messages are expected as data messages: { data: { title, body, url } }, all optional but body.
// Keep getSafeUrl in sync with firebase-messaging-sw.js (service workers can't import ES modules here).

export const DEFAULT_TITLE = 'New notification';

// Resolves `url` against `origin`, accepting only http(s) links (no javascript: and similar)
export function getSafeUrl(url, origin) {
	if ( !url ) {
		return null;
	}
	try {
		const parsed = new URL(url, origin);
		return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
	} catch (error) {
		return null;
	}
}

export const toastTemplate = `<div class="toast-container position-fixed bottom-0 end-0 p-3" id="notification-toast">
  <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
      <strong class="me-auto toast-title"></strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      <span></span>
      <div class="mt-2 pt-2 border-top toast-actions">
        <a class="btn btn-primary btn-sm toast-link" href="#">Open</a>
      </div>
    </div>
  </div>
</div>`;

// Builds the toast element for a message payload. Text is set with .text() so it can't inject HTML.
export function buildToast($, payload, origin) {
	const data = payload.data;
	const $toast = $(toastTemplate);
	$toast.find('.toast-title').text(data.title || DEFAULT_TITLE);
	$toast.find('.toast-body span').text(data.body || '');

	const url = getSafeUrl(data.url, origin);
	if ( url ) {
		$toast.find('.toast-link').attr('href', url);
	} else {
		$toast.find('.toast-actions').remove();
	}
	return $toast;
}
