import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, Dimensions, View} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../support/storageKeys';
import {Text, FAB} from 'react-native-paper';
import {EVENT_NAMES, event} from '../event';
import {useQuery} from '@realm/react';
import {Measurement} from '../../models/Measurement';
import {useTheme} from 'react-native-paper';
import {HomeScreenNavigationProps} from '../navigation/types';
import HomeHeader from '../../components/HomeHeader';

const HomeScreen: React.FC<HomeScreenNavigationProps> = ({navigation}) => {
  const {t} = useTranslation();
  const [petName, setPetName] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [dateRange, setDateRange] = useState<Date[]>([]);

  const theme = useTheme();

  const measurements = useQuery(Measurement, collection =>
    collection.sorted('createdAt'),
  );

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

    const onProfileSet = () => {
      fetchDogName();
    };

    event.on(EVENT_NAMES.PROFILE_SET, onProfileSet);

    return () => {
      event.off(EVENT_NAMES.PROFILE_SET, onProfileSet);
    };
  }, [navigation]);

  useEffect(() => {
    const getDateRange = () => {
      const start = new Date(new Date().setDate(new Date().getDate() - 6));
      const _dateRange = Array.from({length: 7}, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date;
      });
      setDateRange(_dateRange);
    };

    getDateRange();
  }, []);

  const getLabels = () => {
    return dateRange.map(date =>
      date.toLocaleDateString('en-US', {weekday: 'short'}),
    );
  };

  const getScores = () => {
    const scoresWithDates = dateRange.map(date => {
      const measurement = measurements.find(
        m => m.date === date.toISOString().split('T')[0],
      );
      return measurement ? measurement.score : null;
    });
    return scoresWithDates;
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

  const addOrEditMeasurement = (date?: Date) => {
    if (!date) {
      date = new Date();
    }
    const today = date.toISOString().split('T')[0];
    const measurement = measurements.find(m => m.date === today);
    if (measurement === undefined) {
      navigation.navigate('AddMeasurement', {
        timestamp: date.getTime(),
      });
    } else {
      navigation.navigate('EditMeasurement', {
        measurementId: measurement._id.toHexString(),
      });
    }
  };

  return (
    <View
      style={{backgroundColor: theme.colors.background, ...styles.container}}>
      <HomeHeader petName={petName} />
      <View style={styles.bodyContainer}>
        <View
          style={{
            backgroundColor: theme.colors.secondaryContainer,
            ...styles.chartContainer,
          }}>
          <Text
            style={{
              color: theme.colors.onSecondaryContainer,
              ...styles.chartTitle,
            }}>
            {t('measurements:pastMeasurements')}
          </Text>
          <LineChart
            data={data}
            width={Dimensions.get('window').width - 40}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero={true}
            withInnerLines={false}
            withOuterLines={false}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              backgroundGradientFromOpacity: 0,
              backgroundGradientToOpacity: 0,
              decimalPlaces: 0, // optional, defaults to 2dp
              color: () => theme.colors.onSecondaryContainer,
              labelColor: () => theme.colors.onSecondaryContainer,
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#fff',
              },
            }}
            bezier
            style={styles.chart}
            onDataPointClick={({index}) => {
              addOrEditMeasurement(dateRange[index]);
            }}
          />
        </View>
        <FAB.Group
          visible={true}
          open={isFabOpen}
          icon={isFabOpen ? 'close' : 'emoticon-outline'}
          actions={[
            {
              icon: 'pencil-plus',
              label: t('measurements:todaysMeasurement'),
              onPress: () => addOrEditMeasurement(),
            },
            {
              icon: 'format-list-bulleted',
              label: t('measurements:allMeasurements'),
              onPress: () => navigation.navigate('AllMeasurements'),
            },
          ]}
          onStateChange={({open}) => setIsFabOpen(open)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bodyContainer: {
    flex: 1,
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  chartContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: 16,
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
