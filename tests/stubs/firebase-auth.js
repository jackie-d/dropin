import { vi } from 'vitest';

export const getAuth = vi.fn((app) => ({ app }));
export const onAuthStateChanged = vi.fn();
export const signOut = vi.fn(() => Promise.resolve());
export const signInWithEmailAndPassword = vi.fn(() => Promise.resolve({ user: {} }));
export const createUserWithEmailAndPassword = vi.fn(() => Promise.resolve({ user: {} }));
export const signInWithPopup = vi.fn(() => Promise.resolve({ user: {} }));
export class GoogleAuthProvider {}
