import React, {useCallback, useEffect, useState} from 'react';
import {Platform, StatusBar} from 'react-native';
import {
  PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
  adaptNavigationTheme,
} from 'react-native-paper';
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import AddMeasurement from './screens/AddMeasurement';
import EditMeasurement from './screens/EditMeasurement';
import IapScreen from './screens/IapScreen';
import AllMeasurementsScreen from './screens/AllMeasurementsScreen';
import {RootStackParamList} from './navigation/types';
import defaultColors from '../themes/lightTheme.json';
import darkColors from '../themes/darkTheme.json';
import merge from 'deepmerge';
import {useColorScheme} from 'react-native';
import CustomNavigationBar from '../components/CustomNavigationBar';
import {useTranslation} from 'react-i18next';
import {withIAPContext, useIAP} from 'react-native-iap';
import {STORAGE_KEYS} from '../support/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {EVENT_NAMES, event} from './event';

const Stack = createNativeStackNavigator<RootStackParamList>();
StatusBar.setBarStyle('dark-content');
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
    await getPurchaseHistory();
    const purchased =
      purchaseHistory.findIndex(p => p.productId === 'eu.sboo.ralph.coffee') >
      -1;
    await AsyncStorage.setItem(
      STORAGE_KEYS.COFFEE_PURCHASED,
      purchased ? 'true' : 'false',
    );
    await AsyncStorage.setItem(STORAGE_KEYS.FRESH_INSTALL, 'false');
    event.emit(EVENT_NAMES.COFFEE_PURCHASED, purchased);
  }, [getPurchaseHistory, purchaseHistory]);

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

  useEffect(() => {
    if (currentPurchaseError) {
      console.warn('currentPurchaseError', currentPurchaseError);
    }
  }, [currentPurchaseError]);

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

  useEffect(() => {
    const fetchPetName = async () => {
      const name = await AsyncStorage.getItem(STORAGE_KEYS.PET_NAME);
      if (name !== null) {
        setPetName(name);
      }
    };

    fetchPetName();
  }, []);

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
      <NavigationContainer>
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
