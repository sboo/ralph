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
import {NavigationProp, ParamListBase} from '@react-navigation/native';
import {Measurement} from '../../support/models/measurements';
import {
  connectToDatabase,
  fetchMeasurements,
} from '../../support/storage/database';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const MeasurementsListScreen: React.FC<Props> = ({navigation}) => {
  const {t} = useTranslation();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  useEffect(() => {
    console.log('Fetching measurements');
    const loadMeasurements = async () => {
      try {
        const db = await connectToDatabase();
        const fetchedMeasurements = await fetchMeasurements(db);
        setMeasurements(fetchedMeasurements);
      } catch (e) {
        // Error fetching data
        console.error(e);
      }
    };

    loadMeasurements();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Measurements</Text>
      {measurements.reverse().map((measurement, index) => (
        <View key={index} style={styles.measurementItem}>
          <Text>Date: {measurement.date}</Text>
          <Text>Score: {measurement.score}</Text>
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

export default MeasurementsListScreen;
