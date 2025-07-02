import { View, StyleSheet } from "react-native";
import React from "react";

interface AuthInputContainerProps {
  children: React.ReactNode;
}

const AuthInputContainer: React.FC<AuthInputContainerProps> = ({
  children,
}) => {
  return <View style={styles.container}>{children}</View>;
};

export default AuthInputContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    paddingHorizontal: "1%",
  },
});
