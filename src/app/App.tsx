import React from 'react';
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
import AddMeasurement from './screens/AddMeasurement';
import EditMeasurement from './screens/EditMeasurement';
import AllMeasurementsScreen from './screens/AllMeasurementsScreen';
import {RootStackParamList} from './navigation/types';
import defaultColors from '../themes/lightTheme.json';
import darkColors from '../themes/darkTheme.json';
import merge from 'deepmerge';
import {useColorScheme} from 'react-native';
import CustomNavigationBar from '../components/CustomNavigationBar';
import {useTranslation} from 'react-i18next';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const {t} = useTranslation();
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
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AddMeasurement"
            component={AddMeasurement}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="EditMeasurement"
            component={EditMeasurement}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AllMeasurements"
            component={AllMeasurementsScreen}
            options={{title: t('measurements:allMeasurements')}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
