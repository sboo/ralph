import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { HomeScreenNavigationProps } from '@/features/navigation/types.tsx';
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
import { EVENT_NAMES, event } from '@/features/events';
import { DateData } from 'react-native-calendars';
import AssessmentsCalendar from '@/features/assessments/components/AssessmentsCalendar';
import AllNotes from '@/features/assessments/components/AllNotes';
import { BlurView } from '@react-native-community/blur';
import DeviceInfo from 'react-native-device-info';
import { useAppearance } from '../themes/hooks/useAppearance';

const HomeScreen: React.FC<HomeScreenNavigationProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [averageScore, setAverageScore] = useState(60);
  const theme = useTheme();
  const { effectiveAppearance } = useAppearance();
  const { activePet } = usePet();
  const { generateAndSharePDF } = useAssessmentExporter();
  const { assessments, lastAssessments } = useAssessments(activePet);
  const [viewMode, setViewMode] = useState<'chart' | 'calendar' | 'notes'>('chart');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  const debug = false;

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
        routes: [{ name: 'Welcome' }],
      });
    }
  }, [activePet, navigation]);

  const handleContentSizeChange = (width: number, height: number) => {
    setContentHeight(height);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    setScrollViewHeight(event.nativeEvent.layout.height);
  };

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

  const onNotePress = (assessmentId: string) => {
    navigation.navigate('EditAssessment', {
      assessmentId,
      scrollToNotes: true,
    });
  }

  const shareAssessments = useCallback(async () => {
    setGeneratingPDF(true);
    await generateAndSharePDF();
    setGeneratingPDF(false);
  }, [generateAndSharePDF]);

  const renderContent = () => {
    switch (viewMode) {
      case 'calendar':
        return (
          <AssessmentsCalendar onCalendarDayPress={onCalendarDayPress} />
        );
      case 'notes':
        return (
          <>
            <AllNotes onNotePress={onNotePress} />
          </>
        );
      case 'chart':
        return (
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
        )
    }
  }


  // Create fade in/out animation functions
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (contentHeight < scrollViewHeight - 90) {
      fadeOut();
    } else {
      fadeIn();
    }
  }, [contentHeight, scrollViewHeight]);


  const hasNotch = DeviceInfo.hasNotch();

  const renderFooterBackground = () => {
    if (Platform.OS === 'ios') {
      return (
        <Animated.View style={{ opacity: fadeAnim }}>
          <BlurView
            style={hasNotch ? styles.footerBlurBackgroundNotch : styles.footerBlurBackground}
            blurType={effectiveAppearance === 'dark' ? 'dark' : 'light'}
          ></BlurView>
        </Animated.View>
      )
    } else {
      return (
        <LinearGradient
          colors={[
            'transparent',
            theme.colors.primaryContainer,
          ]}
          locations={[0, 0.75]}
          style={styles.footerGradientBackground}
        />
      )
    }
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.primaryContainer,
        ...styles.container,
      }}>
      <LinearGradient
        colors={viewMode == 'notes' ? [
          theme.colors.primaryContainer,
          theme.colors.primaryContainer,
          theme.colors.primaryContainer
        ] : [
          theme.colors.primaryContainer,
          theme.colors.background,
          theme.colors.primaryContainer,
        ]}
        locations={[0, 0.35, 1]}
        style={styles.gradient}>
        <HomeHeader />
        <ScrollView
          style={styles.bodyContainer}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
        >
          <View style={styles.bodyContentHolder}>
            {renderContent()}
          </View>
        </ScrollView>
        {renderFooterBackground()}
        <View style={styles.fabHolder}>
          <FAB
            style={styles.fab}
            icon={'chart-bell-curve-cumulative'}
            mode={'flat'}
            onPress={() => setViewMode('chart')}
            variant={viewMode === 'chart' ? 'secondary' : 'surface'}
          />
          <FAB
            style={styles.fab}
            icon={'calendar-month-outline'}
            mode={'flat'}
            onPress={() => setViewMode('calendar')}
            variant={viewMode === 'calendar' ? 'secondary' : 'surface'}
          />
          <FAB
            style={styles.fab}
            icon={'note-outline'}
            mode={'flat'}
            onPress={() => setViewMode('notes')}
            variant={viewMode === 'notes' ? 'secondary' : 'surface'}
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
            onStateChange={({ open }) => setIsFabOpen(open)}
          />
        ) : (
          assessments && assessments.length > 0 && (
            <FAB
              style={styles.shareFab}
              icon={'share-variant'}
              mode={'flat'}
              loading={generatingPDF}
              onPress={shareAssessments}
              variant='surface'
            />
          )
        )}
      </LinearGradient>
    </SafeAreaView >
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
    paddingBottom: 100,
  },
  bodyContentHolder: {
    paddingBottom: 100
  },
  footerBlurBackgroundNotch: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 5,
    height: 75,
    borderRadius: 20,
  },
  footerBlurBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    width: '100%',
  },
  footerGradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    width: '100%',
  },
  fabHolder: {
    position: 'absolute',
    marginLeft: 25,
    marginBottom: 15,
    left: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'row',
    gap: 10
  },
  fab: {

  },
  shareFab: {
    position: 'absolute',
    marginRight: 25,
    marginBottom: 15,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;
