import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Colors from "@theme/colors";
import { useChat } from "@/hooks/useChat";
import Markdown from "react-native-markdown-display";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

// Enhanced message bubble component with avatars and markdown support
interface MessageBubbleProps {
  message: {
    role: "client" | "bot";
    data: string;
    attachments?: Array<{
      type: "image" | "document";
      uri: string;
      name?: string;
    }>;
  };
  userProfileImage?: string; // Add user profile image prop
  isLastMessage?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  userProfileImage,
}) => {
  const isUser = message.role === "client";
  const [imageError, setImageError] = React.useState(false);

  if (isUser) {
    // User message layout: right-aligned with avatar on right
    return (
      <View style={styles.userMessageRow}>
        <View style={[styles.messageBubble, styles.userMessage]}>
          {/* Render attachments if any */}
          {message.attachments &&
            message.attachments.map((attachment, index) => (
              <View key={index} style={styles.attachmentContainer}>
                {attachment.type === "image" ? (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "Image Preview",
                        `Image: ${attachment.name || "Unknown"}\nURI: ${
                          attachment.uri
                        }`
                      );
                    }}
                  >
                    <Image
                      source={{ uri: attachment.uri }}
                      style={styles.attachmentImage}
                      onError={(error) => {
                        console.warn("Failed to load image:", error);
                      }}
                      onLoadStart={() => {
                        console.log("Loading image:", attachment.uri);
                      }}
                      onLoad={() => {
                        console.log(
                          "Image loaded successfully:",
                          attachment.uri
                        );
                      }}
                      defaultSource={undefined}
                    />
                    <Text style={styles.attachmentCaption}>
                      {attachment.name || "Image"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.documentAttachment}
                    onPress={() => {
                      Alert.alert(
                        "Document",
                        `Document: ${attachment.name || "Unknown"}\nURI: ${
                          attachment.uri
                        }`
                      );
                    }}
                  >
                    <Text style={styles.documentIcon}>📄</Text>
                    <Text style={styles.documentName} numberOfLines={2}>
                      {attachment.name || "Document"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

          {/* User message text */}
          <Text style={[styles.messageText, styles.userText]}>
            {message.data}
          </Text>
        </View>

        {/* User Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.userAvatar}>
            {userProfileImage && !imageError ? (
              <Image
                source={{ uri: userProfileImage }}
                style={styles.userAvatarImage}
                onError={() => {
                  console.warn(
                    "Failed to load user profile image, showing fallback"
                  );
                  setImageError(true);
                }}
              />
            ) : (
              <Text style={styles.avatarText}>👤</Text>
            )}
          </View>
        </View>
      </View>
    );
  } else {
    // Bot message layout: left-aligned with avatar on left
    return (
      <View style={styles.botMessageRow}>
        {/* Bot Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.botAvatar}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
        </View>

        <View style={[styles.messageBubble, styles.botMessage]}>
          {/* Render attachments if any */}
          {message.attachments &&
            message.attachments.map((attachment, index) => (
              <View key={index} style={styles.attachmentContainer}>
                {attachment.type === "image" ? (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "Image Preview",
                        `Image: ${attachment.name || "Unknown"}\nURI: ${
                          attachment.uri
                        }`
                      );
                    }}
                  >
                    <Image
                      source={{ uri: attachment.uri }}
                      style={styles.attachmentImage}
                      onError={(error) => {
                        console.warn("Failed to load image:", error);
                      }}
                      onLoadStart={() => {
                        console.log("Loading image:", attachment.uri);
                      }}
                      onLoad={() => {
                        console.log(
                          "Image loaded successfully:",
                          attachment.uri
                        );
                      }}
                      defaultSource={undefined}
                    />
                    <Text style={styles.attachmentCaption}>
                      {attachment.name || "Image"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.documentAttachment}
                    onPress={() => {
                      Alert.alert(
                        "Document",
                        `Document: ${attachment.name || "Unknown"}\nURI: ${
                          attachment.uri
                        }`
                      );
                    }}
                  >
                    <Text style={styles.documentIcon}>📄</Text>
                    <Text style={styles.documentName} numberOfLines={2}>
                      {attachment.name || "Document"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

          {/* Bot message text with markdown */}
          <Markdown
            style={{
              body: { color: "#333", fontSize: 16, lineHeight: 20 },
              heading1: {
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 8,
                color: "#2c3e50",
              },
              heading2: {
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 6,
                color: "#2c3e50",
              },
              heading3: {
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 4,
                color: "#2c3e50",
              },
              paragraph: { marginBottom: 8 },
              strong: { fontWeight: "bold", color: "#2c3e50" },
              em: { fontStyle: "italic" },
              code_inline: {
                backgroundColor: "#f8f9fa",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                fontSize: 14,
                color: "#e74c3c",
              },
              code_block: {
                backgroundColor: "#f8f9fa",
                padding: 12,
                borderRadius: 8,
                fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                fontSize: 14,
                borderLeftWidth: 3,
                borderLeftColor: Colors.primary500,
                marginVertical: 8,
              },
              list_item: { marginBottom: 4 },
              bullet_list: { marginLeft: 16, marginVertical: 4 },
              ordered_list: { marginLeft: 16, marginVertical: 4 },
              link: {
                color: Colors.primary500,
                textDecorationLine: "underline",
              },
              blockquote: {
                borderLeftWidth: 3,
                borderLeftColor: "#bdc3c7",
                paddingLeft: 12,
                fontStyle: "italic",
                color: "#7f8c8d",
                marginVertical: 8,
              },
            }}
          >
            {message.data}
          </Markdown>
        </View>
      </View>
    );
  }
};

// Enhanced chat input component with attachment support
interface ChatInputProps {
  onSendMessage: (
    message: string,
    attachments?: Array<{
      type: "image" | "document";
      uri: string;
      name?: string;
    }>
  ) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<
    Array<{
      type: "image" | "document";
      uri: string;
      name?: string;
    }>
  >([]);

  const handleSend = () => {
    if ((message.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(message.trim(), attachments);
      setMessage("");
      setAttachments([]);
    }
  };

  const handleImagePicker = async () => {
    try {
      // Request permissions first
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photo library"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false, // Don't include base64 to save memory
        exif: false, // Don't include exif data
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];

        // Validate image
        if (asset.uri && asset.width && asset.height) {
          setAttachments((prev) => [
            ...prev,
            {
              type: "image",
              uri: asset.uri,
              name: asset.fileName || `image_${Date.now()}.jpg`,
            },
          ]);
        } else {
          Alert.alert("Error", "Invalid image selected");
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];

        // Validate file size (limit to 10MB)
        if (asset.size && asset.size > 10 * 1024 * 1024) {
          Alert.alert(
            "Error",
            "File is too large. Please select a file smaller than 10MB."
          );
          return;
        }

        setAttachments((prev) => [
          ...prev,
          {
            type: "document",
            uri: asset.uri,
            name: asset.name,
          },
        ]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.inputContainer}>
      {/* Attachment preview */}
      {attachments.length > 0 && (
        <ScrollView
          horizontal
          style={styles.attachmentPreview}
          showsHorizontalScrollIndicator={false}
        >
          {attachments.map((attachment, index) => (
            <View key={index} style={styles.attachmentPreviewItem}>
              {attachment.type === "image" ? (
                <Image
                  source={{ uri: attachment.uri }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.previewDocument}>
                  <Text style={styles.previewDocumentText} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.removeAttachment}
                onPress={() => removeAttachment(index)}
              >
                <Text style={styles.removeAttachmentText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.inputRow}>
        {/* Attachment buttons */}
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={handleImagePicker}
          disabled={isLoading}
        >
          <Text style={styles.attachmentButtonText}>📷</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={handleDocumentPicker}
          disabled={isLoading}
        >
          <Text style={styles.attachmentButtonText}>📎</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          multiline
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            ((!message.trim() && attachments.length === 0) || isLoading) &&
              styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={(!message.trim() && attachments.length === 0) || isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Simple chat header component
interface ChatHeaderProps {
  title: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const AIBotScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Temporary user ID for testing - in production this would come from auth state
  const userId = user?.id || "64f8b8e77571f6e4745bcbe1";

  // Use our custom chat hook with custom backend API
  const { messages, loading, sendMessage, flatListRef, chatId } =
    useChat(userId);

  // Show loading indicator
  const isProcessing = loading;

  // Handle sending message with optional attachments
  const handleSendMessage = (
    message: string,
    attachments?: Array<{
      type: "image" | "document";
      uri: string;
      name?: string;
    }>
  ) => {
    // Send message with attachments to custom backend API
    // The custom API will handle uploading attachments and including URLs
    sendMessage(message, attachments);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 30}
      >
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.contentContainer}>
              <ChatHeader title="ZenCare Bot" />

              <View style={styles.container}>
                {messages.length === 0 && !isProcessing ? (
                  <View style={styles.emptyContainer}>
                    <MessageBubble
                      message={{
                        role: "bot",
                        data: "Hi! I'm zenCare bot, your doctor assistant. How can I help you today?",
                      }}
                    />
                  </View>
                ) : (
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item, index) => `message-${index}`}
                    renderItem={({ item, index }) => (
                      <MessageBubble
                        message={item}
                        userProfileImage={user?.profileImage}
                        isLastMessage={index === messages.length - 1}
                      />
                    )}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                  />
                )}

                {isProcessing && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.primary500} />
                    <Text style={styles.loadingText}>Processing...</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isProcessing}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 25,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  contentContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 20,
  },
  messagesList: {
    paddingTop: 15,
    paddingBottom: 15,
  },
  loadingContainer: {
    padding: 10,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: "italic",
  },
  header: {
    backgroundColor: Colors.primary500,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  // User message row - right aligned
  userMessageRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginHorizontal: 16,
    marginVertical: 4,
  },
  // Bot message row - left aligned
  botMessageRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    marginHorizontal: 16,
    marginVertical: 4,
  },
  // Message container with avatars (legacy - can be removed)
  messageContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 4,
    alignItems: "flex-end",
  },
  // Avatar styles
  avatarContainer: {
    marginHorizontal: 8,
    marginBottom: 4,
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2196f3",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3e5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary500,
  },
  userAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarText: {
    fontSize: 16,
  },
  // Message bubble styles
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    maxWidth: "75%",
    minWidth: 80,
  },
  userMessage: {
    backgroundColor: Colors.primary500,
    borderBottomRightRadius: 4,
  },
  botMessage: {
    backgroundColor: "#e9ecef",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: "#fff",
  },
  botText: {
    color: "#333",
  },
  // Enhanced attachment styles
  attachmentContainer: {
    marginBottom: 8,
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  attachmentCaption: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
  },
  documentAttachment: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
    flexDirection: "row",
    alignItems: "center",
    minWidth: 150,
  },
  documentIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  documentName: {
    fontSize: 14,
    color: "#495057",
    flex: 1,
    fontWeight: "500",
  },
  // Input container styles
  inputContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  attachmentPreview: {
    maxHeight: 80,
    marginBottom: 8,
  },
  attachmentPreviewItem: {
    marginRight: 8,
    position: "relative",
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  previewDocument: {
    width: 60,
    height: 60,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  previewDocumentText: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 2,
    fontWeight: "500",
  },
  removeAttachment: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#dc3545",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  removeAttachmentText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  attachmentButton: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  attachmentButtonText: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  sendButton: {
    backgroundColor: Colors.primary500,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 70,
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#6c757d",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AIBotScreen;
