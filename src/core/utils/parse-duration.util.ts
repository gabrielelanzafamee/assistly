export const parseDuration = (duration: string): number | null => {
  const secondsMatch = duration.match(/(\d+)s/);
  const minutesMatch = duration.match(/(\d+)m/);

  const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

  return seconds * 1000 + minutes * 60000;
};