
import Realm, {BSON, index} from 'realm';

export type AssessmentFrequency = 'DAILY' | 'WEEKLY';

export class Pet extends Realm.Object {
  _id: BSON.ObjectId = new BSON.ObjectId();
  static primaryKey = '_id';
  species!: string;
  @index('full-text')
  name!: string;
  avatar?: string;
  notificationsEnabled: boolean = false;
  notificationsTime?: string;
  showNotificationDot: boolean = false;
  @index
  isActive: boolean = false;
  assessmentFrequency: string = 'DAILY';
  headerColor?: string;
  pausedAt?: Date;
  customTrackingSettings?: string = {};
}
