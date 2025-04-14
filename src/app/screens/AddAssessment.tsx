import React, {useState} from 'react';
import AssessmentItem from '@/features/assessments/components/AssessmentItem';
import {useTheme} from 'react-native-paper';
import {AddAssessmentScreenNavigationProps} from '@/features/navigation/types.tsx';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView, StyleSheet} from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '@/app/database';
import { Q } from '@nozbe/watermelondb';
import { Pet } from '@/app/database/models/Pet';
import { map } from 'rxjs/operators';

// The presentational component
const AddAssessmentComponent: React.FC<AddAssessmentScreenNavigationProps & { 
  activePet: Pet | undefined
}> = ({
  route,
  navigation,
  activePet
}) => {
  const [date] = useState(new Date(route.params.timestamp));
  const theme = useTheme();

  if (!activePet) {
    navigation.goBack();
    return null;
  }

  const handleSubmit = async (
    hurt: number,
    hunger: number,
    hydration: number,
    hygiene: number,
    happiness: number,
    mobility: number,
    customValue?: number,
    notes?: string,
    images?: string[],
  ) => {
    await database.write(async () => {
      await database.get('assessments').create(record => {
        record.date = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        record.hurt = hurt;
        record.hunger = hunger;
        record.hydration = hydration;
        record.hygiene = hygiene;
        record.happiness = happiness;
        record.mobility = mobility;
        if (customValue !== undefined) record.customValue = customValue;
        if (notes) record.notes = notes;
        record.images = images || [];
        record.score = Math.round((hurt + hunger + hydration + hygiene + happiness + mobility) / 6 * 10) / 10;
        record.pet.set(activePet);
      });
    });
    navigation.goBack();
  };

  // Get custom tracking settings from the pet
  const customTrackingSettings = activePet.customTrackingSettings ? 
    (typeof activePet.customTrackingSettings === 'string' ? 
      JSON.parse(activePet.customTrackingSettings) : 
      activePet.customTrackingSettings) : 
    {};

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
        <AssessmentItem
          date={date}
          petName={activePet.name}
          petSpecies={activePet.species}
          customTracking={customTrackingSettings}
          onCancel={() => navigation.goBack()}
          onSubmit={handleSubmit}
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
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
});

// Connect the component with WatermelonDB observables
const enhance = withObservables([], () => ({
  activePet: database
    .get<Pet>('pets')
    .query(Q.where('is_active', true))
    .observe()
    .pipe(map(pets => pets.length > 0 ? pets[0] : undefined))
}));

// Export the enhanced component
export default enhance(AddAssessmentComponent);
