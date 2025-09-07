import * as React from "react";
import { TextInput } from "react-native-paper";
import { StyleSheet, TextStyle } from "react-native";
import Colors from "@theme/colors";

// Define a custom theme type that includes placeholder
interface CustomTextInputTheme {
  roundness?: number;
  colors: {
    placeholder?: string; // Add placeholder to colors
    text?: string;
    primary?: string;
    error?: string;
    [key: string]: any; // Allow other dynamic properties
  };
}

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  style?: any;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none";
  placeholderText?: TextStyle; // Placeholder style prop
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  error,
  keyboardType,
  autoCapitalize,
  style,
  placeholderText,
}) => {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      mode="outlined"
      textColor={Colors.accent500}
      outlineColor={error ? Colors.error500 : Colors.accent500}
      activeOutlineColor={error ? Colors.error500 : Colors.accent500}
      
      style={[styles.input, style]}
      contentStyle={styles.inputContent}
      theme={
        {
          roundness: 15,
          colors: {
            placeholder: placeholderText?.color || "#9e9e9e", // Set placeholder color
            text: Colors.accent500,
            primary: error ? Colors.error500 : Colors.accent500,
            error: Colors.error500,
          },
        } as CustomTextInputTheme
      } // Cast to custom theme type
      autoCapitalize={autoCapitalize}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      placeholder={placeholder}
      error={!!error}
    />
  );
};

export default InputField;

const styles = StyleSheet.create({
  input: {
    marginBottom: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 0,
  },
  inputContent: {
    height: 20,
    paddingHorizontal: 5,
    // backgroundColor: "#fff",
  },
});
