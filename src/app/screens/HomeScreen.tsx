import { database } from '@/app/database';
import { Assessment } from '@/app/database/models/Assessment';
import { Pet } from '@/app/database/models/Pet';
import AllNotes from '@/features/assessments/components/AllNotes';
import AssessmentsCalendar from '@/features/assessments/components/AssessmentsCalendar';
import AssessmentChart from '@/features/charts/components/AssessmentChart';
import { EVENT_NAMES, event } from '@/features/events';
import HomeHeader from '@/features/homeHeader/components/HomeHeader.tsx';
import { HomeScreenNavigationProps } from '@/features/navigation/types.tsx';
import useAssessmentExporter from '@/features/pdfExport/hooks/useAssessmentExporter.ts';
import GetStartedTip from '@/features/tips/components/GetStartedTip';
import TalkToVetTip from '@/features/tips/components/TalkToVetTip';
import Tips from '@/features/tips/components/Tips';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import { BlurView } from '@react-native-community/blur';
import moment from 'moment';
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
import { DateData } from 'react-native-calendars';
import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';
import { FAB, useTheme } from 'react-native-paper';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { useAppearance } from '../themes/hooks/useAppearance';

// The presentational component that will be enhanced with observables
const HomeScreenComponent = ({ 
  navigation, 
  activePet, 
  assessments, 
  lastAssessments,
  allPets
}: HomeScreenNavigationProps & { 
  activePet: Pet | undefined, 
  assessments: Assessment[], 
  lastAssessments: Assessment[],
  allPets: Pet[]
}) => {
  const { t } = useTranslation();
  const [averageScore, setAverageScore] = useState(60);
  const theme = useTheme();
  const { effectiveAppearance } = useAppearance();
  const { generateAndSharePDF } = useAssessmentExporter();
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
      event.emit(EVENT_NAMES.FINISHED_SWITCHING_PET, activePet.id);
      setLoading(false);
    }
  }, [activePet]);

  useEffect(() => {
    if (!allPets || allPets.length === 0) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    }
  }, [allPets, navigation]);

  const handleContentSizeChange = (width: number, height: number) => {
    setContentHeight(height);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    setScrollViewHeight(event.nativeEvent.layout.height);
  };

  const lastAssessment = assessments && assessments.length > 0 ? assessments[assessments.length - 1] : null;

  useEffect(() => {
    if (!lastAssessments?.length || lastAssessments.length < 5) {
      setAverageScore(60);
    } else {
      const lastSevenAssessments = lastAssessments.slice(0, 7);
      const sum = lastSevenAssessments.reduce((acc, assessment) => acc + assessment.score, 0);
      setAverageScore(sum / lastSevenAssessments.length);
    }
  }, [lastAssessments]);

  const addOrEditAssessment = (date?: Date) => {
    if (!date) {
      date = new Date();
    }
    const assessmentDate = moment(date).format('YYYY-MM-DD');
    const assessment = assessments?.find(m => m.date === assessmentDate);
  
    if (assessment === undefined) {
      navigation.navigate('AddAssessment', {
        timestamp: date.getTime(),
      });
    } else {
      navigation.navigate('EditAssessment', {
        assessmentId: assessment.id,
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

// Connect the component with WatermelonDB observables
const enhance = withObservables([], () => {
  // Get active pet
  const activePetObservable = database
    .get<Pet>('pets')
    .query(Q.where('is_active', true))
    .observe()
    .pipe(map(pets => pets.length > 0 ? pets[0] : undefined));

  // Create assessments observable that depends on the active pet
  const assessmentsObservable = activePetObservable.pipe(
    switchMap(pet => {
      if (!pet) {
        return new Observable<Assessment[]>(subscriber => subscriber.next([]));
      }
      return database
        .get<Assessment>('assessments')
        .query(Q.where('pet_id', pet.id), Q.sortBy('created_at', 'asc'))
        .observe();
    })
  );

  // Create last assessments observable for the active pet
  const lastAssessmentsObservable = activePetObservable.pipe(
    switchMap(pet => {
      if (!pet) {
        return new Observable<Assessment[]>(subscriber => subscriber.next([]));
      }
      return database
        .get<Assessment>('assessments')
        .query(Q.where('pet_id', pet.id), Q.sortBy('created_at', 'desc'))
        .observe();
    })
  );

  return {
    allPets: database.get<Pet>('pets').query(),
    activePet: activePetObservable,
    assessments: assessmentsObservable,
    lastAssessments: lastAssessmentsObservable,
  };
});

// Export the enhanced component
export default enhance(HomeScreenComponent);
