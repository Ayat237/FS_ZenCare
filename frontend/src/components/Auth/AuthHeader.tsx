import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@theme/colors";
import Header from "@components/layout/Header";
import { AuthHeaderProps } from "@/types/components";

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTextContainer}>
        <Header title={title} />
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary500,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTextContainer: {
    marginTop: 5,
    marginBottom: 20,
  },
  subtitle: {
    fontFamily: "open-sans",
    color: "#fff",
    fontSize: 14,
    marginTop: 10,
  },
});

export default AuthHeader;
