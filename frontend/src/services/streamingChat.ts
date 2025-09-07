import { ChatMessage } from "@/types/chat";

export interface StreamingChatResponse {
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
  onChatIdReceived?: (chatId: string) => void;
}

export class StreamingChatService {
  private static readonly API_URL = "http://4.204.10.63:8000/chat/stream";
  private abortController: AbortController | null = null;
  private chatId: string | null = null;

  /**
   * Send a streaming message to the chatbot API
   * @param message The user's message
   * @param callbacks Callbacks for handling streaming response
   * @param chatId Optional chat ID for continuing conversation
   * @returns Promise that resolves when the stream completes
   */
  async sendStreamingMessage(
    message: string,
    callbacks: StreamingChatResponse,
    chatId?: string
  ): Promise<void> {
    this.abortController = new AbortController();

    // Use provided chatId or stored chatId
    const currentChatId = chatId || this.chatId;

    try {
      const requestBody: any = {
        messages: [message],
        reasoning: false,
      };

      // Add chatId if we have one (for continuing conversation)
      if (currentChatId) {
        requestBody.chatId = currentChatId;
      }

      const response = await fetch(StreamingChatService.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain",
        },
        body: JSON.stringify(requestBody),
        signal: this.abortController.signal,
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if this is a streaming response or regular JSON
      const contentType = response.headers.get("content-type") || "";
      console.log("Content-Type:", contentType);

      if (!response.body) {
        // Try to get response as text if no body
        try {
          const text = await response.text();
          console.log("Response text:", text);
          if (text) {
            callbacks.onChunk(text);
            callbacks.onComplete(text);
            return;
          }
        } catch (e) {
          console.error("Failed to read response as text:", e);
        }
        throw new Error("No response body received");
      }

      // Check if it's a JSON response (non-streaming)
      if (contentType.includes("application/json")) {
        try {
          const jsonResponse = await response.json();
          console.log("JSON Response:", jsonResponse);

          // Extract chatId if present
          if (jsonResponse.chatId && callbacks.onChatIdReceived) {
            this.chatId = jsonResponse.chatId;
            callbacks.onChatIdReceived(jsonResponse.chatId);
          }

          // Extract message content
          const content =
            jsonResponse.content ||
            jsonResponse.message ||
            jsonResponse.response ||
            jsonResponse.text ||
            "";
          if (content) {
            callbacks.onChunk(content);
            callbacks.onComplete(content);
          } else {
            callbacks.onComplete(
              "I apologize, but I couldn't generate a response. Please try again."
            );
          }
          return;
        } catch (e) {
          console.error("Failed to parse JSON response:", e);
        }
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let receivedChatId = false;
      let buffer = ""; // Buffer for incomplete lines

      try {
        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            // Process any remaining data in buffer
            if (buffer.trim()) {
              this.processJsonLine(buffer.trim(), {
                fullResponse,
                receivedChatId,
                callbacks,
                onChatIdUpdate: (id) => {
                  this.chatId = id;
                  receivedChatId = true;
                },
                onContentUpdate: (content) => {
                  fullResponse += content;
                },
              });
            }
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          console.log("Raw chunk received:", JSON.stringify(chunk));

          // Add chunk to buffer
          buffer += chunk;

          // Process complete lines (split by newlines)
          const lines = buffer.split("\n");

          // Keep the last element as it might be incomplete
          buffer = lines.pop() || "";

          // Process each complete line
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
              const result = this.processJsonLine(trimmedLine, {
                fullResponse,
                receivedChatId,
                callbacks,
                onChatIdUpdate: (id) => {
                  this.chatId = id;
                  receivedChatId = true;
                },
                onContentUpdate: (content) => {
                  fullResponse += content;
                },
              });

              // Update local variables with results
              fullResponse = result.fullResponse;
              receivedChatId = result.receivedChatId;

              // Check if we received endResponse
              if (result.isEndResponse) {
                callbacks.onComplete(fullResponse);
                return;
              }
            }
          }
        }

        callbacks.onComplete(fullResponse);
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Stream aborted");
        return;
      }

      console.error("Streaming error:", error);
      callbacks.onError(
        error instanceof Error ? error : new Error("Unknown streaming error")
      );
    }
  }

  /**
   * Process a single JSON line from the streaming response
   */
  private processJsonLine(
    line: string,
    context: {
      fullResponse: string;
      receivedChatId: boolean;
      callbacks: StreamingChatResponse;
      onChatIdUpdate: (id: string) => void;
      onContentUpdate: (content: string) => void;
    }
  ): {
    fullResponse: string;
    receivedChatId: boolean;
    isEndResponse: boolean;
  } {
    try {
      const parsed = JSON.parse(line);
      console.log("Parsed JSON line:", parsed);

      // Handle chatId if present and not already received
      if (parsed.chatID && !context.receivedChatId) {
        context.onChatIdUpdate(parsed.chatID);
        if (context.callbacks.onChatIdReceived) {
          context.callbacks.onChatIdReceived(parsed.chatID);
        }
        console.log("Received chatId:", parsed.chatID);
        context.receivedChatId = true;
      }

      // Handle different response types
      if (parsed.type === "response" && parsed.botResponse) {
        // This is a content chunk
        const content = parsed.botResponse;
        context.onContentUpdate(content);
        context.callbacks.onChunk(content);
        console.log("Bot response chunk:", content);
      } else if (parsed.type === "endResponse") {
        // This is the end of the stream
        console.log("Received endResponse, stream complete");
        return {
          fullResponse: context.fullResponse,
          receivedChatId: context.receivedChatId,
          isEndResponse: true,
        };
      } else if (parsed.type === "endReasoning") {
        // Skip reasoning end markers
        console.log("Skipping endReasoning");
      } else {
        // Unknown format, log for debugging
        console.log("Unknown JSON line format:", parsed);
      }

      return {
        fullResponse: context.fullResponse,
        receivedChatId: context.receivedChatId,
        isEndResponse: false,
      };
    } catch (error) {
      console.error("Failed to parse JSON line:", line, error);
      // If it's not JSON, treat as plain text
      if (line.trim()) {
        context.onContentUpdate(line);
        context.callbacks.onChunk(line);
      }
      return {
        fullResponse: context.fullResponse,
        receivedChatId: context.receivedChatId,
        isEndResponse: false,
      };
    }
  }

  /**
   * Cancel the current streaming request
   */
  cancelStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
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
   * Test connection to the streaming API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(StreamingChatService.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: ["test"],
          reasoning: false,
        }),
      });

      console.log("API connection test - Status:", response.status);
      return response.status < 500; // Accept 4xx errors as "connected" but 5xx as server issues
    } catch (error) {
      console.error("API connection test failed:", error);
      return false;
    }
  }
}

export default StreamingChatService;
