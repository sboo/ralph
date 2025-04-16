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
  customValue?: number;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  petId: BSON.ObjectId = new BSON.ObjectId();
  notes?: string;
  images: Realm.List<string> = new Realm.List<string>();

  static primaryKey = '_id';
}
