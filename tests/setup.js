import { beforeEach, vi } from 'vitest';
import jQuery from 'jquery';

// pages expect jQuery and Bootstrap as globals, like the <script> tags provide in the browser
globalThis.$ = globalThis.jQuery = jQuery;

beforeEach(() => {
	document.body.innerHTML = '';
	document.body.removeAttribute('id');
	vi.spyOn(console, 'log').mockImplementation(() => {});
});
