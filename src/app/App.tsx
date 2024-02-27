import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import MeasurementScreen from './screens/MeasurementScreen';
import MeasurementsListScreen from './screens/MeasurementsListScreen';

type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  Measurement: undefined;
  AllMeasurements: undefined;
};

export type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Measurement" component={MeasurementScreen} />
        <Stack.Screen
          name="AllMeasurements"
          component={MeasurementsListScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
