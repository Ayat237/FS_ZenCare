// Chat related types

export interface ChatMessage {
  role: 'client' | 'bot';
  data: string;
  timestamp?: Date | string; // Can be Date object or ISO string
}

export interface ChatConversation {
  userId: string;
  messages: ChatMessage[];
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}