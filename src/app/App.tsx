import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
} from 'react-native-paper';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
  NavigationState,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { getAvailablePurchases, getProducts, initConnection, useIAP, withIAPContext } from 'react-native-iap';
import merge from 'deepmerge';

// Local imports
import { STORAGE_KEYS } from '@/app/store/storageKeys.ts';
import { event, EVENT_NAMES } from '@/features/events';
import { PET_REQUIRES_MIGRATION, getPetData } from '@/app/store/helper';
import { RootStackParamList } from '@/features/navigation/types.tsx';
import defaultColors from '@/app/themes/lightTheme.json';
import darkColors from '@/app/themes/darkTheme.json';
import CustomNavigationBar from '@/features/navigation/components/CustomNavigationBar.tsx';
import useNotifications from '@/features/notifications/hooks/useNotifications';
import { useAppearance } from './themes/hooks/useAppearance';

// Import WatermelonDB provider
import { DatabaseProvider } from '@/app/database/context';

// Screen imports
import WelcomeScreen from './screens/WelcomeScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import AddAssessment from './screens/AddAssessment';
import EditAssessment from './screens/EditAssessment';
import AddPet from './screens/AddPet';
import EditPet from './screens/EditPet';
import AssessmentSettings from './screens/AssessmentSettings';
import NotificationSettings from './screens/NotificationSettings';
import CustomTrackingSettingsScreen from './screens/CustomTrackingSettingsScreen';
import AllNotesScreen from './screens/AllNotesScreen';
import DebugScreen from './screens/DebugScreen';
import AllAssessmentsScreen from './screens/AllAssessmentsScreen';
import WatermelonTest from '@/features/settings/WatermelonTest';
import WatermelonDBIntegration from '@/features/settings/WatermelonDBIntegration';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/app/database';
import { Pet } from '@/app/database/models/Pet';
import { map } from 'rxjs/operators';

// Constants
const VALID_PRODUCT_IDS = [
  'eu.sboo.ralph.coffee',
  'eu.sboo.ralph.sandwich',
  'eu.sboo.ralph.lunch',
  'eu.sboo.ralph.croissant',
];

// Initialize Stack Navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

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
  // Hooks
  const { t } = useTranslation();
  const {
    purchaseHistory,
    currentPurchase,
    currentPurchaseError,
    finishTransaction,
    getPurchaseHistory,
  } = useIAP();
  const {
    getInitialNotification,
    onForegroundNotification,
    getPetIdFromNotificationId,
  } = useNotifications();
  const { effectiveAppearance } = useAppearance();

  // State
  const [handledInitialNotificationId, setHandledInitialNotificationId] =
    useState<string | undefined>();

  // Theme setup
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
  const theme = effectiveAppearance === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;

  const [headerColor, setHeaderColor] = useState(theme.colors.primary);

  // Callback functions
  const checkPurchases = useCallback(async () => {
    try {
      // First ensure IAP connection is initialized
      const isConnected = await initConnection();

      // Get products first to ensure store connection
      const products = await getProducts({ skus: VALID_PRODUCT_IDS });

      // Get all active purchases
      const purchases = await getAvailablePurchases();

      const validPurchases = purchases.filter(purchase =>
        VALID_PRODUCT_IDS.includes(purchase.productId)
      );

      const hasActivePurchase = validPurchases.length > 0;
      await AsyncStorage.setItem(
        STORAGE_KEYS.COFFEE_PURCHASED,
        String(hasActivePurchase)
      );

      event.emit(EVENT_NAMES.COFFEE_PURCHASED, hasActivePurchase);
    } catch (error: any) {
      // Handle specific error cases
      if (error.code === 'E_NOT_PREPARED') {
        console.log('IAP not prepared, retrying connection...');
        try {
          await initConnection();
          await checkPurchases(); // Retry after initialization
        } catch (retryError) {
          console.log('Retry failed:', retryError);
        }
      } else if (error.code === 'E_USER_CANCELLED') {
        console.log('User cancelled the purchase check');
      } else {
        console.log('Error checking purchases:', {
          code: error.code,
          message: error.message,
          details: error.details,
        });
      }
    }
  }, [getPurchaseHistory, purchaseHistory]);


  const onNavigationStateChange = useCallback(
    (state: NavigationState | undefined) => {
      if (!state) return;

      const activeRoute = state.routes[state.index];
      const isHomeOrWelcome = ['Home', 'Welcome'].includes(activeRoute.name);
      StatusBar.setBarStyle(isHomeOrWelcome ? 'light-content' : 'dark-content');
    },
    [],
  );

  const enableNotificationDot = useCallback(
    (petId: string) => {
      database.write(async () => {
        const pet = await database.get<Pet>('pets').find(petId);
        if (pet && !pet.isActive) {
          pet.showNotificationDot = true;
        }
      }
      );
    },
    [database],
  );
    

  // Effects
  // Separate initial check effect
  useEffect(() => {
    checkPurchases();
  }, []);

  useEffect(() => {
    const consumeInitialNotification = async () => {
      const initialNotification = await getInitialNotification();
      if (initialNotification?.notification.id !== handledInitialNotificationId) {
        if (initialNotification?.notification.id) {
          const petId = getPetIdFromNotificationId(
            initialNotification.notification.id,
          );
          if (petId) {
            enableNotificationDot(petId);
          }
        }
        setHandledInitialNotificationId(initialNotification?.notification.id);
      }
    };

    consumeInitialNotification();
    onForegroundNotification();
  }, [
    getInitialNotification,
    onForegroundNotification,
    getPetIdFromNotificationId,
    enableNotificationDot,
    handledInitialNotificationId,
  ]);

  useEffect(() => {
  
      // If no active pet, use primary color
      if (!activePet || allPets.length === 0) {
        setHeaderColor(theme.colors.primary);
        return;
      }
  
      // Find the index of the active pet in the pets array
      const petIndex = allPets.findIndex(pet => pet.id === activePet.id);
  
      // Use modulo to cycle through colors after 3 pets
      switch (petIndex % 3) {
        case 0:
          setHeaderColor(theme.colors.primary);
          break;
        case 1:
          setHeaderColor(theme.colors.secondary);
          break;
        case 2:
          setHeaderColor(theme.colors.tertiary);
          break;
        default:
          setHeaderColor(theme.colors.primary);
      }
    }, [activePet, allPets, theme.colors]);

  useEffect(() => {
    if (currentPurchaseError) {
      console.warn('currentPurchaseError', currentPurchaseError);
      event.emit(EVENT_NAMES.COFFEE_PURCHASED, 'false');
    }
  }, [currentPurchaseError]);

  useEffect(() => {
    const receipt = currentPurchase?.transactionReceipt;
    if (receipt) {
      AsyncStorage.setItem(STORAGE_KEYS.COFFEE_PURCHASED, 'true')
        .then(() => {
          event.emit(EVENT_NAMES.COFFEE_PURCHASED, 'true');
          return finishTransaction({ purchase: currentPurchase, isConsumable: false });
        });
    }
  }, [currentPurchase, finishTransaction]);

  // Render
  return (
    <KeyboardAvoidingView
      style={styles.keyboardViewContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <DatabaseProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer onStateChange={onNavigationStateChange}>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                header: props => <CustomNavigationBar {...props} />,
              }}>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  title: '',
                  headerStyle: { backgroundColor: headerColor },
                }}
              />
              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                  title: t('settings'),
                  headerStyle: { backgroundColor: theme.colors.primaryContainer },
                }}
              />
              <Stack.Screen
                name="EditPet"
                component={EditPet}
                options={{
                  title: t('edit_pet'),
                  headerStyle: { backgroundColor: theme.colors.primaryContainer },
                }}
              />
              <Stack.Screen
                name="AddPet"
                component={AddPet}
                options={{
                  title: t('add_pet'),
                  headerStyle: { backgroundColor: theme.colors.primaryContainer },
                }}
              />
              <Stack.Screen
                name="AssessmentSettings"
                component={AssessmentSettings}
                options={{
                  title: t('settings:assessments'),
                  headerStyle: { backgroundColor: theme.colors.primaryContainer },
                }}
              />
              <Stack.Screen
                name="NotificationSettings"
                component={NotificationSettings}
                options={{
                  title: t('settings:notifications'),
                  headerStyle: { backgroundColor: theme.colors.primaryContainer },
                }}
              />
              <Stack.Screen
                name="CustomTrackingSettings"
                component={CustomTrackingSettingsScreen}
                options={{
                  title: t('settings:customTracking'),
                  headerStyle: { backgroundColor: theme.colors.primaryContainer },
                }}
              />
              <Stack.Screen
                name="AddAssessment"
                component={AddAssessment}
                options={{
                  title: t('measurements:title', {
                    petName: activePet?.name,
                  }),
                  headerStyle: { backgroundColor: theme.colors.primaryContainer },
                }}
              />
              <Stack.Screen
                name="EditAssessment"
                component={EditAssessment}
                options={{
                  title: t('measurements:title', {
                    petName: activePet?.name,
                  }),
                  headerStyle: { backgroundColor: theme.colors.primaryContainer },
                }}
              />
              <Stack.Screen
                name="AllNotes"
                component={AllNotesScreen}
                options={{
                  title: t('measurements:notes'),
                  headerStyle: { backgroundColor: theme.colors.primaryContainer },
                }}
              />
              <Stack.Screen
                name="AllAssessments"
                component={AllAssessmentsScreen}
                options={{
                  title: t('measurements:allAssessments'),
                  headerStyle: { backgroundColor: theme.colors.primaryContainer },
                }}
              />
              <Stack.Screen name="DebugScreen" component={DebugScreen} />
              <Stack.Screen
                name="WatermelonTest"
                component={WatermelonTest}
                options={{
                  title: 'WatermelonDB Test',
                  headerStyle: { backgroundColor: theme.colors.primaryContainer },
                }}
              />
              <Stack.Screen
                name="WatermelonDBIntegration"
                component={WatermelonDBIntegration}
                options={{
                  title: 'WatermelonDB Integration',
                  headerStyle: { backgroundColor: theme.colors.primaryContainer },
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </DatabaseProvider>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardViewContainer: {
    flex: 1,
  },
});

// Connect with WatermelonDB observables
const enhance = withObservables([], () => ({
  allPets: database.get<Pet>('pets').query().observe(),
  activePet: database.get<Pet>('pets').query(Q.where('is_active', true)).observeWithColumns(['is_active']).pipe(
    // Handle empty results by returning undefined for activePet
    map(pets => pets.length > 0 ? pets[0] : undefined)
  ),
}));

export default withIAPContext(
  enhance(App)
);
