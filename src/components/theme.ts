import { useColorScheme } from "react-native";
import { useLibrary } from "../services/store";
export const palettes = {
  light: {
    background: "#FFF9F2",
    surface: "#FFFFFF",
    soft: "#F3EAE2",
    ink: "#321D36",
    muted: "#766578",
    border: "#E8DCD5",
    primary: "#A53628",
    coral: "#FF8C74",
    plum: "#321D36",
    lime: "#D8F17D",
  },
  dark: {
    background: "#1E1523",
    surface: "#2D2233",
    soft: "#3C2D43",
    ink: "#FFF6E8",
    muted: "#C8B5CA",
    border: "#504056",
    primary: "#FFAB96",
    coral: "#FF8C74",
    plum: "#321D36",
    lime: "#D8F17D",
  },
};
export function useTheme() {
  const system = useColorScheme();
  const { library } = useLibrary();
  const mode =
    library.preferences.theme === "system"
      ? (system ?? "light")
      : library.preferences.theme;
  return { ...palettes[mode], dark: mode === "dark" };
}
