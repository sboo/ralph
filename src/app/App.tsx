import React, {useEffect, useCallback} from 'react';
import {connectToDatabase, createTables} from '../support/storage/database';
import {NavigationContainer} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import '../support/translations/i18n';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import MeasurementScreen from './screens/MeasurementScreen';

type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  Measurement: undefined;
};

export type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const initDatabase = useCallback(async () => {
    try {
      const db = await connectToDatabase();
      await createTables(db);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    initDatabase()
      .then(() => {
        console.log('Database initialized');
      })
      .catch(error => {
        console.error('Error initializing database: ', error);
      });
  }, [initDatabase]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Measurement" component={MeasurementScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
