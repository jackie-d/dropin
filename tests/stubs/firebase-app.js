import { vi } from 'vitest';

export const initializeApp = vi.fn((config) => ({ name: '[DEFAULT]', options: config }));
