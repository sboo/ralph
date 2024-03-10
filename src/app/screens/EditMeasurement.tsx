import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../support/storageKeys';
import MeasurementItem from '../../components/MeasurementItem';
import {useRealm, useObject} from '@realm/react';
import {useTheme} from 'react-native-paper';
import {Measurement} from '../../models/Measurement';
import {BSON} from 'realm';
import {EditMeasurementScreenNavigationProps} from '../navigation/types';
import {SafeAreaView, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const EditMeasurement: React.FC<EditMeasurementScreenNavigationProps> = ({
  route,
  navigation,
}) => {
  const _id = BSON.ObjectId.createFromHexString(route.params.measurementId);
  const measurement = useObject(Measurement, _id);
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
      if (measurement) {
        measurement.score =
          hurt + hunger + hydration + hygiene + happiness + mobility;
        measurement.hurt = hurt;
        measurement.hunger = hunger;
        measurement.hydration = hydration;
        measurement.hygiene = hygiene;
        measurement.happiness = happiness;
        measurement.mobility = mobility;
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
        <MeasurementItem
          date={measurement!.createdAt}
          petName={petName}
          measurement={measurement}
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

export default EditMeasurement;
