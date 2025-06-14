import darkColors from '@/core/themes/darkTheme.json';
import { useAppearance } from '@/core/themes/hooks/useAppearance';
import defaultColors from '@/core/themes/lightTheme.json';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import merge from 'deepmerge';
import React, { ReactNode } from 'react';
import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider
} from 'react-native-paper';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Custom theme context to access theme throughout the app
 */
export const ThemeContext = React.createContext<{
  theme: any;
}>({
  theme: null,
});

/**
 * Theme provider component that configures and provides theme based on appearance settings
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { effectiveAppearance } = useAppearance();
  
  // Initialize themes
  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

  const CustomLightTheme = {
    ...MD3LightTheme,
    colors: defaultColors,
  };

  const CustomDarkTheme = {
    ...MD3DarkTheme,
    colors: darkColors,
  };

  const CombinedDefaultTheme = merge(LightTheme, CustomLightTheme);
  const CombinedDarkTheme = merge(DarkTheme, CustomDarkTheme);
  
  // Select theme based on appearance
  const theme = effectiveAppearance === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;

  const themeContextValue = React.useMemo(() => ({ theme }), [theme]);

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use theme context
 */
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;