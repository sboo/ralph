import { Pet } from '@/app/database/models/Pet';
import { compose } from '@nozbe/watermelondb/react';
import {
  NavigationContainer,
  NavigationState,
} from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';

// Import Navigator and Providers
import { AppProviders } from '@/app/providers';
import { AppNavigator } from '@/features/navigation';
import { getHeaderColor } from '@/features/pets/helpers/helperFunctions';
import { useTheme } from '@/features/themes';
import { withAllAndActivePet } from './database/hoc';

// Initialize StatusBar
StatusBar.setBarStyle('light-content');
if (Platform.OS === 'android') {
  StatusBar.setBackgroundColor('rgba(0,0,0,0)');
  StatusBar.setTranslucent(true);
}

const App: React.FC<{
  allPets: Pet[],
  activePet: Pet | undefined
}> = ({ allPets, activePet }) => {
  const { theme } = useTheme();
  const [headerColor, setHeaderColor] = useState(theme.colors.primary);

  const onNavigationStateChange = useCallback(
    (state: NavigationState | undefined) => {
      if (!state) return;

      const activeRoute = state.routes[state.index];
      const isHomeOrWelcome = ['Home', 'Welcome'].includes(activeRoute.name);
      StatusBar.setBarStyle(isHomeOrWelcome ? 'light-content' : 'dark-content');
    },
    [],
  );

  useEffect(() => {
    setHeaderColor(
      getHeaderColor(
        allPets,
        activePet?.id || '',
        theme,
      ),  
    )
  }, [activePet, allPets, theme]);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardViewContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <NavigationContainer onStateChange={onNavigationStateChange}>
        <AppNavigator 
          headerColor={headerColor}
          theme={theme}
          activePet={activePet}
        />
      </NavigationContainer>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardViewContainer: {
    flex: 1,
  },
});

// Connect with WatermelonDB observables
const enhance = compose(
  withAllAndActivePet
);

// Create an enhanced app with providers
const EnhancedApp = enhance(App);

// The root component with all providers
const RootApp = () => (
  <AppProviders>
    <EnhancedApp />
  </AppProviders>
);

export default RootApp;
