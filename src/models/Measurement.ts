import Realm, {BSON, index} from 'realm';

export class Measurement extends Realm.Object {
  _id: BSON.ObjectId = new BSON.ObjectId();
  @index
  date!: string;
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
