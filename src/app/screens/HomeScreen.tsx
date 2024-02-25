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
import {
  connectToDatabase,
  fetchLastWeeksMeasurements,
} from '../../support/storage/database';
import {event} from '../event';

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
      } else {
        navigation.navigate('Welcome');
      }
    };

    fetchDogName();

    const onPetNameSet = () => {
      fetchDogName();
    };

    event.on('petNameSet', onPetNameSet);

    return () => {
      event.off('petNameSet', onPetNameSet);
    };
  }, [navigation]);

  useEffect(() => {
    console.log('Fetching measurements');
    const loadMeasurements = async () => {
      try {
        const db = await connectToDatabase();
        const fetchedMeasurements = await fetchLastWeeksMeasurements(db);
        setMeasurements(fetchedMeasurements);
      } catch (e) {
        // Error fetching data
        console.error(e);
      }
    };

    loadMeasurements();

    const onMeasurementAdded = () => {
      console.log('Measurement added event received. Reloading measurements.');
      loadMeasurements();
    };

    event.on('measurementAdded', onMeasurementAdded);

    return () => {
      event.off('measurementAdded', onMeasurementAdded);
    };
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

  const getLabels = () => {
    const start = new Date(new Date().setDate(new Date().getDate() - 6));
    return Array.from({length: 7}, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date.toLocaleDateString('en-US', {weekday: 'short'});
    });
  };

  const getScores = () => {
    const scores = measurements.map(measurement => measurement.score);
    const paddedScores = Array(7 - scores.length)
      .fill(null)
      .concat(scores);
    return paddedScores;
  };

  const getAverageScore = () => {
    const scores = measurements.map(measurement => measurement.score);
    return scores.reduce((acc, score) => acc + score, 0) / scores.length;
  };

  const data = {
    labels: getLabels(),
    datasets: [
      {
        data: getScores(),
      },
      {
        data: [30, 30, 30, 30, 30, 30, 30],
        withDots: false,
      },
    ],
  };

  const getBackgroundColor = () => {
    const averageScore = getAverageScore();
    if (averageScore < 30) {
      return '#d10808';
    }
    if (averageScore < 60) {
      return '#FFA500';
    }
    return '#1a8a34';
  };

  const getBackgroundGradientTo = () => {
    const averageScore = getAverageScore();
    if (averageScore < 30) {
      return '#FF6347';
    }
    if (averageScore < 60) {
      return '#edc600';
    }
    return '#07ad2e';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>{`${getGreeting()}, ${petName}`}</Text>
      
      <Text style={styles.chartTitle}>Past Measurements</Text>
      <LineChart
        data={data}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        fromZero={true}
        chartConfig={{
          backgroundColor: getBackgroundColor(),
          backgroundGradientFrom: getBackgroundColor(),
          backgroundGradientTo: getBackgroundGradientTo(),
          decimalPlaces: 0, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: getBackgroundColor(),
          },
        }}
        bezier
        style={styles.chart}
      />
      <Button
        title="Start Today's Measurement"
        onPress={() => navigation.navigate('Measurement')}
      />
      <Button
        title="All Measurements"
        color={'#1a8a34'}
        onPress={() => navigation.navigate('AllMeasurements')}
      />
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default HomeScreen;
