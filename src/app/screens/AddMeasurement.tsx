import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../support/storageKeys';
import MeasurementItem from '../../components/MeasurementItem';
import {useRealm} from '@realm/react';
import {useTheme} from 'react-native-paper';
import {Measurement} from '../../models/Measurement';
import {AddMeasurementScreenNavigationProps} from '../navigation/types';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';

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
    const fetchDogName = async () => {
      const name = await AsyncStorage.getItem(STORAGE_KEYS.PET_NAME);
      if (name !== null) {
        setPetName(name);
      }
    };

    fetchDogName();
  }, []);

  return (
    <LinearGradient
      colors={[theme.colors.primaryContainer, theme.colors.background]}>
      <MeasurementItem
        date={date}
        petName={petName}
        onCancel={() => navigation.goBack()}
        onSubmit={handleSubmit}
      />
    </LinearGradient>
  );
};

export default AddMeasurement;
