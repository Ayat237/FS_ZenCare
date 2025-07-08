/**
 * Test script for Custom Chat API Integration
 *
 * This script tests the custom backend API integration including:
 * - Basic message sending
 * - Chat ID management
 * - Connection testing
 *
 * Run this in a React Native environment or Node.js with fetch polyfill
 */

import CustomChatService from "../services/customChatService";

class CustomAPITest {
  private chatService: CustomChatService;

  constructor() {
    this.chatService = new CustomChatService();
  }

  /**
   * Test basic API connectivity
   */
  async testConnection(): Promise<void> {
    console.log("🔍 Testing API connection...");
    try {
      const isConnected = await this.chatService.testConnection();
      console.log(`✅ Connection test: ${isConnected ? "SUCCESS" : "FAILED"}`);
    } catch (error) {
      console.error("❌ Connection test failed:", error);
    }
  }

  /**
   * Test sending a simple message (should create new chat ID)
   */
  async testFirstMessage(): Promise<void> {
    console.log("\n📝 Testing first message...");
    try {
      const response = await this.chatService.sendMessage(
        "Hello, this is a test message"
      );

      console.log("📨 Response:", response);
      console.log("🆔 Chat ID received:", response.chatId);

      if (response.error) {
        console.error("❌ Error in response:", response.error);
      } else {
        console.log("✅ First message sent successfully");
      }
    } catch (error) {
      console.error("❌ First message test failed:", error);
    }
  }

  /**
   * Test sending a follow-up message (should use existing chat ID)
   */
  async testFollowUpMessage(): Promise<void> {
    console.log("\n📝 Testing follow-up message...");
    try {
      const currentChatId = this.chatService.getChatId();
      console.log("🆔 Using existing chat ID:", currentChatId);

      const response = await this.chatService.sendMessage(
        "Can you help me with a medical question?"
      );

      console.log("📨 Response:", response);

      if (response.error) {
        console.error("❌ Error in response:", response.error);
      } else {
        console.log("✅ Follow-up message sent successfully");
      }
    } catch (error) {
      console.error("❌ Follow-up message test failed:", error);
    }
  }

  /**
   * Test chat ID management
   */
  async testChatIdManagement(): Promise<void> {
    console.log("\n🆔 Testing chat ID management...");

    // Test getting initial chat ID (should be null)
    const initialChatId = this.chatService.getChatId();
    console.log("Initial chat ID:", initialChatId);

    // Test setting a custom chat ID
    this.chatService.setChatId("test-chat-id-123");
    const customChatId = this.chatService.getChatId();
    console.log("Custom chat ID set:", customChatId);

    // Test clearing chat ID
    this.chatService.clearChatId();
    const clearedChatId = this.chatService.getChatId();
    console.log("Chat ID after clearing:", clearedChatId);

    console.log("✅ Chat ID management test completed");
  }

  /**
   * Test message with attachment URLs (simulated)
   */
  async testMessageWithAttachments(): Promise<void> {
    console.log("\n📎 Testing message with attachments...");
    try {
      const mockAttachmentUrls = [
        "https://example.com/image1.jpg",
        "https://example.com/document.pdf",
      ];

      const response = await this.chatService.sendMessage(
        "Please analyze these attachments",
        mockAttachmentUrls
      );

      console.log("📨 Response:", response);

      if (response.error) {
        console.error("❌ Error in response:", response.error);
      } else {
        console.log("✅ Message with attachments sent successfully");
      }
    } catch (error) {
      console.error("❌ Attachment message test failed:", error);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log("🚀 Starting Custom API Integration Tests\n");
    console.log("API URL:", "http://4.204.10.63:8000/chat");
    console.log("=".repeat(50));

    await this.testConnection();
    await this.testChatIdManagement();
    await this.testFirstMessage();
    await this.testFollowUpMessage();
    await this.testMessageWithAttachments();

    console.log("\n" + "=".repeat(50));
    console.log("🏁 All tests completed");
  }
}

// Export for use in development/testing
export default CustomAPITest;

// Example usage:
/*
const apiTest = new CustomAPITest();
apiTest.runAllTests().catch(console.error);
*/

/**
 * Quick test function for console testing
 */
export const runQuickTest = async (): Promise<void> => {
  const test = new CustomAPITest();
  await test.runAllTests();
};

/**
 * Test only connection
 */
export const testConnectionOnly = async (): Promise<boolean> => {
  const chatService = new CustomChatService();
  return await chatService.testConnection();
};
