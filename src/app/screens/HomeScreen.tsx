import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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
import useAssessmentExporter from '@/features/pdfExport/hooks/useAssessmentExporter.ts';
import {Svg} from 'react-native-svg';

const HomeScreen: React.FC<HomeScreenNavigationProps> = ({navigation}) => {
  const {t} = useTranslation();
  const [petName, setPetName] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [averageScore, setAverageScore] = useState(60);
  const [chartWidthMultiplier, setChartWidthMultiplier] = useState(1);
  const chart = useRef<Svg>(null);
  const chartScrollViewRef = useRef<ScrollView>();

  const theme = useTheme();
  const {generateAndSharePDF} = useAssessmentExporter();

  const assessments = useQuery(
    Measurement,
    collection => {
      return collection.sorted('createdAt');
    },
    [],
  );

  useEffect(() => {
    if (!assessments.length || assessments.length < 5) {
      setAverageScore(60);
    } else {
      const sum = assessments.reduce(
        (acc, assessment) => acc + assessment.score,
        0,
      );
      setAverageScore(sum / assessments.length);
    }
  }, [assessments]);

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

  const getScores = useCallback(() => {
    const startDate =
      assessments.length > 0 ? assessments[0].createdAt : new Date();
    const endDate = new Date();
    const dateRange = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const scoresWithDates = dateRange.map(date => {
      const assessment = assessments.find(
        m => m.date === moment(date).format('YYYY-MM-DD'),
      );
      return assessment ? assessment.score : null;
    });
    const labels = dateRange.map(date =>
      date.toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'}),
    );
    return {scoresWithDates, labels, dateRange};
  }, [assessments]);

  useEffect(() => {
    const firstAssessmentDate =
      assessments.length > 0 ? assessments[0].createdAt : new Date();
    const daysSinceFirstAssessment = moment().diff(
      moment(firstAssessmentDate),
      'days',
    );
    setChartWidthMultiplier(Math.max(1, daysSinceFirstAssessment / 7));
  }, [assessments]);

  const {scoresWithDates, labels, dateRange} = getScores();
  const data = {
    labels: labels,
    datasets: [
      {
        data: scoresWithDates,
      },
      {
        data: Array(scoresWithDates.length).fill(30),
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

  const addOrEditAssessment = (date?: Date) => {
    if (!date) {
      date = new Date();
      // date.setDate(date.getDate() - 11);
    }
    const today = moment(date).format('YYYY-MM-DD');
    const assessment = assessments.find(m => m.date === today);
    if (assessment === undefined) {
      navigation.navigate('AddAssessment', {
        timestamp: date.getTime(),
      });
    } else {
      navigation.navigate('EditAssessment', {
        assessmentId: assessment._id.toHexString(),
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
          <View
            style={{
              backgroundColor: theme.colors.primaryContainer,
              ...styles.chartContainer,
            }}>
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
            <ScrollView
              style={styles.chartScrollView}
              horizontal={true}
              ref={chartScrollViewRef as RefObject<ScrollView> | null}
              onContentSizeChange={() =>
                chartScrollViewRef.current?.scrollToEnd({animated: false})
              }>
              <Svg ref={chart}>
                <LineChart
                  style={styles.chart}
                  data={data as LineChartData}
                  width={
                    Dimensions.get('window').width * chartWidthMultiplier - 40
                  }
                  height={200}
                  yAxisLabel=""
                  yAxisSuffix=""
                  fromZero={true}
                  withInnerLines={false}
                  withOuterLines={false}
                  withHorizontalLabels={false}
                  xLabelsOffset={10}
                  chartConfig={{
                    fillShadowGradientToOpacity: 0,
                    fillShadowGradientFromOpacity: 0,
                    backgroundGradientFrom: theme.colors.primaryContainer,
                    backgroundGradientTo: theme.colors.primaryContainer,
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientToOpacity: 0,
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
                  onDataPointClick={({index}) => {
                    addOrEditAssessment(dateRange[index]);
                  }}
                />
              </Svg>
            </ScrollView>
          </View>
          {assessments.length > 0 ? (
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
              label: t('measurements:todaysAssessment'),
              onPress: () => addOrEditAssessment(),
            },
            {
              icon: 'format-list-bulleted',
              label: t('measurements:allAssessments'),
              onPress: () => navigation.navigate('AllAssessments'),
            },
            {
              icon: 'share-variant',
              label: t('buttons:share_assessments'),
              onPress: () => {
                chart.current?.toDataURL(chartBase64 => {
                  const dataUrl = `data:image/image/png;base64,${chartBase64}`;
                  generateAndSharePDF(dataUrl);
                });
              },
            },
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
    paddingHorizontal: 15,
  },
  chartScrollView: {
    marginLeft: 50,
    paddingBottom: 10,
  },
  chart: {
    paddingRight: 6,
  },
  chartLabels: {
    justifyContent: 'space-around',
    height: 195,
    left: 15,
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
