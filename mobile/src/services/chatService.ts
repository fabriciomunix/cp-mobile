import { rtdb } from './firebase';
import { ref, push, set, onValue, off, serverTimestamp } from 'firebase/database';
import { ChatMessage, MessageTarget } from '../../../shared/types';

export const sendMessage = async (
  conversationId: string, 
  conversationType: 'direct' | 'group', 
  senderId: string, 
  text: string, 
  target: MessageTarget, 
  mentionedUserIds: string[]
) => {
  const messagesRef = ref(rtdb, `messages/${conversationId}`);
  const newMessageRef = push(messagesRef);
  
  const message: Omit<ChatMessage, 'id' | 'createdAt'> & { createdAt: object } = {
    conversationId,
    conversationType,
    senderId,
    text,
    target,
    mentionedUserIds,
    createdAt: serverTimestamp()
  };

  await set(newMessageRef, message);
  return newMessageRef.key;
};

export const subscribeToMessages = (conversationId: string, callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = ref(rtdb, `messages/${conversationId}`);
  
  onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const messages = Object.keys(data).map(key => ({
      ...data[key],
      id: key
    })).sort((a, b) => a.createdAt - b.createdAt);
    
    callback(messages);
  });

  return () => off(messagesRef);
};
