import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, Dimensions, View} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../support/storageKeys';
import {FAB, Icon} from 'react-native-paper';
import {EVENT_NAMES, event} from '../event';
import {useQuery} from '@realm/react';
import {Measurement} from '../../models/Measurement';
import {useTheme} from 'react-native-paper';
import {HomeScreenNavigationProps} from '../navigation/types';
import HomeHeader from '../../components/HomeHeader';
import CustomDot from '../../components/CustomChartDot';
import {LineChartData} from 'react-native-chart-kit/dist/line-chart/LineChart';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import QuotesAndInformation from '../../components/QuotesAndInformation';

const HomeScreen: React.FC<HomeScreenNavigationProps> = ({navigation}) => {
  const {t} = useTranslation();
  const [petName, setPetName] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [dateRange, setDateRange] = useState<Date[]>([]);

  const theme = useTheme();

  const measurements = useQuery(
    Measurement,
    collection => {
      return collection
        .filtered('createdAt >= $0', dateRange[0])
        .sorted('createdAt');
    },
    [dateRange],
  );

  useEffect(() => {
    const fetchPetName = async () => {
      const name = await AsyncStorage.getItem(STORAGE_KEYS.PET_NAME);
      if (name !== null) {
        setPetName(name);
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: 'Welcome'}],
        });
      }
    };

    fetchPetName();

    const onProfileSet = () => {
      fetchPetName();
    };

    event.on(EVENT_NAMES.PROFILE_SET, onProfileSet);

    return () => {
      event.off(EVENT_NAMES.PROFILE_SET, onProfileSet);
    };
  }, [navigation]);

  useEffect(() => {
    const getDateRange = () => {
      const start = new Date();
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
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
        m => m.date === moment(date).format('YYYY-MM-DD'),
      );
      return measurement ? measurement.score : null;
    });
    return scoresWithDates;
  };

  const getAverageScore = () => {
    const nonNullScores = getScores().filter(
      score => score !== null,
    ) as number[];
    if (!nonNullScores.length) {
      return 60;
    }
    const sum = nonNullScores.reduce((acc, score) => acc + score, 0);
    return sum / nonNullScores.length;
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
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      },
      {
        data: [0],
        withDots: false,
      },
      {
        data: [60],
        withDots: false,
      },
    ],
  };

  const addOrEditMeasurement = (date?: Date) => {
    if (!date) {
      date = new Date();
    }
    const today = moment(date).format('YYYY-MM-DD');
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
    <LinearGradient
      colors={[theme.colors.primaryContainer, theme.colors.background]}
      style={styles.container}>
      <HomeHeader petName={petName} />
      <View style={styles.bodyContainer}>
        <View style={styles.chartContainer}>
          <View style={styles.chartLabels}>
            <Icon
              size={20}
              source={'emoticon-excited-outline'}
              color="#008000"
            />
            <Icon size={20} source={'emoticon-happy-outline'} color="#FFA500" />
            <Icon size={20} source={'emoticon-sad-outline'} color="#FF0000" />
          </View>
          <LineChart
            data={data as LineChartData}
            width={Dimensions.get('window').width - 40}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero={true}
            withInnerLines={false}
            withOuterLines={false}
            withHorizontalLabels={false}
            chartConfig={{
              backgroundGradientFrom: theme.colors.primaryContainer,
              backgroundGradientTo: theme.colors.primaryContainer,
              backgroundGradientFromOpacity: 0,
              backgroundGradientToOpacity: 1,
              decimalPlaces: 0, // optional, defaults to 2dp
              color: () => theme.colors.onPrimaryContainer,
              labelColor: () => theme.colors.onPrimaryContainer,
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#fff',
              },
            }}
            renderDotContent={({x, y, index, indexData}): any => (
              <CustomDot
                key={index}
                value={indexData}
                index={index}
                x={x}
                y={y}
                scores={data.datasets[0].data as number[]}
              />
            )}
            bezier
            style={styles.chart}
            onDataPointClick={({index}) => {
              addOrEditMeasurement(dateRange[index]);
            }}
          />
        </View>
        <QuotesAndInformation averageScore={getAverageScore()} />
        <FAB.Group
          visible={true}
          open={isFabOpen}
          icon={isFabOpen ? 'close' : 'plus'}
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
    </LinearGradient>
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
    flexDirection: 'row',
    borderRadius: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLabels: {
    justifyContent: 'space-around',
    height: 195,
    left: 25,
    position: 'absolute',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default HomeScreen;
