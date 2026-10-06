import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { sendMessage, subscribeToMessages } from '../services/chatService';
import { ChatMessage } from '../../../shared/types';

export const ChatScreen = ({ route }: any) => {
  const { conversationId, type } = route?.params || { conversationId: 'group1', type: 'group' };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToMessages(conversationId, setMessages);
    return () => unsubscribe();
  }, [conversationId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(conversationId, type, 'my-uid', text, { type: 'conversation' }, []);
    setText('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageBubble}>
            <Text>{item.text}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhuma mensagem</Text>}
      />
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Mensagem..." />
        <Button title="Enviar" onPress={handleSend} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  messageBubble: { padding: 10, margin: 10, backgroundColor: '#fff', borderRadius: 10 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, marginRight: 10, height: 40 }
});
