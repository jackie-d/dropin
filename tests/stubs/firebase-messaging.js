import { vi } from 'vitest';

export const isSupported = vi.fn(() => Promise.resolve(false));
export const getMessaging = vi.fn(() => ({}));
export const onMessage = vi.fn();
export const getToken = vi.fn(() => Promise.resolve('browser-token'));
export const deleteToken = vi.fn(() => Promise.resolve(true));
