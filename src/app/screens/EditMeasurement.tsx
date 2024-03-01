import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../support/storageKeys';
import {NavigationProp, ParamListBase, Route} from '@react-navigation/native';
import MeasurementItem from '../../components/MeasurementItem';
import {useRealm, useObject} from '@realm/react';
import {Measurement} from '../../models/Measurement';
import {BSON} from 'realm';

interface Props {
  route: Route<string, {measurementId: string}>;
  navigation: NavigationProp<ParamListBase>;
}

const EditMeasurement: React.FC<Props> = ({route, navigation}) => {
  const _id = BSON.ObjectId.createFromHexString(route.params.measurementId);
  const measurement = useObject(Measurement, _id);
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
      if (measurement) {
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
      date={measurement!.createdAt}
      petName={petName}
      measurement={measurement}
      handleSubmit={handleSubmit}
    />
  );
};

export default EditMeasurement;
