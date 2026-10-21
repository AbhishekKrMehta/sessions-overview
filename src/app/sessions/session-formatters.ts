// Pure formatting helper functions for charging sessions.

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Formats duration in minutes into a human-readable string like '6h 49m' or '15m'.

export function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null || isNaN(minutes) || minutes < 0) {
    return "—";
  }
  const totalMinutes = Math.round(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

// Formats energy in kilowatt-hours, e.g. '80.5 kWh'.

export function formatEnergy(kwh: number | null | undefined): string {
  if (kwh == null || isNaN(kwh)) {
    return "—";
  }
  return `${kwh.toFixed(1)} kWh`;
}

// Formats cost in Euros, e.g. '€ 14.07'.

export function formatCost(cost: number | null | undefined): string {
  if (cost == null || isNaN(cost)) {
    return "—";
  }
  return `€ ${cost.toFixed(2)}`;
}

// Formats session start timestamp as '01 Feb 2026 20:23'.

export function formatStartedDate(
  date: Date | string | null | undefined,
): string {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";

  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

// Extracts single initial for the user avatar (e.g. 'Anna Kuipers' -> 'A').

export function getUserInitial(name: string | null | undefined): string {
  if (!name) return "?";
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : "?";
}

// Truncates UUID for table presentation, e.g. '849d73eb...'.

export function truncateSessionId(
  id: string | null | undefined,
  length = 8,
): string {
  if (!id) return "";
  return id.length > length ? `${id.slice(0, length)}...` : id;
}
