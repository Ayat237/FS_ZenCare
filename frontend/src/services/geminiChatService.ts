import { ChatMessage } from "@/types/chat";

export interface ChatResponse {
  message: string;
  error?: string;
}

export class ChatService {
  private static readonly API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  private static readonly API_KEY = "AIzaSyCpMsjOQmrCVJm3NvsdTwS6VvK8xF7evjs";

  /**
   * Send a message to the Gemini API
   * @param message The user's message
   * @returns Promise that resolves with the bot's response
   */
  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      console.log("Sending message to Gemini API:", message);

      const response = await fetch(ChatService.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": ChatService.API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, response: ${errorText}`
        );
      }

      const responseData = await response.json();
      console.log("Gemini API response:", responseData);

      // Extract the response text from Gemini's response format
      const botMessage =
        responseData?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I apologize, but I couldn't generate a response. Please try again.";

      return {
        message: botMessage,
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      return {
        message:
          "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Test connection to the Gemini API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(ChatService.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": ChatService.API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Hello, this is a test message.",
                },
              ],
            },
          ],
        }),
      });

      console.log("Gemini API connection test - Status:", response.status);
      return response.status < 500; // Accept 4xx errors as "connected" but 5xx as server issues
    } catch (error) {
      console.error("Gemini API connection test failed:", error);
      return false;
    }
  }
}

export default ChatService;
