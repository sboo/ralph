import React, {useState} from 'react';
import AssessmentItem from '@/features/assessments/components/AssessmentItem';
import {useRealm} from '@realm/react';
import {useTheme} from 'react-native-paper';
import {Measurement} from '@/app/models/Measurement';
import {AddAssessmentScreenNavigationProps} from '@/features/navigation/types.tsx';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import {SafeAreaView, StyleSheet} from 'react-native';
import usePet from '@/features/pets/hooks/usePet';

const AddAssessment: React.FC<AddAssessmentScreenNavigationProps> = ({
  route,
  navigation,
}) => {
  const [date] = useState(new Date(route.params.timestamp));

  const realm = useRealm();
  const theme = useTheme();
  const {activePet} = usePet();

  const handleSubmit = (
    hurt: number,
    hunger: number,
    hydration: number,
    hygiene: number,
    happiness: number,
    mobility: number,
  ) => {
    realm.write(() => {
      const dateString = moment(date).format('YYYY-MM-DD');
      realm.create(Measurement, {
        date: dateString,
        score: hurt + hunger + hydration + hygiene + happiness + mobility,
        hurt,
        hunger,
        hydration,
        hygiene,
        happiness,
        mobility,
        createdAt: date,
        pet: activePet,
      });
    });
    navigation.goBack();
  };

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
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
});

export default AddAssessment;
