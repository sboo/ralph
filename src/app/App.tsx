import React, {useCallback, useEffect, useState} from 'react';
import {
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
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
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
import {RootStackParamList} from '@/features/navigation/types.tsx';
import defaultColors from '@/app/themes/lightTheme.json';
import darkColors from '@/app/themes/darkTheme.json';
import merge from 'deepmerge';
import CustomNavigationBar from '@/features/navigation/components/CustomNavigationBar.tsx';
import {useTranslation} from 'react-i18next';
import {useIAP, withIAPContext} from 'react-native-iap';
import {STORAGE_KEYS} from '@/app/store/storageKeys.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {event, EVENT_NAMES} from '@/features/events';
import type {NavigationState} from '@react-navigation/routers';
import {Pet} from '@/app/models/Pet';
import {useQuery, useRealm} from '@realm/react';
import {PET_REQUIRES_MIGRATION, getPetData} from '@/app/store/helper';
import usePet from '@/features/pets/hooks/usePet';
import useNotifications from '@/features/notifications/hooks/useNotifications';
import * as Sentry from '@sentry/react-native';
import { useAppearance } from './themes/hooks/useAppearance';

Sentry.init({
  dsn: 'https://1dfcc8aa48a1de11a650379ba7e1cc79@o4507259307032576.ingest.de.sentry.io/4507259313913936',
});

const Stack = createNativeStackNavigator<RootStackParamList>();
StatusBar.setBarStyle('light-content');
if (Platform.OS === 'android') {
  StatusBar.setBackgroundColor('rgba(0,0,0,0)');
  StatusBar.setTranslucent(true);
}

const App: React.FC = () => {
  const {t} = useTranslation();
  const {
    purchaseHistory,
    currentPurchase,
    currentPurchaseError,
    finishTransaction,
    getPurchaseHistory,
  } = useIAP();

  const realm = useRealm();
  const {
    getInitialNotification,
    onForegroundNotification,
    getPetIdFromNotificationId,
  } = useNotifications();
  const systemColorScheme = useColorScheme();
  const {activePet, getHeaderColor, enableNotifcationDot} = usePet();

  const {LightTheme, DarkTheme} = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

  const CustomLightTheme = {
    ...MD3LightTheme,
    colors: defaultColors, // Copy it from the color codes scheme and then use it here
  };

  const CustomDarkTheme = {
    ...MD3DarkTheme,
    colors: darkColors, // Copy it from the color codes scheme and then use it here
  };

  const CombinedDefaultTheme = merge(LightTheme, CustomLightTheme);
  const CombinedDarkTheme = merge(DarkTheme, CustomDarkTheme);

  const { effectiveAppearance } = useAppearance();
  const theme = effectiveAppearance === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;



  const petsToFix = useQuery({
    type: Pet,
    query: collection => {
      return collection.filtered('name = $0', PET_REQUIRES_MIGRATION);
    },
  });

  const isFreshInstall = useCallback(async () => {
    const freshInstall = await AsyncStorage.getItem(STORAGE_KEYS.FRESH_INSTALL);
    return freshInstall !== 'false';
  }, []);

  const VALID_PRODUCT_IDS = [
    'eu.sboo.ralph.coffee',
    'eu.sboo.ralph.sandwich',
    'eu.sboo.ralph.lunch',
    'eu.sboo.ralph.croissant'
  ];

  const restorePurchases = useCallback(async () => {
    let purchased = false;
  
    try {
      // Get purchase history
      await getPurchaseHistory();
  
      // Check if user has any valid purchases
      purchased = purchaseHistory.some(purchase => 
        VALID_PRODUCT_IDS.includes(purchase.productId)
      );
  
      // Save purchase status
      await AsyncStorage.setItem(
        STORAGE_KEYS.COFFEE_PURCHASED,
        String(purchased)
      );
  
    } catch (error) {
      console.log(error);
  
    } finally {
      // Mark as not a fresh install and emit purchase status
      await AsyncStorage.setItem(STORAGE_KEYS.FRESH_INSTALL, 'false');
      event.emit(EVENT_NAMES.COFFEE_PURCHASED, purchased);
    }
  }, [getPurchaseHistory, purchaseHistory]);

  const fixPetData = useCallback(async () => {
    // Fix pet data for existing installs
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

  // Check if fresh install and restore purchases
  useEffect(() => {
    const initApp = async () => {
      console.log('initApp');
      const isFresh = await isFreshInstall();
      console.log('isFresh', isFresh);
      if (isFresh) {
        restorePurchases();
      }
      fixPetData();
    };
    initApp();
  }, [isFreshInstall, restorePurchases, fixPetData]);

  const [handledInitialNotificationId, setHandledInitialNotificationId] =
    useState<string | undefined>();
  // Handle notifications
  useEffect(() => {
    const consumeInitialNotification = async () => {
      const initialNotification = await getInitialNotification();
      if (
        initialNotification?.notification.id !== handledInitialNotificationId
      ) {
        console.log(
          'initialNotification',
          initialNotification?.notification.id,
        );
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

  // Log purchase error
  useEffect(() => {
    if (currentPurchaseError) {
      console.warn('currentPurchaseError', currentPurchaseError);
      event.emit(EVENT_NAMES.COFFEE_PURCHASED, 'false');
    }
  }, [currentPurchaseError]);

  // Handle purchase
  useEffect(() => {
    const setCoffeePurchased = async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.COFFEE_PURCHASED, 'true');
      event.emit(EVENT_NAMES.COFFEE_PURCHASED, 'true');
    };

    const receipt = currentPurchase?.transactionReceipt;
    if (receipt) {
      setCoffeePurchased().then(() => {
        finishTransaction({purchase: currentPurchase, isConsumable: false});
      });
    }
  }, [currentPurchase, finishTransaction]);

  // Change status bar color based on route
  const onNavigationStateChange = useCallback(
    (state: NavigationState | undefined) => {
      if (!state) {
        return;
      }
      const activeRoute = state.routes[state.index];
      switch (activeRoute.name) {
        case 'Home':
        case 'Welcome':
          StatusBar.setBarStyle('light-content');
          break;
        default:
          StatusBar.setBarStyle('dark-content');
          break;
      }
    },
    [],
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboardViewContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <PaperProvider theme={theme}>
        <NavigationContainer onStateChange={onNavigationStateChange}>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              // eslint-disable-next-line react/no-unstable-nested-components
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
