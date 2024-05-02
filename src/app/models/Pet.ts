import Realm, {BSON} from 'realm';

export class Pet extends Realm.Object {
  _id: BSON.ObjectId = new BSON.ObjectId();
  static primaryKey = '_id';
  species!: string;
  name!: string;
  avatar?: string;
  notificationsEnabled: boolean = false;
  notificationsTime?: string;
  isActive: boolean = false;
}
