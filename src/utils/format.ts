/**
 * Format a number with abbreviations for large values.
 * 1,234 → "1,234"
 * 1,234,567 → "1.23M"
 * 1,234,567,890 → "1.23B"
 */
export function formatNumber(n: number): string {
  if (n < 0) return '-' + formatNumber(-n);

  if (n < 1_000) {
    return n % 1 === 0 ? n.toLocaleString() : n.toFixed(1);
  }
  if (n < 1_000_000) {
    return n >= 10_000
      ? (n / 1_000).toFixed(1) + 'K'
      : n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  if (n < 1_000_000_000) {
    return (n / 1_000_000).toFixed(2) + 'M';
  }
  if (n < 1_000_000_000_000) {
    return (n / 1_000_000_000).toFixed(2) + 'B';
  }
  return (n / 1_000_000_000_000).toFixed(2) + 'T';
}

/**
 * Format seconds into a human-readable time string.
 * 65 → "1m 5s"
 * 3661 → "1h 1m 1s"
 */
export function formatTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0s';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(' ');
}

/**
 * Format a countdown from now until a target timestamp.
 * Returns "HH:MM:SS" format for clock-like display.
 * Returns "OVERTIME +HH:MM:SS" if past the target.
 */
export function formatCountdown(targetTimestamp: number): string {
  const now = Date.now();
  const diff = targetTimestamp - now;
  const absDiff = Math.abs(diff);

  const hours = Math.floor(absDiff / 3_600_000);
  const minutes = Math.floor((absDiff % 3_600_000) / 60_000);
  const seconds = Math.floor((absDiff % 60_000) / 1_000);

  const timeStr = [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');

  return diff < 0 ? `OVERTIME +${timeStr}` : timeStr;
}
