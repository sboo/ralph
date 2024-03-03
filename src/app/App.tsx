import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import AddMeasurement from './screens/AddMeasurement';
import EditMeasurement from './screens/EditMeasurement';
import AllMeasurementsScreen from './screens/AllMeasurementsScreen';
import {RootStackParamList} from './navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="AddMeasurement" component={AddMeasurement} />
        <Stack.Screen name="EditMeasurement" component={EditMeasurement} />
        <Stack.Screen
          name="AllMeasurements"
          component={AllMeasurementsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
