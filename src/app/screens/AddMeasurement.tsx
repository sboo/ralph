import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/app/store/storageKeys.ts';
import MeasurementItem from '@/features/measurements/components/MeasurementItem.tsx';
import {useRealm} from '@realm/react';
import {useTheme} from 'react-native-paper';
import {Measurement} from '@/app/models/Measurement';
import {AddMeasurementScreenNavigationProps} from '@/features/navigation/types.tsx';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import {SafeAreaView, StyleSheet} from 'react-native';

const AddMeasurement: React.FC<AddMeasurementScreenNavigationProps> = ({
  route,
  navigation,
}) => {
  const [date] = useState(new Date(route.params.timestamp));
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
      });
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
        <MeasurementItem
          date={date}
          petName={petName}
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

export default AddMeasurement;
