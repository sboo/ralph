import Realm from 'realm';
import {Measurement} from '../models/Measurement';

export const todaysMeasurementDone = async (): Promise<boolean> => {
  const today = new Date().toISOString().split('T')[0];
  const realm = await Realm.open({
    schema: [Measurement],
  });
  const measurements = realm
    .objects<Measurement>('Measurement')
    .filtered('date = $0', today);

  return measurements.length > 0;
};
