import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/app/store/storageKeys.ts';
import AssessmentItem from '@/features/assessments/components/AssessmentItem';
import {useObject, useRealm} from '@realm/react';
import {useTheme} from 'react-native-paper';
import {Measurement} from '@/app/models/Measurement';
import {BSON} from 'realm';
import {EditAssessmentScreenNavigationProps} from '@/features/navigation/types.tsx';
import {SafeAreaView, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const EditAssessment: React.FC<EditAssessmentScreenNavigationProps> = ({
  route,
  navigation,
}) => {
  const _id = BSON.ObjectId.createFromHexString(route.params.assessmentId);
  const assessment = useObject(Measurement, _id);
  const [petName, setPetName] = useState('');

  const realm = useRealm();
  const theme = useTheme();

  const handleSubmit = (
    hurt: number,
    hunger: number,
    hydration: number,
    hygiene: number,
    happiness: number,
    mobility: number,
  ) => {
    realm.write(() => {
      if (assessment) {
        assessment.score =
          hurt + hunger + hydration + hygiene + happiness + mobility;
        assessment.hurt = hurt;
        assessment.hunger = hunger;
        assessment.hydration = hydration;
        assessment.hygiene = hygiene;
        assessment.happiness = happiness;
        assessment.mobility = mobility;
      }
    });
    navigation.goBack();
  };

  useEffect(() => {
    const fetchPetName = async () => {
      const name = await AsyncStorage.getItem(STORAGE_KEYS.PET_NAME);
      if (name !== null) {
        setPetName(name);
      }
    };

    fetchPetName();
  }, []);

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
          date={assessment!.createdAt}
          petName={petName}
          assessment={assessment}
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

export default EditAssessment;
