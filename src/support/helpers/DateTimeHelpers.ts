
import { AssessmentFrequency } from '@/app/database/models/Pet';
import moment from 'moment';

export const getValidReminderTimestamp = (
  reminderTime: Date, 
  assessmentFrequency: AssessmentFrequency
): number => {
  const isWeekly = assessmentFrequency === 'WEEKLY';
  const now = moment();
  const reminderMoment = moment(reminderTime).seconds(0); // Normalize seconds to 0

  if (isWeekly) {
    // For weekly reminders
    const isReminderInPast = reminderMoment.isBefore(now);
    const isTodayMonday = now.day() === 1;

    if (isReminderInPast || !isTodayMonday) {
      // Calculate days until next Monday
      const daysUntilNextMonday = (8 - now.day()) % 7 || 7;
      return reminderMoment
        .add(daysUntilNextMonday, 'days') // Adjust to next Monday
        .hours(reminderTime.getHours())
        .minutes(reminderTime.getMinutes())
        .valueOf();
    }
    return reminderMoment.valueOf();
  } else {
    // For non-weekly reminders
    if (reminderMoment.isBefore(now)) {
      // Move to the next day if the time has passed
      return reminderMoment
        .add(1, 'days')
        .hours(reminderTime.getHours())
        .minutes(reminderTime.getMinutes())
        .valueOf();
    }
    return reminderMoment.valueOf();
  }
};

export const timeToDateObject = (timeString: string) => {
  // Use the current date but set the time according to the input string
  const timeParts = timeString.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);

  // Create a moment object for the current date and set the hours and minutes
  const dateWithTime = moment()
    .hours(hours)
    .minutes(minutes)
    .seconds(0)
    .milliseconds(0);

  // Return as a JavaScript Date object
  return dateWithTime.toDate();
};

// Convert a Date object to a "HH:mm" string
export const dateObjectToTimeString = (date: Date) => {
  // Create a moment object from the date
  const momentDate = moment(date);

  // Format the moment object to a "HH:mm" string
  return momentDate.format('HH:mm');
};
