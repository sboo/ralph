import Realm, {BSON, index} from 'realm';

export class Pet extends Realm.Object {
  _id: BSON.ObjectId = new BSON.ObjectId();
  static primaryKey = '_id';
  species!: string;
  @index('full-text')
  name!: string;
  avatar?: string;
  notificationsEnabled: boolean = false;
  notificationsTime?: string;
  @index
  isActive: boolean = false;
  headerColor?: string;
}
