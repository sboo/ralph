import Realm from 'realm';
import {Measurement} from '@/app/models/Measurement.ts';
import moment from 'moment';

export const todaysMeasurementDone = async (): Promise<boolean> => {
  const today = moment().format('YYYY-MM-DD');
  const realm = await Realm.open({
    schema: [Measurement],
  });
  const measurements = realm
    .objects<Measurement>('Measurement')
    .filtered('date = $0', today);

  return measurements.length > 0;
};
