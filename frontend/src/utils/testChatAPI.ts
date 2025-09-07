/**
 * Test utility for the direct chat API
 * This can be used to test the API format and response structure
 */

import ChatService from "../services/chatService";

export const testChatAPI = async (message: string = "Hello") => {
  console.log("Testing chat API with message:", message);

  try {
    const chatService = new ChatService();
    const response = await chatService.sendMessage(message);

    console.log("Chat API Response:");
    console.log("- Message:", response.message);
    console.log("- Chat ID:", response.chatId);
    console.log("- Error:", response.error || "None");

    return response;
  } catch (error) {
    console.error("Chat API test error:", error);
    throw error;
  }
};

export const testChatConversation = async () => {
  console.log("Testing chat conversation flow...");

  try {
    const chatService = new ChatService();

    // First message
    console.log("Sending first message...");
    const firstResponse = await chatService.sendMessage("My name is Alex");
    console.log("First response:", firstResponse.message);
    console.log("Chat ID:", firstResponse.chatId);

    // Second message using the same chat ID
    console.log("Sending second message with same chat ID...");
    const secondResponse = await chatService.sendMessage(
      "What is my name?",
      firstResponse.chatId
    );
    console.log("Second response:", secondResponse.message);
    console.log("Chat ID:", secondResponse.chatId);

    return {
      firstResponse,
      secondResponse,
    };
  } catch (error) {
    console.error("Chat conversation test error:", error);
    throw error;
  }
};

export const testChatConnection = async (): Promise<boolean> => {
  try {
    const chatService = new ChatService();
    return await chatService.testConnection();
  } catch (error) {
    console.error("Chat connection test failed:", error);
    return false;
  }
};
