import React, {useEffect, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/app/store/storageKeys.ts';
import {Card, FAB, Icon, Text, useTheme} from 'react-native-paper';
import {event, EVENT_NAMES} from '@/features/events';
import {useQuery} from '@realm/react';
import {Measurement} from '@/app/models/Measurement';
import {HomeScreenNavigationProps} from '@/features/navigation/types.tsx';
import HomeHeader from '@/features/homeHeader/components/HomeHeader.tsx';
import CustomDot from '@/support/components/CustomChartDot.tsx';
import {LineChartData} from 'react-native-chart-kit/dist/line-chart/LineChart';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import QuotesAndInformation from '@/support/components/QuotesAndInformation.tsx';
import PulsatingCircle from '@/support/components/PulsatingCircle';

const HomeScreen: React.FC<HomeScreenNavigationProps> = ({navigation}) => {
  const {t} = useTranslation();
  const [petName, setPetName] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const [averageScore, setAverageScore] = useState(60);

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
    if (!measurements.length || measurements.length < 5) {
      setAverageScore(60);
    } else {
      const sum = measurements.reduce(
        (acc, measurement) => acc + measurement.score,
        0,
      );
      setAverageScore(sum / measurements.length);
    }
  }, [measurements]);

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

  // eslint-disable-next-line react/no-unstable-nested-components
  const RedDot = () => (
    <Text variant={'bodyLarge'} style={{color: theme.colors.error}}>
      ⬤
    </Text>
  );

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.primaryContainer,
        ...styles.container,
      }}>
      <LinearGradient
        colors={[
          theme.colors.primaryContainer,
          theme.colors.background,
          theme.colors.primaryContainer,
        ]}
        locations={[0, 0.75, 1]}
        style={styles.gradient}>
        <HomeHeader petName={petName} />
        <ScrollView style={styles.bodyContainer}>
          <View style={styles.chartContainer}>
            <View style={styles.chartLabels}>
              <Icon
                size={20}
                source={'emoticon-excited-outline'}
                color="#4CAF50"
              />
              <Icon
                size={20}
                source={'emoticon-neutral-outline'}
                color="#F49503"
              />
              <Icon size={20} source={'emoticon-sad-outline'} color="#F44336" />
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
          {measurements.length > 0 ? (
            <QuotesAndInformation averageScore={averageScore} />
          ) : (
            <Card
              mode="contained"
              style={{
                backgroundColor: theme.colors.primaryContainer,
                ...styles.introduction,
              }}>
              <Card.Title
                title={t('introduction_title')}
                // eslint-disable-next-line react/no-unstable-nested-components
                left={props => (
                  <Icon
                    {...props}
                    source="calendar-month-outline"
                    color={theme.colors.onPrimaryContainer}
                  />
                )}
              />
              <Card.Content>
                <Text variant="bodyMedium">
                  <Trans
                    i18nKey={'introduction_text'}
                    components={{redDot: <RedDot />}}
                  />
                </Text>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
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
            // {
            //   icon: 'information-variant',
            //   label: t('about:about'),
            //   onPress: () => navigation.navigate('AboutScreen'),
            // },
            // {
            //   icon: 'bug-outline',
            //   label: 'Debug',
            //   onPress: () => navigation.navigate('DebugScreen'),
            // },
          ]}
          onStateChange={({open}) => setIsFabOpen(open)}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
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
  introduction: {
    marginTop: 45,
    borderRadius: 15,
    marginBottom: 100,
  },
});

export default HomeScreen;
