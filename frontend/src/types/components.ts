import { StyleProp, ViewStyle, TextStyle } from "react-native";

// Auth Components
export interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export interface AuthInputContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Button Components
export interface ButtonProps {
  onPress: () => void;
  title?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export interface GoogleButtonProps extends Omit<ButtonProps, "title"> {
  onPress: () => void;
}

// Input Components
export interface InputFieldProps {
  label: string;
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  style?: StyleProp<ViewStyle>;
}

// Layout Components
export interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface BackButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}
