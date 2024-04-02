import React, {useEffect, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/app/store/storageKeys.ts';
import {Card, FAB, Icon, Text, useTheme} from 'react-native-paper';
import {event, EVENT_NAMES} from '@/features/events';
import {useQuery} from '@realm/react';
import {Measurement} from '@/app/models/Measurement';
import {HomeScreenNavigationProps} from '@/features/navigation/types.tsx';
import HomeHeader from '@/features/homeHeader/components/HomeHeader.tsx';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import useAssessmentExporter from '@/features/pdfExport/hooks/useAssessmentExporter.ts';
import AssessmentChart from '@/features/charts/components/AssessmentChart';
import Tips from '@/features/tips/components/Tips';
import TaslkToVetTip from '@/features/tips/components/TalkToVetTip';

const HomeScreen: React.FC<HomeScreenNavigationProps> = ({navigation}) => {
  const {t} = useTranslation();
  const [petName, setPetName] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [averageScore, setAverageScore] = useState(60);
  const theme = useTheme();
  const {generateAndSharePDF} = useAssessmentExporter();

  const assessments = useQuery(
    Measurement,
    collection => {
      return collection.sorted('createdAt');
    },
    [],
  );
  const lastAssessments = useQuery(
    Measurement,
    collection => {
      return collection.sorted('createdAt', true);
    },
    [],
  );

  const lastAssessment = assessments[assessments.length - 1];

  useEffect(() => {
    if (!lastAssessments.length || lastAssessments.length < 5) {
      setAverageScore(60);
    } else {
      const lastSevenAssessments = lastAssessments.slice(0, 7);
      const sum = lastSevenAssessments
        .filter(assessment => assessment.createdAt !== undefined)
        .reduce((acc, assessment) => acc + assessment.score, 0);
      setAverageScore(sum / lastSevenAssessments.length);
    }
  }, [lastAssessments]);

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
          <AssessmentChart onDataPointClick={addOrEditAssessment} />
          {assessments.length > 0 ? (
            averageScore < 30 ? (
              <TaslkToVetTip />
            ) : (
              <Tips assessment={lastAssessment} />
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
