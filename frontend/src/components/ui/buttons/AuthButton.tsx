import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types/navigation";
import Colors from "@/theme/colors";

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  buttonStyle?: any;
  textButtonStyle?: any;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  disabled,
  buttonStyle,
  textButtonStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabledButton, buttonStyle]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.buttonText,
          disabled && styles.disabledText,
          textButtonStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary500,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "OpenSans-Bold",
  },
  disabledButton: {
    backgroundColor: Colors.primary400,
    opacity: 0.5,
  },
  disabledText: {
    color: "#eee",
  },
});

export default AuthButton;
