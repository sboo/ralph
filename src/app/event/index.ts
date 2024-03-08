import {EventEmitter} from 'eventemitter3';
export const event = new EventEmitter();

export enum EVENT_NAMES {
  PROFILE_SET = 'profileSet',
  COFFEE_PURCHASED = 'coffeePurchased',
}
