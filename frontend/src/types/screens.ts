import { StyleProp, ViewStyle, TextStyle } from "react-native";

// Screen Props
export interface ScreenProps {
  navigation: any; // This will be replaced with proper navigation type
  route?: any; // This will be replaced with proper route type
}

// Style Types
export interface ScreenStyles {
  container: StyleProp<ViewStyle>;
  safeArea: StyleProp<ViewStyle>;
  headerText: StyleProp<TextStyle>;
  imageContainer: StyleProp<ViewStyle>;
  image: StyleProp<ViewStyle>;
  buttonContainer: StyleProp<ViewStyle>;
  signUpButton: StyleProp<ViewStyle>;
  signUpText: StyleProp<TextStyle>;
  loginContainer: StyleProp<ViewStyle>;
  loginText: StyleProp<TextStyle>;
  loginLink: StyleProp<TextStyle>;
}
