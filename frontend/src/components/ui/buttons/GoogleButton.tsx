import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Image, Alert } from "react-native";
import GoogleIcon from "@assets/images/googleDark.png";

const GoogleButton: React.FC = () => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => Alert.alert("Google Login pressed")}
    >
      <Image source={GoogleIcon} style={styles.icon} />
      <Text style={styles.buttonText}>Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#454B60", // Dark gray border
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
    width: 200, // Adjust width as needed
  },
  icon: {
    width: 20, // Adjust size to match the given image
    height: 20,
    marginRight: 10,
  },
  buttonText: {
    color: "#454B60", // Dark gray text color
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default GoogleButton;
