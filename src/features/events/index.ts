import { EventEmitter } from 'eventemitter3';
import { EVENT_NAMES } from './constants/eventNames';
const event = new EventEmitter();

export { event, EVENT_NAMES };
