import request from 'supertest';
import { app } from '../src/app';
import { getFirestore } from 'firebase-admin/firestore';

jest.mock('firebase-admin/firestore', () => {
  const runTransactionMock = jest.fn((callback) => callback({
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ memberIds: ['user1'], memberLimit: 2 })
    }),
    update: jest.fn()
  }));

  return {
    getFirestore: jest.fn(() => ({
      runTransaction: runTransactionMock,
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({ id: 'group1' }))
      }))
    }))
  };
});

describe('POST /groups/:groupId/members', () => {
  it('returns 403 when group limit is reached', async () => {
    const firestoreMock = getFirestore();
    (firestoreMock.runTransaction as jest.Mock).mockImplementationOnce((callback: any) => {
      const transaction = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ memberIds: ['user1', 'user2'], memberLimit: 2 })
        }),
        update: jest.fn()
      };
      return callback(transaction);
    });

    const res = await request(app)
      .post('/groups/group1/members')
      .send({ uid: 'user3' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Group limit reached');
  });

  it('adds member when there is space', async () => {
    const res = await request(app)
      .post('/groups/group1/members')
      .send({ uid: 'user3' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });
});
