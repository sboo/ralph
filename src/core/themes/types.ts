import { ReactNode } from "react";
import { MD3Theme } from "react-native-paper";

/**
 * Theme context value interface
 */
export interface ThemeContextValue {
  theme: MD3Theme;
}

/**
 * Props for the ThemeProvider component
 */
export interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Interface defining the public API of the themes feature
 */
export interface ThemesFeatureAPI {
  /**
   * Hook to access the current theme
   */
  useTheme: () => ThemeContextValue;
  
  /**
   * Provider component for theme context
   */
  ThemeProvider: React.FC<ThemeProviderProps>;
}