import { vi } from 'vitest';

export const getFirestore = vi.fn((app) => ({ app }));
export const doc = vi.fn((db, ...path) => ({ path: path.join('/') }));
export const getDoc = vi.fn(() => Promise.resolve({ exists: () => false, data: () => undefined }));
export const setDoc = vi.fn(() => Promise.resolve());
export const updateDoc = vi.fn(() => Promise.resolve());
export const deleteField = vi.fn(() => 'DELETE_FIELD');
export const serverTimestamp = vi.fn(() => 'SERVER_TIMESTAMP');
