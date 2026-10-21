import { Session, SessionFilter } from "../fake/session.model";

export interface SessionFilterFormValue {
  chargerName?: string | null;
  chargerLocation?: string | null;
  status?: Session["status"] | "" | null;
  startedFrom?: Date | null;
  startedTo?: Date | null;
  minDuration?: number | null;
  maxDuration?: number | null;
  minEnergy?: number | null;
  minCost?: number | null;
  user?: string | null;
  id?: string | null;
}

//  Returns a new Date object representing the inclusive start of day (00:00:00.000).

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Returns a new Date object representing the inclusive end of day (23:59:59.999).

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

//  Pure function mapping UI filter form controls to backend SessionFilter[] specifications.

export function mapFormValueToSessionFilters(
  form: SessionFilterFormValue,
): SessionFilter[] {
  const filters: SessionFilter[] = [];

  // 1. Charger dropdown (exact match, 'All chargers' / empty means no filter)
  if (
    form.chargerName &&
    form.chargerName.trim() &&
    form.chargerName !== "All chargers"
  ) {
    filters.push({
      field: "chargerName",
      operator: "eq",
      value: form.chargerName.trim(),
    });
  }

  // 2. Location (contains, case-insensitive)
  if (form.chargerLocation && form.chargerLocation.trim()) {
    filters.push({
      field: "chargerLocation",
      operator: "contains",
      value: form.chargerLocation.trim(),
    });
  }

  // 3. Status dropdown ('All statuses' / empty means no filter)
  if (form.status && form.status !== ("All statuses" as unknown)) {
    filters.push({
      field: "status",
      operator: "eq",
      value: form.status,
    });
  }

  // 4. Started Date Range (inclusive start of day for 'From', inclusive end of day for 'To')
  if (form.startedFrom instanceof Date && !isNaN(form.startedFrom.getTime())) {
    filters.push({
      field: "startedAt",
      operator: "gte",
      value: startOfDay(form.startedFrom),
    });
  }
  if (form.startedTo instanceof Date && !isNaN(form.startedTo.getTime())) {
    filters.push({
      field: "startedAt",
      operator: "lte",
      value: endOfDay(form.startedTo),
    });
  }

  // 5. Duration Min/Max range in minutes
  if (form.minDuration != null && !isNaN(form.minDuration)) {
    filters.push({
      field: "durationMinutes",
      operator: "gte",
      value: form.minDuration,
    });
  }
  if (form.maxDuration != null && !isNaN(form.maxDuration)) {
    filters.push({
      field: "durationMinutes",
      operator: "lte",
      value: form.maxDuration,
    });
  }

  // 6. Energy minimum threshold (>=)
  if (form.minEnergy != null && !isNaN(form.minEnergy)) {
    filters.push({
      field: "energyKwh",
      operator: "gte",
      value: form.minEnergy,
    });
  }

  // 7. Cost minimum threshold (>=)
  if (form.minCost != null && !isNaN(form.minCost)) {
    filters.push({
      field: "costEur",
      operator: "gte",
      value: form.minCost,
    });
  }

  // 8. User (contains, case-insensitive)
  if (form.user && form.user.trim()) {
    filters.push({
      field: "user",
      operator: "contains",
      value: form.user.trim(),
    });
  }

  // 9. Session ID (contains, case-insensitive)
  if (form.id && form.id.trim()) {
    filters.push({
      field: "id",
      operator: "contains",
      value: form.id.trim(),
    });
  }

  return filters;
}

// Checks whether any filter control is currently active.

export function hasActiveFilters(form: SessionFilterFormValue): boolean {
  return mapFormValueToSessionFilters(form).length > 0;
}
