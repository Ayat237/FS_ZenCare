import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FlatList } from "react-native";
import { sendCustomChatMessage, clearMessages } from "@/store/chat/chatSlice";
import { RootState, AppDispatch } from "@/store";

/**
 * Custom hook for chat functionality with custom backend API
 * @param userId - The user ID for the chat (maintained for compatibility)
 * @returns Chat state and functions
 */
export const useChat = (userId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, loading, error, chatId } = useSelector(
    (state: RootState) => state.chat
  );
  const flatListRef = useRef<FlatList>(null);

  // Clean up messages when unmounting
  useEffect(() => {
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Send a message using the custom chat API with optional attachments
  const sendMessage = (
    message: string,
    attachments?: Array<{
      type: "image" | "document";
      uri: string;
      name?: string;
    }>
  ) => {
    if (!message.trim() && (!attachments || attachments.length === 0)) return;

    dispatch(
      sendCustomChatMessage({
        message: message.trim(),
        attachments,
      })
    );
  };

  return {
    messages,
    loading,
    error,
    chatId,
    sendMessage,
    flatListRef,
  };
};
