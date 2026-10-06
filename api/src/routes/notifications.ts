import { Router } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

export const notificationsRouter = Router();

notificationsRouter.post('/messages', async (req, res) => {
  const { conversationId, messageId, senderId } = req.body;

  try {
    const db = getFirestore();
    const groupDoc = await db.collection('groups').doc(conversationId).get();
    
    if (!groupDoc.exists) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const groupData = groupDoc.data()!;
    const policy = groupData.notificationPolicy;

    if (policy === 'disabled' || policy === 'direct_messages_only') {
      res.status(200).json({ status: 'ignored' });
      return;
    }

    let targetMemberIds: string[] = [];
    if (policy === 'all_group_messages') {
      targetMemberIds = groupData.memberIds.filter((id: string) => id !== senderId);
    }

    if (targetMemberIds.length === 0) {
      res.status(200).json({ status: 'no_recipients' });
      return;
    }

    const tokens: string[] = [];
    for (const memberId of targetMemberIds) {
      const devicesSnapshot = await db.collection('users').doc(memberId).collection('devices').get();
      devicesSnapshot.docs.forEach((doc: any) => {
        const data = doc.data();
        if (data.token) {
          tokens.push(data.token);
        }
      });
    }

    if (tokens.length > 0) {
      const messaging = getMessaging();
      await messaging.sendEachForMulticast({
        tokens,
        data: {
          conversationId,
          messageId
        },
        notification: {
          title: 'New message',
          body: 'You have a new message'
        }
      });
    }

    res.status(200).json({ status: 'success' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
