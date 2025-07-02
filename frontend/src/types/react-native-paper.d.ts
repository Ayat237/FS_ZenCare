import { Theme } from "react-native-paper/lib/typescript/types";

declare module "react-native-paper" {
  interface Theme {
    colors: Theme["colors"] & {
      placeholder?: string; // Add placeholder to colors
    };
  }
}
