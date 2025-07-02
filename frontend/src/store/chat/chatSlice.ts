import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage, ChatConversation } from '@/types';
import { sendMessage, getMessages } from '@/services/api';

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  conversationId: string | null;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  conversationId: null,
};

// Async thunks
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (userId: string, { rejectWithValue }) => {
    try {
      const messages = await getMessages(userId);
      return messages;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch messages');
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ userId, message }: { userId: string; message: string }, { rejectWithValue }) => {
    try {
      const response = await sendMessage({ userId, message });
      return {
        message: response.message,
        conversationId: response.conversationId,
        userMessage: message,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<ChatMessage[]>) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Send message
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action: PayloadAction<{
        message: string;
        conversationId: string;
        userMessage: string;
      }>) => {
        state.loading = false;
        state.conversationId = action.payload.conversationId;
        
        // Add user message
        state.messages.push({
          role: 'client',
          data: action.payload.userMessage,
          timestamp: new Date().toISOString(), // Store as ISO string to avoid serialization issues
        });
        
        // Add bot response
        state.messages.push({
          role: 'bot',
          data: action.payload.message,
          timestamp: new Date().toISOString(), // Store as ISO string to avoid serialization issues
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMessages } = chatSlice.actions;
export default chatSlice.reducer;