import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage } from "@/types/chat";
import CustomChatService from "@/services/customChatService";

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  chatId: string | null;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  chatId: null,
};

// Custom API chat message thunk with attachments
export const sendCustomChatMessage = createAsyncThunk(
  "chat/sendCustomChatMessage",
  async (
    {
      message,
      attachments,
    }: {
      message: string;
      attachments?: Array<{
        type: "image" | "document";
        uri: string;
        name?: string;
      }>;
    },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as any;
      const currentChatId = state.chat.chatId;

      const chatService = new CustomChatService();

      // Set the chat ID if we have one
      if (currentChatId) {
        chatService.setChatId(currentChatId);
      }

      let attachmentUrls: string[] = [];

      // Upload attachments first if any
      if (attachments && attachments.length > 0) {
        console.log("Uploading attachments...");

        for (const attachment of attachments) {
          const uploadResult = await chatService.uploadAttachment(
            attachment.uri,
            attachment.name || `file_${Date.now()}`
          );

          if (uploadResult.success && uploadResult.url) {
            attachmentUrls.push(uploadResult.url);
          } else {
            console.warn("Failed to upload attachment:", uploadResult.error);
            // Continue with other attachments even if one fails
          }
        }
      }

      console.log("Uploaded attachment URLs:", attachmentUrls);

      // Send message with attachment URLs
      const response = await chatService.sendMessage(message, attachmentUrls);

      if (response.error) {
        return rejectWithValue(response.error);
      }

      return {
        userMessage: message,
        botMessage: response.message,
        chatId: response.chatId,
        attachmentUrls,
      };
    } catch (error: any) {
      console.error("Send message error:", error);
      return rejectWithValue(error.message || "Failed to send message");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
      state.chatId = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setChatId: (state, action: PayloadAction<string | null>) => {
      state.chatId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Custom chat API
      .addCase(sendCustomChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendCustomChatMessage.fulfilled, (state, action) => {
        state.loading = false;

        // Set chat ID if received
        if (action.payload.chatId) {
          state.chatId = action.payload.chatId;
        }

        // Add user message with attachments
        const userMessage: ChatMessage = {
          role: "client",
          data: action.payload.userMessage,
          timestamp: new Date().toISOString(),
        };

        // Add attachment URLs to user message if any
        if (
          action.payload.attachmentUrls &&
          action.payload.attachmentUrls.length > 0
        ) {
          userMessage.attachments = action.payload.attachmentUrls.map(
            (url) => ({
              type:
                url.includes(".jpg") ||
                url.includes(".png") ||
                url.includes(".jpeg") ||
                url.includes(".gif")
                  ? "image"
                  : ("document" as const),
              uri: url,
              name: url.split("/").pop() || "attachment",
            })
          );
        }

        state.messages.push(userMessage);

        // Add bot message
        state.messages.push({
          role: "bot",
          data: action.payload.botMessage,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendCustomChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addMessage,
  clearMessages,
  setLoading,
  setError,
  clearError,
  setChatId,
} = chatSlice.actions;
export default chatSlice.reducer;
