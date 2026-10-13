import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const stubs = fileURLToPath(new URL('./tests/stubs/', import.meta.url));

export default defineConfig({
	resolve: {
		alias: [
			// the browser loads Firebase from the CDN: tests use local stubs instead
			{
				find: /^https:\/\/www\.gstatic\.com\/firebasejs\/[\d.]+\/(firebase-[a-z]+)\.js$/,
				replacement: stubs + '$1.js'
			}
		]
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./tests/setup.js'],
		include: ['tests/**/*.test.js'],
		restoreMocks: true
	}
});
