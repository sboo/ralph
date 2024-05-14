import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {FAB, useTheme} from 'react-native-paper';
import {HomeScreenNavigationProps} from '@/features/navigation/types.tsx';
import {SkeletonSimpler} from 'react-native-skeleton-simpler';
import HomeHeader from '@/features/homeHeader/components/HomeHeader.tsx';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import useAssessmentExporter from '@/features/pdfExport/hooks/useAssessmentExporter.ts';
import AssessmentChart from '@/features/charts/components/AssessmentChart';
import Tips from '@/features/tips/components/Tips';
import TalkToVetTip from '@/features/tips/components/TalkToVetTip';
import GetStartedTip from '@/features/tips/components/GetStartedTip';
import usePet from '@/features/pets/hooks/usePet';
import useAssessments from '@/features/assessments/hooks/useAssessments';
import {EVENT_NAMES, event} from '@/features/events';
import {DateData} from 'react-native-calendars';
import AssessmentsCalendar from '@/features/assessments/components/AssessmentsCalendar';

const HomeScreen: React.FC<HomeScreenNavigationProps> = ({navigation}) => {
  const {t} = useTranslation();
  const [averageScore, setAverageScore] = useState(60);
  const theme = useTheme();
  const {activePet} = usePet();
  const {generateAndSharePDF} = useAssessmentExporter();
  const {assessments, lastAssessments} = useAssessments(activePet);
  const [viewMode, setViewMode] = useState<'chart' | 'calendar'>('chart');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debug = true;

  useEffect(() => {
    const petIsSwitching = () => {
      setLoading(true);
    };
    event.on(EVENT_NAMES.SWITCHING_PET, petIsSwitching);
    return () => {
      event.off(EVENT_NAMES.SWITCHING_PET, petIsSwitching);
    };
  }, []);

  useEffect(() => {
    if (activePet) {
      event.emit(EVENT_NAMES.FINISHED_SWITCHING_PET, activePet._id);
      setLoading(false);
    }
  }, [activePet]);

  useEffect(() => {
    if (!activePet) {
      navigation.reset({
        index: 0,
        routes: [{name: 'Welcome'}],
      });
    }
  }, [activePet, navigation]);

  const lastAssessment =
    assessments && assessments.length > 0
      ? assessments[assessments.length - 1]
      : null;

  useEffect(() => {
    if (!lastAssessments?.length || lastAssessments.length < 5) {
      setAverageScore(60);
    } else {
      const lastSevenAssessments = lastAssessments.slice(0, 7);
      const sum = lastSevenAssessments
        .filter(assessment => assessment.createdAt !== undefined)
        .reduce((acc, assessment) => acc + assessment.score, 0);
      setAverageScore(sum / lastSevenAssessments.length);
    }
  }, [lastAssessments]);

  const addOrEditAssessment = (date?: Date) => {
    if (!date) {
      date = new Date();
    }
    const today = moment(date).format('YYYY-MM-DD');
    const assessment = assessments?.find(m => m.date === today);
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

  const onCalendarDayPress = (dateData: DateData) => {
    addOrEditAssessment(new Date(dateData.dateString));
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'chart' ? 'calendar' : 'chart');
  };

  const width = Dimensions.get('window').width - 40;
  const height = (width / 16) * 7;

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
        <HomeHeader />
        <SkeletonSimpler
          loading={loading}
          layout={
            viewMode === 'chart'
              ? [
                  {
                    width: width,
                    height: 210,
                    margin: 20,
                    borderRadius: 15,
                    marginBottom: 25,
                    backgroundColor: theme.colors.surface,
                  },
                  {
                    width: width,
                    height: height + 45,
                    margin: 20,
                    borderRadius: 15,
                    backgroundColor: theme.colors.surface,
                  },
                ]
              : [
                  {
                    width: width,
                    height: 335,
                    margin: 20,
                    borderRadius: 15,
                    backgroundColor: theme.colors.surface,
                  },
                ]
          }>
          <ScrollView style={styles.bodyContainer}>
            {viewMode === 'calendar' ? (
              <AssessmentsCalendar onCalendarDayPress={onCalendarDayPress} />
            ) : (
              <>
                <AssessmentChart onDataPointClick={addOrEditAssessment} />
                {activePet && assessments && assessments.length > 0 ? (
                  averageScore < 30 ? (
                    <TalkToVetTip />
                  ) : (
                    <Tips
                      assessment={lastAssessment!}
                      activePet={activePet}
                      numberOfTips={4}
                    />
                  )
                ) : (
                  <GetStartedTip />
                )}
              </>
            )}
          </ScrollView>
        </SkeletonSimpler>
        <View style={styles.fabHolder}>
          <FAB
            style={styles.fab}
            icon={'chart-bell-curve-cumulative'}
            mode={'flat'}
            onPress={toggleViewMode}
            variant={viewMode === 'chart' ? 'secondary' : 'surface'}
          />
          <FAB
            style={styles.fab}
            icon={'calendar-month-outline'}
            mode={'flat'}
            onPress={toggleViewMode}
            variant={viewMode === 'calendar' ? 'secondary' : 'surface'}
          />
        </View>
        {debug ? (
          <FAB.Group
            visible={true}
            open={isFabOpen}
            icon={isFabOpen ? 'close' : 'bug-outline'}
            actions={[
              {
                icon: 'share-variant',
                label: t('buttons:share_assessments'),
                onPress: () => {
                  generateAndSharePDF();
                },
              },
              {
                icon: 'bug-outline',
                label: 'Debug',
                onPress: () => navigation.navigate('DebugScreen'),
              },
            ]}
            onStateChange={({open}) => setIsFabOpen(open)}
          />
        ) : (
          <FAB
            style={styles.shareFab}
            icon={'share-variant'}
            mode={'flat'}
            onPress={generateAndSharePDF}
          />
        )}
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
    paddingRight: 10,
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
  fabHolder: {
    position: 'absolute',
    margin: 16,
    left: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'row',
  },
  fab: {
    margin: 8,
  },
  shareFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;
