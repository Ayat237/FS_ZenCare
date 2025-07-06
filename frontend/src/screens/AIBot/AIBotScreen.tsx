import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { MessageBubble, ChatInput, ChatHeader } from "@/components/ui/chat";
import { RootState } from "@/store";
import { ChatMessage } from "@/types";
import { useChat } from "@/hooks/useChat";
import Colors from "@theme/colors";

const AIBotScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Temporary user ID for testing - in production this would come from auth state
  const userId = user?.id || "64f8b8e77571f6e4745bcbe1";

  // Use our custom chat hook
  const { messages, loading, sendMessage, flatListRef } = useChat(userId);

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
                {messages.length === 0 && !loading ? (
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
                        isLastMessage={index === messages.length - 1}
                      />
                    )}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                  />
                )}

                {loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.primary500} />
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
          <ChatInput onSendMessage={sendMessage} isLoading={loading} />
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
});

export default AIBotScreen;
