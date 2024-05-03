import Realm from 'realm';
import {Measurement} from '@/app/models/Measurement';
import {Pet} from '@/app/models/Pet';
import {PET_REQUIRES_MIGRATION} from '../store/helper';

export const schemas = [Measurement, Pet];

export const onMigration = (oldRealm: Realm, newRealm: Realm) => {
  console.log('Migrating from version ' + oldRealm.schemaVersion);
  console.log('Migrating to version ' + newRealm.schemaVersion);
  if (oldRealm.schemaVersion < 1) {
    const name = PET_REQUIRES_MIGRATION;
    const species = 'other';
    const notificationsEnabled = false;

    const pet = newRealm.create(Pet, {
      name,
      species,
      notificationsEnabled,
    });

    console.log('Created pet:', pet);

    console.log('Migrating measurements');

    const newObjects: Realm.Results<Measurement> =
      newRealm.objects(Measurement);
    // loop through all objects and set the fullName property in the
    // new schema
    for (const objectIndex in newObjects) {
      // const oldObject = oldObjects[objectIndex];
      const newObject = newObjects[objectIndex];
      console.log(newObject.createdAt);
      console.log(newObject.score);
      newObject.pet = pet;
    }
  }
};
