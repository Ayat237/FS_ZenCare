import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import Colors from "@theme/colors";
const BackButton: React.FC = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={styles.backButton}
    >
      <Ionicons name="arrow-back-outline" size={24} color="white" />
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: Colors.primary400,
    padding: 8,
    borderRadius: 50,
    marginLeft: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
