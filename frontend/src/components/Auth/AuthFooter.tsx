import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "@theme/colors";

interface AuthFooterProps {
  style?: any;
  question: string;
  actionText: string;
  onPress: () => void;
}

const AuthFooter: React.FC<AuthFooterProps> = ({
  style,
  question,
  actionText,
  onPress,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.questionText}>{question}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.actionText}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  questionText: {
    color: Colors.gray600,
    fontSize: 16,
  },
  actionText: {
    color: Colors.primary600,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default AuthFooter;
