import request from 'supertest';
import { app } from '../src/app';

const sendEachForMulticastMock = jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0 });

jest.mock('firebase-admin/messaging', () => ({
  getMessaging: jest.fn(() => ({
    sendEachForMulticast: sendEachForMulticastMock
  }))
}));

jest.mock('firebase-admin/firestore', () => {
  return {
    getFirestore: jest.fn(() => ({
      collection: jest.fn((col) => {
        if (col === 'groups') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ memberIds: ['user1', 'user2'], notificationPolicy: 'all_group_messages' })
              })
            }))
          };
        }
        if (col === 'users') {
          return {
            doc: jest.fn(() => ({
              collection: jest.fn(() => ({
                get: jest.fn().mockResolvedValue({
                  docs: [{ data: () => ({ token: 'token123' }) }]
                })
              }))
            }))
          };
        }
        return { doc: jest.fn() };
      })
    }))
  };
});

describe('POST /notifications/messages', () => {
  beforeEach(() => {
    sendEachForMulticastMock.mockClear();
  });

  it('calculates recipients and sends FCM for all_group_messages', async () => {
    const res = await request(app)
      .post('/notifications/messages')
      .send({
        conversationId: 'group1',
        messageId: 'msg1',
        senderId: 'user1'
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(sendEachForMulticastMock).toHaveBeenCalled();
  });
});
