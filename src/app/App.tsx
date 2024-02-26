import React, {useState, useEffect, useCallback} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
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
  const [dbInitialized, setDbInitialized] = useState(false); // State to track DB initialization

  const initDatabase = useCallback(async () => {
    try {
      const db = await connectToDatabase();
      await createTables(db);
      setDbInitialized(true);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    initDatabase();
  }, [initDatabase]);

  if (!dbInitialized) {
    // Show a loading screen or indicator while the database is initializing
    return (
      <View style={styles.loadingIndicator}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loadingIndicator: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});

export default App;
