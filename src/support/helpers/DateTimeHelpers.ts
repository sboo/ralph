import moment from 'moment';

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
