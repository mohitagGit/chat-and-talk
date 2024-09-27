export const formatTimeStamp = (timestamp) => {
  const today = new Date();
  const date = new Date(timestamp);

  const isToday = date.toDateString() === today.toDateString();

  const isWithinLastWeek = today - date < 7 * 24 * 60 * 60 * 1000 && !isToday;

  const optionsTime = { hour: "numeric", minute: "numeric", hour12: true };
  const optionsDate = { day: "numeric", month: "short", year: "2-digit" };
  const optionsDay = { weekday: "short" };

  if (isToday) {
    // Return time if it's today
    return date.toLocaleTimeString(undefined, optionsTime);
  } else if (isWithinLastWeek) {
    // Return day and time if it's within the last week
    return date.toLocaleDateString(undefined, {
      ...optionsDay,
      ...optionsTime,
    });
  } else {
    // Return full date and time if it's older than a week
    return date.toLocaleDateString(undefined, {
      ...optionsDate,
      ...optionsTime,
    });
  }
};
