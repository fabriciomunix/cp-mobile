import { Router } from 'express';
import { getFirestore } from 'firebase-admin/firestore';

export const groupsRouter = Router();

groupsRouter.post('/:groupId/members', async (req, res) => {
  const { groupId } = req.params;
  const { uid } = req.body;

  try {
    const db = getFirestore();
    const groupRef = db.collection('groups').doc(groupId);

    await db.runTransaction(async (transaction: any) => {
      const doc = await transaction.get(groupRef);
      if (!doc.exists) {
        throw new Error('Group not found');
      }

      const data = doc.data()!;
      if (data.memberIds.length >= data.memberLimit) {
        throw new Error('Group limit reached');
      }

      transaction.update(groupRef, {
        memberIds: [...data.memberIds, uid]
      });
    });

    res.status(200).json({ status: 'success' });
  } catch (error: any) {
    if (error.message === 'Group limit reached') {
      res.status(403).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});
