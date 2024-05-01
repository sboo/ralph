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
import AddAssessment from './screens/AddAssessment';
import EditAssessment from './screens/EditAssessment';
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
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Pet} from '@/app/models/Pet';
import {useQuery, useRealm} from '@realm/react';
import {getPetData} from '@/app/store/helper';

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

  const realm = useRealm();

  const pets = useQuery(
    Pet,
    collection => {
      return collection.filtered('name = $0', 'INITIAL PET NAME');
    },
    [],
  );

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

  const fixPetData = useCallback(async () => {
    // Fix pet data for existing installs with realm schema version 1
    if (realm.schemaVersion === 1) {
      console.log('fixPetData');
      const petData = await getPetData();
      pets.forEach(pet => {
        realm.write(() => {
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
  }, [pets, realm]);

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

  // Fetch pet name from storage
  useEffect(() => {
    const fetchPetName = async () => {
      const name = await AsyncStorage.getItem(STORAGE_KEYS.PET_NAME);
      if (name !== null) {
        setPetName(name);
      }
    };

    fetchPetName();

    const onProfileSet = () => {
      fetchPetName();
    };

    event.on(EVENT_NAMES.PROFILE_SET, onProfileSet);

    return () => {
      event.off(EVENT_NAMES.PROFILE_SET, onProfileSet);
    };
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
    <GestureHandlerRootView style={{flex: 1}}>
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
              name="AddAssessment"
              component={AddAssessment}
              options={{
                title: t('measurements:title', {petName}),
                headerStyle: {backgroundColor: theme.colors.primaryContainer},
              }}
            />
            <Stack.Screen
              name="EditAssessment"
              component={EditAssessment}
              options={{
                title: t('measurements:title', {petName}),
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
    </GestureHandlerRootView>
  );
};

export default withIAPContext(App);
