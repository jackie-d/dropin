import { describe, it, expect, vi } from 'vitest';
import { truncate, buildPayload, sendMessageNotification, PREVIEW_LENGTH, NOTIFICATION_TITLE } from '../../functions/lib/message-notification.js';

function fakeDb(users) {
	return {
		collection: vi.fn(() => ({
			doc: vi.fn((id) => ({
				get: vi.fn(async () => ({
					exists: id in users,
					data: () => users[id]
				}))
			}))
		}))
	};
}

const params = { userId: 'alice', recipientId: 'bob' };

describe('truncate', () => {
	it('keeps short texts as they are', () => {
		expect(truncate('hello')).toBe('hello');
		expect(truncate('x'.repeat(PREVIEW_LENGTH))).toBe('x'.repeat(PREVIEW_LENGTH));
	});

	it('cuts long texts and adds an ellipsis', () => {
		expect(truncate('x'.repeat(PREVIEW_LENGTH + 1))).toBe('x'.repeat(PREVIEW_LENGTH) + '...');
	});

	it('handles missing text', () => {
		expect(truncate(undefined)).toBe('');
		expect(truncate(null)).toBe('');
	});
});

describe('buildPayload', () => {
	it('sends a data message identifying the sender', () => {
		expect(buildPayload('token-1', { message: 'Hi' }, 'alice')).toEqual({
			token: 'token-1',
			data: { title: NOTIFICATION_TITLE, body: 'Hi', fromId: 'alice' }
		});
	});
});

describe('sendMessageNotification', () => {
	it('notifies the recipient with the sender as fromId', async () => {
		const messaging = { send: vi.fn(async () => 'msg-id') };
		const db = fakeDb({ bob: { fcmToken: 'bob-token' } });
		vi.spyOn(console, 'log').mockImplementation(() => {});

		const result = await sendMessageNotification({ db, messaging }, params, { message: 'Hello Bob!' });

		expect(result).toEqual({ success: true, messageId: 'msg-id' });
		expect(messaging.send).toHaveBeenCalledWith({
			token: 'bob-token',
			data: { title: NOTIFICATION_TITLE, body: 'Hello Bob!', fromId: 'alice' }
		});
	});

	it('skips recipients without an FCM token', async () => {
		const messaging = { send: vi.fn() };
		const result = await sendMessageNotification({ db: fakeDb({ bob: {} }), messaging }, params, { message: 'Hi' });

		expect(result).toEqual({ skipped: 'no-token' });
		expect(messaging.send).not.toHaveBeenCalled();
	});

	it('skips events without message data', async () => {
		const db = fakeDb({});
		const result = await sendMessageNotification({ db, messaging: { send: vi.fn() } }, params, undefined);

		expect(result).toEqual({ skipped: 'no-message' });
		expect(db.collection).not.toHaveBeenCalled();
	});

	it('fails when the recipient does not exist', async () => {
		await expect(
			sendMessageNotification({ db: fakeDb({}), messaging: { send: vi.fn() } }, params, { message: 'Hi' })
		).rejects.toThrow('user bob does not exist');
	});

	it('reports send errors instead of crashing', async () => {
		const messaging = { send: vi.fn(async () => { throw { code: 'messaging/registration-token-not-registered' }; }) };
		const db = fakeDb({ bob: { fcmToken: 'stale' } });

		const result = await sendMessageNotification({ db, messaging }, params, { message: 'Hi' });
		expect(result).toEqual({ error: 'messaging/registration-token-not-registered' });
	});
});
