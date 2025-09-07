/**
 * Test script for the updated JSON Lines streaming implementation
 * Run this to verify that the streaming chat works correctly with the real API
 */

import StreamingChatService from "../services/streamingChat";

// Test function to verify streaming works
export async function testJSONLinesStreaming() {
  console.log("🚀 Testing JSON Lines Streaming Implementation...");

  const streamingService = new StreamingChatService();
  let fullAccumulatedResponse = "";
  let receivedChatId = "";
  let chunkCount = 0;

  return new Promise<void>((resolve, reject) => {
    streamingService.sendStreamingMessage(
      "Hello, can you tell me a short joke?",
      {
        onChunk: (chunk: string) => {
          chunkCount++;
          fullAccumulatedResponse += chunk;
          console.log(`📝 Chunk ${chunkCount}: "${chunk}"`);
        },
        onComplete: (fullResponse: string) => {
          console.log("✅ Stream completed!");
          console.log(`📊 Total chunks received: ${chunkCount}`);
          console.log(
            `💬 Full accumulated response: "${fullAccumulatedResponse}"`
          );
          console.log(`💬 Complete response from callback: "${fullResponse}"`);
          console.log(`🔑 Chat ID: ${receivedChatId}`);

          // Verify that accumulated response matches complete response
          if (fullAccumulatedResponse === fullResponse) {
            console.log("✅ Accumulated response matches complete response!");
          } else {
            console.log(
              "❌ Mismatch between accumulated and complete response"
            );
            console.log("Accumulated:", fullAccumulatedResponse);
            console.log("Complete:", fullResponse);
          }

          resolve();
        },
        onError: (error: Error) => {
          console.error("❌ Streaming error:", error);
          reject(error);
        },
        onChatIdReceived: (chatId: string) => {
          receivedChatId = chatId;
          console.log(`🔑 Received chat ID: ${chatId}`);
        },
      }
    );
  });
}

// Test function to verify conversation continuity
export async function testConversationContinuity() {
  console.log("🔄 Testing Conversation Continuity...");

  const streamingService = new StreamingChatService();

  // First message
  console.log("📤 Sending first message...");
  let chatId = "";

  await new Promise<void>((resolve, reject) => {
    streamingService.sendStreamingMessage("My name is Alex", {
      onChunk: (chunk: string) => {
        console.log(`First message chunk: "${chunk}"`);
      },
      onComplete: (fullResponse: string) => {
        console.log(`First message complete: "${fullResponse}"`);
        resolve();
      },
      onError: reject,
      onChatIdReceived: (id: string) => {
        chatId = id;
        console.log(`🔑 First message chat ID: ${id}`);
      },
    });
  });

  // Wait a moment
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Second message using the same chat ID
  console.log("📤 Sending second message with same chat ID...");

  await new Promise<void>((resolve, reject) => {
    streamingService.sendStreamingMessage(
      "What is my name?",
      {
        onChunk: (chunk: string) => {
          console.log(`Second message chunk: "${chunk}"`);
        },
        onComplete: (fullResponse: string) => {
          console.log(`Second message complete: "${fullResponse}"`);
          console.log("✅ Conversation continuity test completed!");
          resolve();
        },
        onError: reject,
        onChatIdReceived: (id: string) => {
          console.log(`🔑 Second message chat ID: ${id}`);
        },
      },
      chatId // Use the chat ID from the first message
    );
  });
}

// Run all tests
export async function runAllStreamingTests() {
  try {
    console.log("🧪 Starting comprehensive streaming tests...\n");

    await testJSONLinesStreaming();
    console.log("\n");

    await testConversationContinuity();
    console.log("\n");

    console.log("🎉 All streaming tests completed successfully!");
  } catch (error) {
    console.error("💥 Test failed:", error);
    throw error;
  }
}

// Simple test for debugging
export async function quickStreamingTest() {
  console.log("⚡ Quick streaming test...");

  const streamingService = new StreamingChatService();

  return new Promise<void>((resolve, reject) => {
    streamingService.sendStreamingMessage("Hi", {
      onChunk: (chunk: string) => {
        console.log(`Chunk: "${chunk}"`);
      },
      onComplete: (fullResponse: string) => {
        console.log(`Complete: "${fullResponse}"`);
        resolve();
      },
      onError: reject,
      onChatIdReceived: (chatId: string) => {
        console.log(`Chat ID: ${chatId}`);
      },
    });
  });
}
