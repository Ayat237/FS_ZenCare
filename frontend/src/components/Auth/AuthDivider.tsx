import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@theme/colors";

interface AuthDividerProps {
  text?: string;
}

const AuthDivider: React.FC<AuthDividerProps> = ({
  text = "Or login in with",
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray300,
    borderWidth: 0.5,
  },
  text: {
    marginHorizontal: 10,
    color: Colors.gray500,
    fontSize: 14,
  },
});

export default AuthDivider;
