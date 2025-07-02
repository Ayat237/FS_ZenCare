import React from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { ChatMessage } from "@/types";
import Colors from "@theme/colors";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Markdown from "react-native-markdown-display";

// Get screen width for better text wrapping calculations
const { width: screenWidth } = Dimensions.get('window');

interface MessageBubbleProps {
  message: ChatMessage;
  isLastMessage?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLastMessage = false,
}) => {
  const isBot = message.role === "bot";
  const { user } = useSelector((state: RootState) => state.auth);

  // Handle timestamp whether it's a Date object, ISO string, or undefined
  const timestamp =
    message.timestamp instanceof Date
      ? message.timestamp
      : message.timestamp
      ? new Date(message.timestamp)
      : new Date();

  const formattedTime = format(timestamp, "h:mm a");

  // Create markdown styles that match react-native-markdown-renderer's expected format
  const markdownStyles = {
    // Base container and text styles
    view: {
      width: '100%',
    },
    body: {
      width: '100%',
    },
    // Text styling
    text: {
      ...styles.text,
      ...styles.botText,
      flexWrap: 'wrap',
    },
    // Bold text - working well
    strong: styles.strongText,
    // Headings
    heading1: styles.heading1,
    heading2: styles.heading2,
    heading3: styles.heading3,
    // Lists
    bullet_list: styles.bulletList,
    ordered_list: styles.orderedList,
    // List items
    list_item: {
      flexDirection: 'row',
      marginBottom: 6,
    },
    // Paragraph
    paragraph: styles.paragraph,
    // Links
    link: {
      color: Colors.primary500,
      textDecorationLine: 'underline',
    },
    // Code blocks
    code_inline: {
      fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.05)',
      paddingHorizontal: 4,
      borderRadius: 3,
    },
    code_block: {
      fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.05)',
      padding: 8,
      borderRadius: 5,
      marginVertical: 5,
    },
    // Blockquotes
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: Colors.primary300,
      paddingLeft: 10,
      opacity: 0.8,
    },
  };

  return (
    <View
      style={[
        styles.container,
        isLastMessage && styles.lastMessage,
        isBot ? styles.botContainer : styles.userContainer,
      ]}
    >
      {isBot && (
        <View style={styles.botAvatarContainer}>
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>🤖</Text>
          </View>
        </View>
      )}
      <View
        style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}
      >
        {isBot ? (
          <View style={styles.markdownContainer}>
            <Markdown
              style={markdownStyles}
              rules={{
                paragraph: (node:any, children:any) => (
                  <Text key={node.key} style={styles.paragraph}>
                    {children}
                  </Text>
                ),
                bullet_list_icon: () => (
                  <Text style={styles.bulletListIcon}>•</Text>
                ),
                ordered_list_icon: (node: any, children: any, parent:any, styles: any) => (
                  <Text style={styles.bulletListIcon}>{node.index + 1}.</Text>
                ),
              }}
            >
              {message.data}
            </Markdown>
          </View>
        ) : (
          <Text style={[styles.text, styles.userText]}>{message.data}</Text>
        )}
        <Text
          style={[
            styles.timestamp,
            isBot ? styles.botTimestamp : styles.userTimestamp,
          ]}
        >
          {formattedTime}
        </Text>
      </View>
      {!isBot && (
        <View style={styles.userAvatarContainer}>
          {user?.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              style={styles.userAvatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>👤</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 8,
    paddingHorizontal: 15,
  },
  botContainer: {
    justifyContent: "flex-start",
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  lastMessage: {
    marginBottom: 15,
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  markdownContainer: {
    width: '100%',
    maxWidth: screenWidth * 0.65, // Limit width to prevent overflow
  },
  botBubble: {
    backgroundColor: Colors.primary200,
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    backgroundColor: Colors.primary300,
    borderBottomRightRadius: 5,
    marginLeft: "auto",
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
    flexWrap: 'wrap',
    color: Colors.accent500,
  },
  botText: {
    color: Colors.accent500,
  },
  userText: {
    color: "#fff",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  botTimestamp: {
    color: Colors.accent300,
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  botAvatarContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  botAvatarText: {
    fontSize: 18,
  },
  userAvatarContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 5,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent500,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  userAvatarText: {
    fontSize: 20,
    color: "#fff",
  },
  strongText: {
    fontWeight: "bold",
    color: Colors.accent500,
  },
  heading1: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    color: Colors.accent500,
    flexWrap: 'wrap',
  },
  heading2: {
    fontSize: 19,
    fontWeight: "bold",
    marginVertical: 8,
    color: Colors.accent500,
    flexWrap: 'wrap',
  },
  heading3: {
    fontSize: 17,
    fontWeight: "bold",
    marginVertical: 6,
    color: Colors.accent500,
    flexWrap: 'wrap',
  },
  bulletList: {
    marginLeft: 8,
    marginRight: 8,
    width: '100%',
  },
  orderedList: {
    marginLeft: 8,
    marginRight: 8,
    width: '100%',
  },
  bulletListIcon: {
    fontSize: 14,
    color: Colors.accent500,
    marginRight: 8,
    marginTop: 3,
  },
  paragraph: {
    marginVertical: 5,
    flexWrap: 'wrap',
    flexShrink: 1,
    color: Colors.accent500,
    width: '100%',
  },
});

export default MessageBubble;
