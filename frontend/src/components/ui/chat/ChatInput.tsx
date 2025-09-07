import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Keyboard, TextInputProps, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@theme/colors";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading = false }) => {
  const [message, setMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);
  
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleSend = () => {
    if (message.trim() === '' || isLoading) return;
    
    onSendMessage(message.trim());
    setMessage('');
    // Keep focus on the input after sending
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  
  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string, shiftKey?: boolean } }) => {
    if (nativeEvent.key === 'Enter' && !nativeEvent.shiftKey) {
      handleSend();
      return true;
    }
    return false;
  };

  return (
    <View style={[styles.container, Platform.OS === 'android' && { paddingBottom: keyboardHeight > 0 ? 10 : 0 }]}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Write your message..."
          placeholderTextColor="#6B7280"
          value={message}
          onChangeText={setMessage}
          onKeyPress={handleKeyPress}
          multiline
          maxLength={500}
          editable={!isLoading}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          returnKeyType="send"
          autoCapitalize="sentences"
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!message.trim() || isLoading) && styles.disabledButton]} 
          onPress={handleSend}
          disabled={!message.trim() || isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
      {/* <View style={styles.searchButtonContainer}>
        <Pressable style={styles.searchButton}>
          <Ionicons name="search" size={18} color={Colors.primary500} />
        </Pressable>
        <View style={styles.searchButtonLabel}>
          <Ionicons name="search" size={14} color={Colors.primary500} />
          <TextInput 
            style={styles.searchButtonText} 
            placeholder="Search for doctors"
            placeholderTextColor="#6B7280"
            editable={false}
          />
        </View>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
    color: "#1F2937",
  },
  sendButton: {
    backgroundColor: Colors.primary500,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  searchButtonContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  searchButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  searchButtonLabel: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchButtonText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 5,
  },
});

export default ChatInput;