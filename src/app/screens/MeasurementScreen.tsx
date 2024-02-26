import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {event} from '../event';
import {Text, StyleSheet, ScrollView} from 'react-native';
import {Button} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../support/storageKeys';
import {
  connectToDatabase,
  fetchMeasurementByDate,
  insertMeasurement,
} from '../../support/storage/database';
import {NavigationProp, ParamListBase} from '@react-navigation/native';
import {Measurement} from '../../support/models/measurements';
import RatingButtons from '../../support/components/RatingButtons';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const MeasurementScreen: React.FC<Props> = ({navigation}) => {
  const {t} = useTranslation();
  const [hurt, setHurt] = useState<number | undefined>(undefined);
  const [hunger, setHunger] = useState<number | undefined>(undefined);
  const [hydration, setHydration] = useState<number | undefined>(undefined);
  const [hygiene, setHygiene] = useState<number | undefined>(undefined);
  const [happiness, setHappiness] = useState<number | undefined>(undefined);
  const [mobility, setMoboility] = useState<number | undefined>(undefined);

  const [petName, setPetName] = useState('');
  const [date] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchDogName = async () => {
      const name = await AsyncStorage.getItem(STORAGE_KEYS.PET_NAME);
      if (name !== null) {
        setPetName(name);
      }
    };

    fetchDogName();

    const fetchTodaysMeasurement = async () => {
      const db = await connectToDatabase();
      try {
        const measurement = await fetchMeasurementByDate(db, date);
        if (measurement) {
          console.log('Measurement found: ', measurement);
          setHurt(measurement.hurt);
          setHunger(measurement.hunger);
          setHydration(measurement.hydration);
          setHygiene(measurement.hygiene);
          setHappiness(measurement.happiness);
          setMoboility(measurement.mobility);
        }
      } catch (e) {
        // Error fetching data
        console.error(e);
      }
    };

    fetchTodaysMeasurement();
  }, [date]);

  const metrics = {
    hurt,
    hunger,
    hydration,
    hygiene,
    happiness,
    mobility,
  };

  const isMetricsFilled = Object.values(metrics).every(
    value => value !== undefined,
  );

  const handleSubmit = async () => {
    if (isMetricsFilled) {
      const score = Object.values(metrics).reduce(
        (acc, value) => acc! + (value as number),
        0,
      );

      const measurement: Measurement = {
        date,
        score: score || 0,
        hurt: hurt || 0,
        hunger: hunger || 0,
        hydration: hydration || 0,
        hygiene: hygiene || 0,
        happiness: happiness || 0,
        mobility: mobility || 0,
      };

      try {
        const db = await connectToDatabase();
        await insertMeasurement(db, measurement);
        event.emit('measurementAdded');
        navigation.goBack();
      } catch (e) {
        // Error saving data
        console.log(e);
      }
    } else {
      // Handle case when metrics are not filled
      console.log('Please fill in all metrics');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('measurements.title')}</Text>
      <Text style={styles.label}>{t('measurements.hurt')}</Text>
      <Text style={styles.info}>{t('measurements.hurtInfo', {petName})}</Text>
      <RatingButtons
        onRatingChange={value => setHurt(parseInt(value, 10))}
        initialRating={hurt?.toString() || ''}
      />

      <Text style={styles.label}>{t('measurements.hunger')}</Text>
      <Text style={styles.info}>{t('measurements.hungerInfo', {petName})}</Text>
      <RatingButtons
        onRatingChange={value => setHunger(parseInt(value, 10))}
        initialRating={hunger?.toString() || ''}
      />
      <Text style={styles.label}>{t('measurements.hydration')}</Text>
      <Text style={styles.info}>
        {t('measurements.hydrationInfo', {petName})}
      </Text>
      <RatingButtons
        onRatingChange={value => setHydration(parseInt(value, 10))}
        initialRating={hydration?.toString() || ''}
      />
      <Text style={styles.label}>{t('measurements.hygiene')}</Text>
      <Text style={styles.info}>
        {t('measurements.hygieneInfo', {petName})}
      </Text>
      <RatingButtons
        onRatingChange={value => setHygiene(parseInt(value, 10))}
        initialRating={hygiene?.toString() || ''}
      />
      <Text style={styles.label}>{t('measurements.happiness')}</Text>
      <Text style={styles.info}>
        {t('measurements.happinessInfo', {petName})}
      </Text>
      <RatingButtons
        onRatingChange={value => setHappiness(parseInt(value, 10))}
        initialRating={happiness?.toString() || ''}
      />
      <Text style={styles.label}>{t('measurements.mobility')}</Text>
      <Text style={styles.info}>
        {t('measurements.mobilityInfo', {petName})}
      </Text>
      <RatingButtons
        onRatingChange={value => setMoboility(parseInt(value, 10))}
        initialRating={mobility?.toString() || ''}
      />
      <Button
        disabled={!isMetricsFilled}
        onPress={handleSubmit}
        mode={'contained'}>
        {t('buttons.submit')}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  slider: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    marginBottom: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
});

export default MeasurementScreen;
