import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../support/storageKeys';
import MeasurementItem from '../../components/MeasurementItem';
import {useRealm} from '@realm/react';
import {Measurement} from '../../models/Measurement';
import {AddMeasurementScreenNavigationProps} from '../navigation/types';

const AddMeasurement: React.FC<AddMeasurementScreenNavigationProps> = ({
  route,
  navigation,
}) => {
  const [date] = useState(new Date(route.params.timestamp));
  const [petName, setPetName] = useState('');

  const realm = useRealm();

  const handleSubmit = (
    hurt: number,
    hunger: number,
    hydration: number,
    hygiene: number,
    happiness: number,
    mobility: number,
  ) => {
    realm.write(() => {
      realm.create(Measurement, {
        date: date.toISOString().split('T')[0],
        score: hurt + hunger + hydration + hygiene + happiness + mobility,
        hurt,
        hunger,
        hydration,
        hygiene,
        happiness,
        mobility,
      });
    });
    navigation.goBack();
  };

  useEffect(() => {
    const fetchDogName = async () => {
      const name = await AsyncStorage.getItem(STORAGE_KEYS.PET_NAME);
      if (name !== null) {
        setPetName(name);
      }
    };

    fetchDogName();
  }, []);

  return (
    <MeasurementItem
      date={date}
      petName={petName}
      onCancel={() => navigation.goBack()}
      onSubmit={handleSubmit}
    />
  );
};

export default AddMeasurement;
