/**
 * Test utility for the Gemini API
 * This can be used to test the API and response structure
 */

import ChatService from "../services/geminiChatService";

export const testGeminiAPI = async (message: string = "Hello") => {
  console.log("Testing Gemini API with message:", message);

  try {
    const chatService = new ChatService();
    const response = await chatService.sendMessage(message);

    console.log("Gemini API Response:");
    console.log("- Message:", response.message);
    console.log("- Error:", response.error || "None");

    return response;
  } catch (error) {
    console.error("Gemini API test error:", error);
    throw error;
  }
};

export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    const chatService = new ChatService();
    return await chatService.testConnection();
  } catch (error) {
    console.error("Gemini connection test failed:", error);
    return false;
  }
};

export const testGeminiConversation = async () => {
  console.log("Testing Gemini conversation flow...");

  try {
    const chatService = new ChatService();

    // First message
    console.log("Sending first message...");
    const firstResponse = await chatService.sendMessage("My name is Alex");
    console.log("First response:", firstResponse.message);

    // Second message
    console.log("Sending second message...");
    const secondResponse = await chatService.sendMessage("What is my name?");
    console.log("Second response:", secondResponse.message);

    return {
      firstResponse,
      secondResponse,
    };
  } catch (error) {
    console.error("Gemini conversation test error:", error);
    throw error;
  }
};
