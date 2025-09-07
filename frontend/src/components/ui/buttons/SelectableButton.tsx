import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Image,
  ViewStyle,
} from "react-native";
import Colors from "@theme/colors";

interface SelectableButtonProps {
  selected: boolean;
  icon: any;
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

const SelectableButton: React.FC<SelectableButtonProps> = ({
  selected,
  icon,
  label,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        selected ? styles.selected : styles.unselected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
        <Text style={[styles.label]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    justifyContent: "center",
  },
  selected: {
    backgroundColor: Colors.primary100,
    borderColor: Colors.primary100,
  },
  unselected: {
    backgroundColor: "#fff",
    borderColor: Colors.primary600,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  label: {
    fontSize: 18,
    color: Colors.primary600,
    fontWeight: "500",
  },
  // selectedLabel: {
  //   color: "#fff",
  //   fontWeight: "bold",
  // },
});

export default SelectableButton;
