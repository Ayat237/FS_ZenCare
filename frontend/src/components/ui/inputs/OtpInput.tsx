import React, { useState, useRef } from "react";
import { View, TextInput, StyleSheet, Dimensions } from "react-native";
import Colors from "@/theme/colors";

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  hasError?: boolean;
}

const { width } = Dimensions.get("window");
const BOX_SIZE = 50;
const BOX_MARGIN = 8;

const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  hasError = false,
}) => {
  const [otp, setOtp] = useState(value.split(""));
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChangeText = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Move to next input if text is entered
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: 6 }, (_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputs.current[index] = ref;
          }}
          style={[
            styles.input,
            {
              borderColor: hasError
                ? "#DC2626"
                : otp[index]
                ? "#0e8de9"
                : "#D1D5DB",
              backgroundColor: hasError
                ? "#FEE2E2"
                : otp[index]
                ? "#EFF6FF"
                : "#FFFFFF",
            },
          ]}
          value={otp[index] || ""}
          onChangeText={(text) =>
            handleChangeText(text.replace(/[^0-9]/g, ""), index)
          }
          onKeyPress={({ nativeEvent }) =>
            handleKeyPress(nativeEvent.key, index)
          }
          keyboardType="numeric"
          maxLength={1}
          autoFocus={index === 0}
          textAlign="center"
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    gap: BOX_MARGIN,
  },
  input: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333333",
  },
});

export default OtpInput;
