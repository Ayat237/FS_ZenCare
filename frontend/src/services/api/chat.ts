import axios from 'axios';
import apiClient from './apiClient';
import { ChatMessage, ChatConversation } from '@/types';
import { getChatbotUrl } from '@/config/api';

// Get the chatbot base URL from the centralized configuration
const CHATBOT_BASE_URL = getChatbotUrl();

// Chatbot specific API client
const chatbotClient = axios.create({
  baseURL: CHATBOT_BASE_URL,
});

// Type definitions

export interface SendMessageRequest {
  userId: string;
  message: string;
}

export interface SendMessageResponse {
  message: string;
  conversationId: string;
}

// API functions
export const sendMessage = async (data: SendMessageRequest): Promise<SendMessageResponse> => {
  // Use the chatbot-specific client instead of the general apiClient
  const response = await chatbotClient.post('/api/chat', data);
  return response.data;
};

export const getMessages = async (userId: string): Promise<ChatMessage[]> => {
  // Use the chatbot-specific client instead of the general apiClient
  const response = await chatbotClient.get(`/api/chat/${userId}`);
  return response.data;
};