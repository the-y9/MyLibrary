export const durationStrToSeconds = (dateValue) => {
    if (!dateValue) return 0;
  
    if (typeof dateValue === "string") {
      // If it's a string like "Date(2025,11,19,12,30,0)"
      const match = dateValue.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
      if (match) {
        const [, , , , hours, minutes, seconds] = match.map(Number);
        return hours * 3600 + minutes * 60 + seconds;
      }
      return 0;
    } else if (dateValue instanceof Date) {
      // If it's already a Date object
      return dateValue.getHours() * 3600 + dateValue.getMinutes() * 60 + dateValue.getSeconds();
    } else if (typeof dateValue === "number") {
      // If it's a timestamp in milliseconds
      const date = new Date(dateValue);
      return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    } else {
      return 0;
    }
  };

  export const formatMinutes = (minutes) => {
    if (!minutes) return "0 min";
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
};
  
export const formatSeconds = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const mm = minutes.toString().padStart(2, "0");
    const ss = seconds.toString().padStart(2, "0");
    return `${hours}:${mm}:${ss}`;
};
  
export const minToHr = (totalMin) => {
  const hours = Math.floor(totalMin / 60);
  const minutes = Math.floor(totalMin % 60 );
  const mm = minutes.toString().padStart(2, "0");
  return `${hours}:${mm}`;
};

  export const formatDuration = (dateStr) => {
    const totalSeconds = durationStrToSeconds(dateStr);
    return formatSeconds(totalSeconds);
};
  
export const formatMin = (m) => {
  const totalMinutes = Math.round(Number(m)); // kill float noise

  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} h ${minutes} min`;
  }

  return `${totalMinutes} min`;
};

export function to24HourFormat(hour, minute, ampm) {
  const hourNum = Number(hour);
  let hour24;

  if (ampm.toUpperCase() === "AM") {
    hour24 = hourNum === 12 ? 0 : hourNum; // 12 AM → 0
  } else {
    hour24 = hourNum === 12 ? 12 : hourNum + 12; // 12 PM → 12, 1-11 PM → +12
  }

  const hourStr = hour24.toString().padStart(2, "0");
  const minuteStr = minute.toString().padStart(2, "0");

  return `${hourStr}:${minuteStr}`;
}
