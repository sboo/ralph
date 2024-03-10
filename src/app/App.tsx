import React, {useCallback, useEffect, useState} from 'react';
import {Platform, StatusBar, useColorScheme} from 'react-native';
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
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import AddMeasurement from './screens/AddMeasurement';
import EditMeasurement from './screens/EditMeasurement';
import IapScreen from './screens/IapScreen';
import AllMeasurementsScreen from './screens/AllMeasurementsScreen';
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

const Stack = createNativeStackNavigator<RootStackParamList>();
StatusBar.setBarStyle('light-content');
if (Platform.OS === 'android') {
  StatusBar.setBackgroundColor('rgba(0,0,0,0)');
  StatusBar.setTranslucent(true);
}

const App: React.FC = () => {
  const {t} = useTranslation();
  const [petName, setPetName] = useState('');
  const {
    purchaseHistory,
    currentPurchase,
    currentPurchaseError,
    finishTransaction,
    getPurchaseHistory,
  } = useIAP();

  const isFreshInstall = useCallback(async () => {
    const freshInstall = await AsyncStorage.getItem(STORAGE_KEYS.FRESH_INSTALL);
    return freshInstall !== 'false';
  }, []);

  const restorePurchases = useCallback(async () => {
    let purchased = false;
    try {
      await getPurchaseHistory();
      purchased =
        purchaseHistory.findIndex(p => p.productId === 'eu.sboo.ralph.coffee') >
        -1;
      await AsyncStorage.setItem(
        STORAGE_KEYS.COFFEE_PURCHASED,
        purchased ? 'true' : 'false',
      );
    } finally {
      await AsyncStorage.setItem(STORAGE_KEYS.FRESH_INSTALL, 'false');
      event.emit(EVENT_NAMES.COFFEE_PURCHASED, purchased);
    }
  }, [getPurchaseHistory, purchaseHistory]);

  // Check if fresh install and restore purchases
  useEffect(() => {
    const initApp = async () => {
      console.log('initApp');
      const isFresh = await isFreshInstall();
      console.log('isFresh', isFresh);
      if (isFresh) {
        restorePurchases();
      }
    };
    initApp();
  }, [isFreshInstall, restorePurchases]);

  // Log purchase error
  useEffect(() => {
    if (currentPurchaseError) {
      console.warn('currentPurchaseError', currentPurchaseError);
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

  // Fetch pet name from storage
  useEffect(() => {
    const fetchPetName = async () => {
      const name = await AsyncStorage.getItem(STORAGE_KEYS.PET_NAME);
      if (name !== null) {
        setPetName(name);
      }
    };

    fetchPetName();
  }, []);

  // Change status bar color based on route
  const onNavigationStateChange = useCallback(
    (state: NavigationState | undefined) => {
      if (!state) {
        return;
      }
      const activeRoute = state.routes[state.index];
      switch (activeRoute.name) {
        case 'Home':
          StatusBar.setBarStyle('light-content');
          break;
        default:
          StatusBar.setBarStyle('dark-content');
          break;
      }
    },
    [],
  );

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

  const CombinedDefaultTheme = merge(CustomLightTheme, LightTheme);
  const CombinedDarkTheme = merge(CustomDarkTheme, DarkTheme);

  const colorScheme = useColorScheme();

  let theme = colorScheme === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;

  return (
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
              headerStyle: {backgroundColor: theme.colors.primary},
            }}
          />
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
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
            name="AddMeasurement"
            component={AddMeasurement}
            options={{
              title: t('measurements:title', {petName}),
              headerStyle: {backgroundColor: theme.colors.primaryContainer},
            }}
          />
          <Stack.Screen
            name="EditMeasurement"
            component={EditMeasurement}
            options={{
              title: t('measurements:title', {petName}),
              headerStyle: {backgroundColor: theme.colors.primaryContainer},
            }}
          />
          <Stack.Screen
            name="AllMeasurements"
            component={AllMeasurementsScreen}
            options={{
              title: t('measurements:allMeasurements'),
              headerStyle: {backgroundColor: theme.colors.primaryContainer},
            }}
          />
          <Stack.Screen name="IapScreen" component={IapScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default withIAPContext(App);
