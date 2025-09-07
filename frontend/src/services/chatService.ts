import { ChatMessage } from "@/types/chat";

export interface ChatResponse {
  message: string;
  chatId: string;
  error?: string;
}

export class ChatService {
  private static readonly API_URL = "http://4.204.10.63:8000/chat";
  private chatId: string | null = null;

  /**
   * Send a message to the chatbot API
   * @param message The user's message
   * @param chatId Optional chat ID for continuing conversation
   * @returns Promise that resolves with the bot's response
   */
  async sendMessage(message: string, chatId?: string): Promise<ChatResponse> {
    try {
      // Use provided chatId or stored chatId
      const currentChatId = chatId || this.chatId;

      const requestBody: any = {
        messages: [message],
        reasoning: false,
      };

      // Add chatId if we have one (for continuing conversation)
      if (currentChatId) {
        requestBody.chatId = currentChatId;
      }

      console.log("Sending message to chat API:", {
        url: ChatService.API_URL,
        body: requestBody,
      });

      const response = await fetch(ChatService.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Chat API response:", responseData);

      // Extract the response message and chatId
      const botMessage =
        responseData.message ||
        responseData.response ||
        responseData.content ||
        responseData.text ||
        "I apologize, but I couldn't generate a response. Please try again.";

      const responseChatId =
        responseData.chatId ||
        responseData.chatID ||
        responseData.chat_id ||
        currentChatId ||
        "";

      // Store the chatId for future messages
      if (responseChatId) {
        this.chatId = responseChatId;
      }

      return {
        message: botMessage,
        chatId: responseChatId,
      };
    } catch (error) {
      console.error("Chat API error:", error);
      return {
        message:
          "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        chatId: this.chatId || "",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get the current chat ID
   */
  getChatId(): string | null {
    return this.chatId;
  }

  /**
   * Set the chat ID
   */
  setChatId(chatId: string): void {
    this.chatId = chatId;
  }

  /**
   * Clear the chat ID (start new conversation)
   */
  clearChatId(): void {
    this.chatId = null;
  }

  /**
   * Test connection to the chat API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(ChatService.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: ["test"],
          reasoning: false,
        }),
      });

      console.log("Chat API connection test - Status:", response.status);
      return response.status < 500; // Accept 4xx errors as "connected" but 5xx as server issues
    } catch (error) {
      console.error("Chat API connection test failed:", error);
      return false;
    }
  }
}

export default ChatService;
