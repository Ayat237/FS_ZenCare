import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";

interface HeaderProps {
  title: string;
  style?: TextStyle | TextStyle[]; // Optional style prop
}

const Header: React.FC<HeaderProps> = ({ title, style }) => {
  return <Text style={[styles.title, style]}>{title}</Text>;
};

export default Header;

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontFamily: "open-sans-bold",
    color: "white",
    width: "100%",
    marginBottom: 6,
  },
});
