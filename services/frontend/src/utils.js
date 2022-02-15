export function addTime(date, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) {
  const millisPerSecond = 1000;
  const millisPerMinute = 60 * millisPerSecond;
  const millisPerHour = 60 * millisPerMinute;

  let timeDeltaMillis = hours * millisPerHour
    + minutes * millisPerMinute
    + seconds * millisPerSecond
    + milliseconds;

  return new Date(date.getTime() + timeDeltaMillis);
}

export function readableDate(dt) {
  const locales = [];
  const formatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
    timeZone: "UTC",
  };

  return dt.toLocaleString(locales, formatOptions);
}

