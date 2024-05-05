import {EventEmitter} from 'eventemitter3';
export const event = new EventEmitter();

export enum EVENT_NAMES {
  COFFEE_PURCHASED = 'coffeePurchased',
  SWITCHING_PET = 'switchingPet',
  FINISHED_SWITCHING_PET = 'finishedSwitchingPet',
}
