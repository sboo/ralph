import {EventEmitter} from 'eventemitter3';
export const event = new EventEmitter();

export enum EVENT_NAMES {
  COFFEE_PURCHASED = 'coffeePurchased',
  SWITCHING_PET = 'switchingPet',
  FINISHED_SWITCHING_PET = 'finishedSwitchingPet',
  THEME_CHANGED =  'themeChanged',
  ASSESSMENT_FREQUENCY_CHANGED = 'assessmentFrequencyChanged',
  ASSESSMENT_PAUSED = 'assessmentPaused',
  REMINDERS_TOGGLED = 'remindersEnabled',
  REMINDER_TIME_CHANGED = 'reminderTimeChanged',
}
