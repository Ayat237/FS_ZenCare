import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import Colors from "@theme/colors";

interface RememberMeCheckboxProps {
  isChecked: boolean;
  onPress: (checked: boolean) => void;
  onForgotPasswordPress?: () => void;
}

const RememberMeCheckbox: React.FC<RememberMeCheckboxProps> = ({
  isChecked,
  onPress,
  onForgotPasswordPress,
}) => {
  return (
    <View style={styles.container}>
      {onForgotPasswordPress && (
        <TouchableOpacity
          onPress={onForgotPasswordPress}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    // justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: Colors.primary600,
    fontSize: 17,
  },
  forgotPasswordContainer: {
    marginLeft: 0,
  },
});

export default RememberMeCheckbox;
