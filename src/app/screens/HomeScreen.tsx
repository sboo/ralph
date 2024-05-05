import React, {useEffect, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {Dimensions, SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {Card, FAB, Icon, Text, useTheme} from 'react-native-paper';
import {HomeScreenNavigationProps} from '@/features/navigation/types.tsx';
import {SkeletonSimpler} from 'react-native-skeleton-simpler';
import HomeHeader from '@/features/homeHeader/components/HomeHeader.tsx';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import useAssessmentExporter from '@/features/pdfExport/hooks/useAssessmentExporter.ts';
import AssessmentChart from '@/features/charts/components/AssessmentChart';
import Tips from '@/features/tips/components/Tips';
import TaslkToVetTip from '@/features/tips/components/TalkToVetTip';
import usePet from '@/features/pets/hooks/usePet';
import useAssessments from '@/features/assessments/hooks/useAssessments';
import {EVENT_NAMES, event} from '@/features/events';

const HomeScreen: React.FC<HomeScreenNavigationProps> = ({navigation}) => {
  const {t} = useTranslation();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [averageScore, setAverageScore] = useState(60);
  const theme = useTheme();
  const {activePet} = usePet();
  const {generateAndSharePDF} = useAssessmentExporter();
  const {assessments, lastAssessments} = useAssessments(activePet);
  const [loading, setLoading] = useState(false);

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
      // date.setDate(date.getDate() - 11);
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

  // eslint-disable-next-line react/no-unstable-nested-components
  const RedDot = () => (
    <Text variant={'bodyLarge'} style={{color: theme.colors.error}}>
      ⬤
    </Text>
  );

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
          layout={[
            {
              width: width,
              height: 210,
              margin: 20,
              borderRadius: 15,
              marginBottom: 25,
              backgroundColor: theme.colors.primaryContainer,
            },
            {
              width: width,
              height: height + 45,
              margin: 20,
              borderRadius: 15,
              backgroundColor: theme.colors.primaryContainer,
            },
          ]}>
          <ScrollView style={styles.bodyContainer}>
            <AssessmentChart onDataPointClick={addOrEditAssessment} />
            {assessments && assessments.length > 0 ? (
              averageScore < 30 ? (
                <TaslkToVetTip />
              ) : (
                <Tips assessment={lastAssessment!} />
              )
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
        </SkeletonSimpler>
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
                generateAndSharePDF();
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
});

export default HomeScreen;
