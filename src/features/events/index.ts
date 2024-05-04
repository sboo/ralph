import {EventEmitter} from 'eventemitter3';
export const event = new EventEmitter();

export enum EVENT_NAMES {
  COFFEE_PURCHASED = 'coffeePurchased',
}
