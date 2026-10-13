import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isSupported, getMessaging, onMessage, getToken, deleteToken } from '../stubs/firebase-messaging.js';
import { getDoc, setDoc, updateDoc } from '../stubs/firebase-firestore.js';
import push from '../../js/services/push.js';

const app = { name: 'test-app' };
const user = { uid: 'user-1' };

function setPermission(permission, requestResult = permission) {
	globalThis.Notification = {
		permission,
		requestPermission: vi.fn(async () => {
			globalThis.Notification.permission = requestResult;
			return requestResult;
		})
	};
}

function storedToken(token) {
	getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ fcmToken: token }) });
}

beforeEach(() => {
	isSupported.mockResolvedValue(true);
	setPermission('default');
});

describe('init', () => {
	it('returns false and does nothing when messaging is not supported', async () => {
		isSupported.mockResolvedValue(false);

		await expect(push.init(app, user)).resolves.toBe(false);
		expect(getMessaging).not.toHaveBeenCalled();
		expect(push.isSupported()).toBe(false);
	});

	it('listens for foreground messages', async () => {
		const callback = vi.fn();
		await expect(push.init(app, user, { onForegroundMessage: callback })).resolves.toBe(true);
		expect(onMessage).toHaveBeenCalledWith(expect.anything(), callback);
	});

	it('refreshes the saved token when notifications are allowed', async () => {
		setPermission('granted');
		await push.init(app, user, { vapidKey: 'my-key' });

		expect(getToken).toHaveBeenCalledWith(expect.anything(), { vapidKey: 'my-key' });
		expect(setDoc).toHaveBeenCalledWith(
			{ path: 'users/user-1' },
			{ fcmToken: 'browser-token', fcmTokenUpdatedAt: 'SERVER_TIMESTAMP' },
			{ merge: true }
		);
	});

	it('does not ask for a token before the user allowed notifications', async () => {
		await push.init(app, user);
		expect(getToken).not.toHaveBeenCalled();
	});

	it('does not save tokens for signed-out visitors', async () => {
		setPermission('granted');
		await push.init(app, null);
		expect(getToken).not.toHaveBeenCalled();
	});

	it('does not fail when the token cannot be saved', async () => {
		setPermission('granted');
		setDoc.mockRejectedValueOnce(new Error('permission-denied'));

		await expect(push.init(app, user)).resolves.toBe(true);
	});
});

describe('canAskPermission', () => {
	it('is true for signed-in users who were not asked yet', async () => {
		await push.init(app, user);
		expect(push.canAskPermission()).toBe(true);
	});

	it('is false once the user answered', async () => {
		setPermission('denied');
		await push.init(app, user);
		expect(push.canAskPermission()).toBe(false);
	});

	it('is false for signed-out visitors and unsupported browsers', async () => {
		await push.init(app, null);
		expect(push.canAskPermission()).toBe(false);

		isSupported.mockResolvedValue(false);
		await push.init(app, user);
		expect(push.canAskPermission()).toBe(false);
	});
});

describe('enable', () => {
	it('saves the token when the user allows notifications', async () => {
		setPermission('default', 'granted');
		await push.init(app, user);

		await expect(push.enable()).resolves.toBe('browser-token');
		expect(Notification.requestPermission).toHaveBeenCalled();
		expect(setDoc).toHaveBeenCalledTimes(1);
	});

	it('saves nothing when the user blocks notifications', async () => {
		setPermission('default', 'denied');
		await push.init(app, user);

		await expect(push.enable()).resolves.toBeNull();
		expect(getToken).not.toHaveBeenCalled();
	});

	it('saves nothing when no token is returned', async () => {
		setPermission('default', 'granted');
		await push.init(app, user);
		getToken.mockResolvedValueOnce('');

		await expect(push.enable()).resolves.toBeNull();
		expect(setDoc).not.toHaveBeenCalled();
	});
});

describe('disable', () => {
	beforeEach(async () => {
		setPermission('granted');
		await push.init(app, user);
		vi.clearAllMocks();
	});

	it('removes the token saved by this browser', async () => {
		storedToken('browser-token');
		await push.disable();

		expect(updateDoc).toHaveBeenCalledWith(
			{ path: 'users/user-1' },
			{ fcmToken: 'DELETE_FIELD', fcmTokenUpdatedAt: 'DELETE_FIELD' }
		);
		expect(deleteToken).toHaveBeenCalled();
	});

	it('keeps the token saved by another browser', async () => {
		storedToken('other-browser-token');
		await push.disable();

		expect(updateDoc).not.toHaveBeenCalled();
		expect(deleteToken).toHaveBeenCalled();
	});

	it('never throws, so signing out is not blocked', async () => {
		getToken.mockRejectedValueOnce(new Error('offline'));
		await expect(push.disable()).resolves.toBeUndefined();
	});

	it('does nothing when notifications were never allowed', async () => {
		Notification.permission = 'default';
		await push.disable();
		expect(getToken).not.toHaveBeenCalled();
	});
});
