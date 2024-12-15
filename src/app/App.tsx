import React, {useCallback, useEffect, useState} from 'react';
import {
  AppState,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  useColorScheme,
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
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import {useIAP, withIAPContext} from 'react-native-iap';
import {useQuery, useRealm} from '@realm/react';
import * as Sentry from '@sentry/react-native';
import merge from 'deepmerge';

// Local imports
import {STORAGE_KEYS} from '@/app/store/storageKeys.ts';
import {event, EVENT_NAMES} from '@/features/events';
import {Pet} from '@/app/models/Pet';
import {PET_REQUIRES_MIGRATION, getPetData} from '@/app/store/helper';
import {RootStackParamList} from '@/features/navigation/types.tsx';
import defaultColors from '@/app/themes/lightTheme.json';
import darkColors from '@/app/themes/darkTheme.json';
import CustomNavigationBar from '@/features/navigation/components/CustomNavigationBar.tsx';
import usePet from '@/features/pets/hooks/usePet';
import useNotifications from '@/features/notifications/hooks/useNotifications';
import {useAppearance} from './themes/hooks/useAppearance';

// Screen imports
import WelcomeScreen from './screens/WelcomeScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import AddAssessment from './screens/AddAssessment';
import EditAssessment from './screens/EditAssessment';
import AddPet from './screens/AddPet';
import EditPet from './screens/EditPet';
import DebugScreen from './screens/DebugScreen';
import AboutScreen from './screens/AboutScreen';
import AllAssessmentsScreen from './screens/AllAssessmentsScreen';

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

const App: React.FC = () => {
  // Hooks
  const {t} = useTranslation();
  const realm = useRealm();
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
  const {activePet, getHeaderColor, enableNotifcationDot} = usePet();
  const {effectiveAppearance} = useAppearance();

  // State
  const [handledInitialNotificationId, setHandledInitialNotificationId] = 
    useState<string | undefined>();

  // Theme setup
  const {LightTheme, DarkTheme} = adaptNavigationTheme({
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

  // Database queries
  const petsToFix = useQuery({
    type: Pet,
    query: collection => collection.filtered('name = $0', PET_REQUIRES_MIGRATION),
  });

  // Callback functions
  const checkPurchases = useCallback(async () => {
    try {
      console.log('Checking purchases...');  // Added for debugging
      await getPurchaseHistory();
      
      console.log('purchaseHistory:', purchaseHistory);  // Added for debugging

       // Check for valid active purchases
       const validPurchases = purchaseHistory.filter(purchase => {
        const isValidProduct = VALID_PRODUCT_IDS.includes(purchase.productId);
        const isNotRefunded = !purchase.transactionReceipt?.includes('refund') && 
                            !purchase.transactionReceipt?.includes('revoked');
        return isValidProduct && isNotRefunded;
      });

      const hasActivePurchase = validPurchases.length > 0;

      // Save purchase status
      await AsyncStorage.setItem(
        STORAGE_KEYS.COFFEE_PURCHASED,
        String(hasActivePurchase)
      );
      event.emit(EVENT_NAMES.COFFEE_PURCHASED, hasActivePurchase);
    } catch (error) {
      console.log('Error checking purchases:', error);
    }
  }, [getPurchaseHistory, purchaseHistory]);

  const fixPetData = useCallback(async () => {
    if (realm.schemaVersion > 0 && petsToFix.length > 0) {
      const petData = await getPetData();
      petsToFix.forEach((pet, idx) => {
        realm.write(() => {
          pet.isActive = idx === 0;
          pet.name = petData.name;
          pet.species = petData.species;
          pet.notificationsEnabled = petData.notificationsEnabled;
          if (petData.avatar) {
            pet.avatar = petData.avatar;
          }
          if (petData.notificationsTime) {
            pet.notificationsTime = petData.notificationsTime;
          }
        });
      });
    }
  }, [petsToFix, realm]);

  const onNavigationStateChange = useCallback(
    (state: NavigationState | undefined) => {
      if (!state) return;
      
      const activeRoute = state.routes[state.index];
      const isHomeOrWelcome = ['Home', 'Welcome'].includes(activeRoute.name);
      StatusBar.setBarStyle(isHomeOrWelcome ? 'light-content' : 'dark-content');
    },
    [],
  );

  // Effects
  // Separate initial check effect
  useEffect(() => {
    console.log('Running initial purchase check');
    checkPurchases();
  }, []); // Empty dependency array since this should only run once

  // Separate AppState subscription effect
  useEffect(() => {
    let lastAppState = AppState.currentState;
    
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Only check purchases when coming from background to active
      if (
        lastAppState.match(/inactive|background/) && 
        nextAppState === 'active'
      ) {
        console.log('App came to foreground, checking purchases');
        checkPurchases();
      }
      lastAppState = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkPurchases]);

  useEffect(() => {
    fixPetData();
  }, [fixPetData]);

  useEffect(() => {
    const consumeInitialNotification = async () => {
      const initialNotification = await getInitialNotification();
      if (initialNotification?.notification.id !== handledInitialNotificationId) {
        if (initialNotification?.notification.id) {
          const petId = getPetIdFromNotificationId(
            initialNotification.notification.id,
          );
          if (petId) {
            enableNotifcationDot(petId);
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
    enableNotifcationDot,
    handledInitialNotificationId,
  ]);

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
          return finishTransaction({purchase: currentPurchase, isConsumable: false});
        });
    }
  }, [currentPurchase, finishTransaction]);

    // Render
  return (
    <KeyboardAvoidingView
      style={styles.keyboardViewContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
                headerStyle: {backgroundColor: getHeaderColor(theme)},
              }}
            />
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: t('settings'),
                headerStyle: {backgroundColor: theme.colors.primaryContainer},
              }}
            />
            <Stack.Screen
              name="EditPet"
              component={EditPet}
              options={{
                title: t('edit_pet'),
                headerStyle: {backgroundColor: theme.colors.primaryContainer},
              }}
            />
            <Stack.Screen
              name="AddPet"
              component={AddPet}
              options={{
                title: t('add_pet'),
                headerStyle: {backgroundColor: theme.colors.primaryContainer},
              }}
            />
            <Stack.Screen
              name="AddAssessment"
              component={AddAssessment}
              options={{
                title: t('measurements:title', {
                  petName: activePet?.name,
                }),
                headerStyle: {backgroundColor: theme.colors.primaryContainer},
              }}
            />
            <Stack.Screen
              name="EditAssessment"
              component={EditAssessment}
              options={{
                title: t('measurements:title', {
                  petName: activePet?.name,
                }),
                headerStyle: {backgroundColor: theme.colors.primaryContainer},
              }}
            />
            <Stack.Screen
              name="AllAssessments"
              component={AllAssessmentsScreen}
              options={{
                title: t('measurements:allAssessments'),
                headerStyle: {backgroundColor: theme.colors.primaryContainer},
              }}
            />
            <Stack.Screen name="AboutScreen" component={AboutScreen} />
            <Stack.Screen name="DebugScreen" component={DebugScreen} />
            </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardViewContainer: {
    flex: 1,
  },
});

export default withIAPContext(App);
