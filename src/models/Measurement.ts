import Realm, {BSON} from 'realm';

export class Measurement extends Realm.Object {
  _id: BSON.ObjectId = new BSON.ObjectId();
  score!: number;
  hurt!: number;
  hunger!: number;
  hydration!: number;
  hygiene!: number;
  happiness!: number;
  mobility!: number;
  createdAt: Date = new Date();

  static primaryKey = '_id';
}
