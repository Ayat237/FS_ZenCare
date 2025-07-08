import { ErrorHandlerClass, logger } from "../../utils/index.js";
import { nanoid } from "nanoid";
import { uploadToCloudinary } from "../../utils/cloudinary.utils.js";

// Real AI API configuration
const REAL_AI_API_URL = "http://4.204.10.63:8000/chat";

// In-memory storage for chat sessions (in production, use Redis or database)
const chatSessions = new Map();

/**
 * Send a message to the chat API
 * This simulates an AI response - replace with actual AI integration
 */
export const sendMessage = async (req, res, next) => {
  const { messages, reasoning = false, chat_id } = req.body;

  try {
    logger.info("Received chat message:", { messages, reasoning, chat_id });

    // Get or create chat session
    let sessionId = chat_id;
    if (!sessionId) {
      sessionId = `chat_${nanoid(12)}`;
      chatSessions.set(sessionId, {
        id: sessionId,
        messages: [],
        createdAt: new Date(),
        real_chat_id: null, // Will store the real AI's chat ID
      });
      logger.info("Created new chat session:", sessionId);
    }

    // Get existing session
    const session = chatSessions.get(sessionId);
    if (!session) {
      return next(
        new ErrorHandlerClass(
          "Chat session not found",
          404,
          "Chat session error"
        )
      );
    }

    // Add user messages to session
    const userMessages = messages.filter((msg) => !msg.startsWith("http"));
    const attachmentUrls = messages.filter((msg) => msg.startsWith("http"));

    session.messages.push({
      role: "user",
      content: userMessages.join(" "),
      attachments: attachmentUrls,
      timestamp: new Date(),
    });

    // Generate AI response using the real AI API
    const aiResponse = await callRealAIAPI(
      userMessages,
      attachmentUrls,
      reasoning,
      sessionId
    );

    session.messages.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    });

    // Update session
    chatSessions.set(sessionId, session);

    logger.info("Chat response generated for session:", sessionId);

    // Get the real AI chat ID for logging
    const realChatId = session.real_chat_id;

    res.status(200).json({
      success: true,
      message: aiResponse,
      chat_id: sessionId,
      session_info: {
        total_messages: session.messages.length,
        created_at: session.createdAt,
        real_ai_chat_id: realChatId, // Include real AI chat ID for debugging
      },
    });
  } catch (error) {
    logger.error("Error in sendMessage:", error);
    return next(
      new ErrorHandlerClass(
        "Failed to process chat message",
        500,
        "Chat processing error"
      )
    );
  }
};

/**
 * Upload a file for chat attachments
 */
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(
        new ErrorHandlerClass("No file provided", 400, "File upload error")
      );
    }

    logger.info("Uploading file:", req.file.originalname);

    // Upload to Cloudinary (assuming you have Cloudinary configured)
    let fileUrl;
    try {
      const uploadResult = await uploadToCloudinary(
        req.file.path,
        `chat_attachments/${Date.now()}_${req.file.originalname}`
      );
      fileUrl = uploadResult.secure_url;
      logger.info("File uploaded to Cloudinary:", fileUrl);
    } catch (cloudinaryError) {
      // Fallback: provide local file URL if Cloudinary fails
      logger.warn(
        "Cloudinary upload failed, using local URL:",
        cloudinaryError.message
      );
      fileUrl = `${req.protocol}://${req.get("host")}/uploads/general/${
        req.file.filename
      }`;
    }

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      url: fileUrl,
      file_info: {
        original_name: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploaded_at: new Date(),
      },
    });
  } catch (error) {
    logger.error("Error in uploadFile:", error);
    return next(
      new ErrorHandlerClass("Failed to upload file", 500, "File upload error")
    );
  }
};

/**
 * Call the real AI API at http://4.204.10.63:8000/chat
 * This forwards the request to the actual AI model
 */
async function callRealAIAPI(
  userMessages,
  attachmentUrls,
  reasoning,
  sessionId
) {
  try {
    logger.info("Calling real AI API...");

    // Prepare messages array for the real AI API
    const messages = [];

    // Add attachment URLs first if any
    if (attachmentUrls.length > 0) {
      messages.push(...attachmentUrls);
    }

    // Add the text message
    const userText = userMessages.join(" ");
    if (userText.trim()) {
      messages.push(userText.trim());
    }

    // Prepare request body for the real AI API
    const requestBody = {
      messages,
      reasoning,
    };

    // Add chat_id if we have stored the real AI's chat ID from previous interactions
    const session = chatSessions.get(sessionId);
    if (session && session.real_chat_id) {
      requestBody.chat_id = session.real_chat_id;
      logger.info("Using existing real AI chat ID:", session.real_chat_id);
    }

    logger.info("Sending to real AI API:", {
      url: REAL_AI_API_URL,
      body: requestBody,
    });

    // Call the real AI API
    const response = await fetch(REAL_AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Real AI API error:", {
        status: response.status,
        error: errorText,
      });
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const aiResponseData = await response.json();
    logger.info("Real AI API response:", aiResponseData);

    // Store the real chat ID if received (for session continuity with real AI)
    // Note: Real AI API uses 'chatID' field, not 'chat_id'
    if (aiResponseData.chatID && sessionId) {
      const session = chatSessions.get(sessionId);
      if (session) {
        session.real_chat_id = aiResponseData.chatID;
        chatSessions.set(sessionId, session);
        logger.info("Stored real AI chat ID:", aiResponseData.chatID);
      }
    }

    // Return the AI's response message
    // Note: Real AI API uses 'botResponse' field, not 'message'
    return (
      aiResponseData.botResponse ||
      aiResponseData.message ||
      aiResponseData.response ||
      "No response from AI"
    );
  } catch (error) {
    logger.error("Error calling real AI API:", error);

    // Fallback to a default response if the real AI API fails
    const fallbackResponse = generateFallbackResponse(
      userMessages,
      attachmentUrls,
      reasoning
    );
    logger.info("Using fallback response due to AI API error");
    return fallbackResponse;
  }
}

/**
 * Fallback response generator when the real AI API is unavailable
 */
function generateFallbackResponse(userMessages, attachmentUrls, reasoning) {
  const userText = userMessages.join(" ");
  let response =
    "I apologize, but I'm experiencing technical difficulties connecting to my main AI system. ";

  if (attachmentUrls.length > 0) {
    response += `I can see you've shared ${attachmentUrls.length} attachment(s), but I cannot process them at the moment. `;
  }

  if (userText.toLowerCase().includes("hello")) {
    response += "Hello! Please try your message again in a moment.";
  } else if (
    userText.toLowerCase().includes("medical") ||
    userText.toLowerCase().includes("health")
  ) {
    response +=
      "For medical questions, please consult with a healthcare professional directly.";
  } else if (userText.toLowerCase().includes("appointment")) {
    response +=
      "For appointment-related assistance, please contact our support team directly.";
  } else {
    response += `I received your message: "${userText}". Please try again in a moment as I work to resolve this issue.`;
  }

  if (reasoning) {
    response +=
      "\n\n*[Note: This is a fallback response due to temporary AI system unavailability]*";
  }

  return response;
}

/**
 * Get chat session history (optional endpoint)
 */
export const getChatHistory = async (req, res, next) => {
  const { chat_id } = req.params;

  const session = chatSessions.get(chat_id);
  if (!session) {
    return next(
      new ErrorHandlerClass("Chat session not found", 404, "Chat session error")
    );
  }

  res.status(200).json({
    success: true,
    session,
  });
};
