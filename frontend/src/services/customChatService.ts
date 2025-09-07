import { ChatMessage } from "@/types/chat";
import { getChatbotUrl } from "@/config/api";

export interface ChatResponse {
  message: string;
  chatId?: string;
  error?: string;
}

export interface AttachmentUploadResponse {
  url: string;
  success: boolean;
  error?: string;
}

export class CustomChatService {
  private static readonly API_URL = `${getChatbotUrl()}/chat`;
  private static readonly UPLOAD_URL = `${getChatbotUrl()}/chat/upload`;

  private chatId: string | null = null;

  /**
   * Upload a file attachment and get the URL
   * @param fileUri Local file URI
   * @param fileName File name
   * @returns Promise that resolves with the uploaded file URL
   */
  async uploadAttachment(
    fileUri: string,
    fileName: string
  ): Promise<AttachmentUploadResponse> {
    try {
      console.log("📤 Uploading attachment:", fileName, "from:", fileUri);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        type: this.getMimeType(fileName),
        name: fileName,
      } as any);

      console.log("📡 Sending to upload URL:", CustomChatService.UPLOAD_URL);

      const response = await fetch(CustomChatService.UPLOAD_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("📥 Upload response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Upload error response:", errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Upload response data:", result);

      // Try different possible response formats
      const uploadedUrl =
        result.url || result.file_url || result.link || result.downloadURL;

      if (!uploadedUrl) {
        console.error("❌ No URL found in upload response:", result);
        throw new Error("Upload response missing file URL");
      }

      return {
        url: uploadedUrl,
        success: true,
      };
    } catch (error: any) {
      console.error("❌ Upload attachment error:", error);
      return {
        url: "",
        success: false,
        error: error.message || "Failed to upload attachment",
      };
    }
  }

  /**
   * Send a message to the custom chat API
   * @param message The user's message
   * @param attachmentUrls Array of uploaded attachment URLs
   * @returns Promise that resolves with the bot's response
   */
  async sendMessage(
    message: string,
    attachmentUrls: string[] = []
  ): Promise<ChatResponse> {
    try {
      console.log("Sending message to custom API:", message);
      console.log("Chat ID:", this.chatId);
      console.log("Attachments:", attachmentUrls);

      // Prepare messages array
      const messages: string[] = [];

      // Add attachment URLs first if any
      if (attachmentUrls.length > 0) {
        messages.push(...attachmentUrls);
      }

      // Add the text message
      if (message.trim()) {
        messages.push(message.trim());
      }

      // Prepare request body
      const requestBody: any = {
        messages,
        reasoning: false,
      };

      // Add chat ID if we have one (for continuing conversation)
      if (this.chatId) {
        requestBody.chat_id = this.chatId;
      }

      console.log("Request body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(CustomChatService.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Custom API error response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, response: ${errorText}`
        );
      }

      const responseData = await response.json();
      console.log("Custom API response:", responseData);

      // Extract chat ID from response if it's a new conversation
      if (responseData.chat_id && !this.chatId) {
        this.chatId = responseData.chat_id;
        console.log("New chat ID received:", this.chatId);
      }

      return {
        message:
          responseData.message ||
          responseData.response ||
          "No response received",
        chatId: this.chatId || undefined,
      };
    } catch (error: any) {
      console.error("Send message error:", error);
      return {
        message: "",
        error: error.message || "Failed to send message",
      };
    }
  }

  /**
   * Test connection to the custom API
   * @returns Promise that resolves with connection status
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(CustomChatService.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: ["test"],
          reasoning: false,
        }),
      });

      return response.status < 500;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  /**
   * Get the current chat ID
   */
  getChatId(): string | null {
    return this.chatId;
  }

  /**
   * Set the chat ID (useful for restoring conversations)
   */
  setChatId(chatId: string | null): void {
    this.chatId = chatId;
  }

  /**
   * Clear the current chat ID (start new conversation)
   */
  clearChatId(): void {
    this.chatId = null;
  }

  /**
   * Get MIME type from file name
   */
  private getMimeType(fileName: string): string {
    const extension = fileName.toLowerCase().split(".").pop();
    const mimeTypes: { [key: string]: string } = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      txt: "text/plain",
      mp4: "video/mp4",
      mp3: "audio/mpeg",
    };
    return mimeTypes[extension || ""] || "application/octet-stream";
  }
}

export default CustomChatService;
