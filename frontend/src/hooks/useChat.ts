import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FlatList } from 'react-native';
import { fetchMessages, sendChatMessage, clearMessages } from '@/store/chat/chatSlice';
import { RootState, AppDispatch } from '@/store';

/**
 * Custom hook for chat functionality
 * @param userId - The user ID for the chat
 * @returns Chat state and functions
 */
export const useChat = (userId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, loading, error, conversationId } = useSelector((state: RootState) => state.chat);
  const flatListRef = useRef<FlatList>(null);

  // Fetch messages when component mounts
  useEffect(() => {
    if (userId) {
      dispatch(fetchMessages(userId));
    }
    
    // Clean up messages when unmounting
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch, userId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Send a message
  const sendMessage = (message: string) => {
    if (!message.trim() || !userId) return;
    dispatch(sendChatMessage({ userId, message: message.trim() }));
  };

  return {
    messages,
    loading,
    error,
    conversationId,
    sendMessage,
    flatListRef,
  };
};