import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../support/storageKeys';
import {NavigationProp, ParamListBase} from '@react-navigation/native';
import {Measurement} from '../../support/models/measurements';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const {t} = useTranslation();
  const [petName, setPetName] = useState('');
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  useEffect(() => {
    const fetchDogName = async () => {
      const name = await AsyncStorage.getItem(STORAGE_KEYS.PET_NAME);
      if (name !== null) {
        setPetName(name);
      }
    };

    fetchDogName();
  }, []);

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const measurementKeys = keys.filter(key => key.startsWith('metrics_'));
        const stores = await AsyncStorage.multiGet(measurementKeys);
        const fetchedMeasurements = stores.map((result, i, store) => {
          return JSON.parse(store[i][1] as string) as Measurement;
        });
        setMeasurements(fetchedMeasurements);
      } catch (e) {
        // Error fetching data
        console.error(e);
      }
    };

    fetchMeasurements();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return t('greeting_morning');
    }
    if (hour < 18) {
      return t('greeting_afternoon');
    }
    return t('greeting_evening');
  };

  // Placeholder data for the chart
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Example week days
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50], // Example data
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>{`${getGreeting()}, ${petName}`}</Text>
      <Button
        title="Start Today's HHHHMM Measurement"
        onPress={() => navigation.navigate('Measurement')}
      />

      {/* Chart to display HHHHMM measurements */}
      <Text style={styles.chartTitle}>Past HHHHMM Measurements</Text>
      <LineChart
        data={data}
        width={Dimensions.get('window').width - 20} // from react-native
        height={220}
        yAxisLabel=""
        yAxisSuffix=" units"
        yAxisInterval={1} // optional, defaults to 1
        chartConfig={{
          backgroundColor: '#e26a00',
          backgroundGradientFrom: '#fb8c00',
          backgroundGradientTo: '#ffa726',
          decimalPlaces: 0, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#ffa726',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      <Text style={styles.title}>HHHHMM Measurements</Text>
      {measurements.map((measurement, index) => (
        <View key={index} style={styles.measurementItem}>
          <Text>Date: {measurement.date}</Text>
          <Text>Hurt: {measurement.hurt}</Text>
          <Text>Hunger: {measurement.hunger}</Text>
          <Text>Hydration: {measurement.hydration}</Text>
          <Text>Hygiene: {measurement.hygiene}</Text>
          <Text>Happiness: {measurement.happiness}</Text>
          <Text>Health: {measurement.health}</Text>
          <Text>Mobility: {measurement.mobility}</Text>
          <Text>More good days: {measurement.moreGoodDays}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  greeting: {
    fontSize: 22,
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 18,
    marginVertical: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  measurementItem: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
});

export default HomeScreen;
