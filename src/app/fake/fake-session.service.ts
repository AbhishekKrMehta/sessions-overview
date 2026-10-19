import { Injectable } from '@angular/core';
import { Observable, of, switchMap, throwError, timer } from 'rxjs';
import { MOCK_SESSIONS } from './mock-sessions.data';
import {
  Session,
  SessionFilter,
  SessionPage,
  SessionQuery,
  SessionSort,
} from './session.model';

@Injectable({ providedIn: 'root' })
export class FakeSessionService {
  getSessions(query: SessionQuery = {}): Observable<SessionPage> {
    const delayMs = 400 + Math.random() * 500;
    const shouldFail = Math.random() < 0.05;
    return timer(delayMs).pipe(
      switchMap(() => {
        if (shouldFail) {
          return throwError(() => new Error('Failed to load sessions'));
        }
        const filtered = applyFilters(MOCK_SESSIONS, query.filters ?? []);
        const sorted = applySort(filtered, query.sort ?? []);
        const skip = query.skip ?? 0;
        const take = query.take ?? sorted.length;
        return of<SessionPage>({
          data: sorted.slice(skip, skip + take),
          total: sorted.length,
        });
      }),
    );
  }

  getChargers(): Observable<string[]> {
    const delayMs = 200 + Math.random() * 300;
    const chargers = Array.from(
      new Set(MOCK_SESSIONS.map((s) => s.chargerName)),
    ).sort();
    return timer(delayMs).pipe(switchMap(() => of(chargers)));
  }
}

function applyFilters(sessions: Session[], filters: SessionFilter[]): Session[] {
  if (filters.length === 0) return sessions;
  return sessions.filter((session) =>
    filters.every((filter) => matches(session, filter)),
  );
}

function matches(session: Session, filter: SessionFilter): boolean {
  const raw = session[filter.field];
  const { operator, value } = filter;

  if (raw instanceof Date || value instanceof Date) {
    const left = raw instanceof Date ? raw.getTime() : Number(raw);
    const right = value instanceof Date ? value.getTime() : Number(value);
    return compareNumeric(left, right, operator);
  }

  if (typeof raw === 'number' || typeof value === 'number') {
    return compareNumeric(Number(raw), Number(value), operator);
  }

  const left = String(raw ?? '').toLowerCase();
  const right = String(value ?? '').toLowerCase();
  switch (operator) {
    case 'eq':
      return left === right;
    case 'neq':
      return left !== right;
    case 'contains':
      return left.includes(right);
    case 'startswith':
      return left.startsWith(right);
    case 'endswith':
      return left.endsWith(right);
    default:
      return false;
  }
}

function compareNumeric(
  left: number,
  right: number,
  operator: SessionFilter['operator'],
): boolean {
  switch (operator) {
    case 'eq':
      return left === right;
    case 'neq':
      return left !== right;
    case 'gt':
      return left > right;
    case 'gte':
      return left >= right;
    case 'lt':
      return left < right;
    case 'lte':
      return left <= right;
    default:
      return false;
  }
}

function applySort(sessions: Session[], sort: SessionSort[]): Session[] {
  if (sort.length === 0) return sessions;
  const copy = [...sessions];
  copy.sort((a, b) => {
    for (const { field, direction } of sort) {
      const av = a[field];
      const bv = b[field];
      const cmp = compareValues(av, bv);
      if (cmp !== 0) return direction === 'asc' ? cmp : -cmp;
    }
    return 0;
  });
  return copy;
}

function compareValues(a: unknown, b: unknown): number {
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a ?? '').localeCompare(String(b ?? ''));
}
