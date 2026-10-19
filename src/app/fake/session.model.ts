export interface Session {
  id: string;
  chargerName: string;
  chargerLocation: string;
  status: 'Active' | 'Completed' | 'Failed' | 'Cancelled';
  startedAt: Date;
  durationMinutes: number;
  energyKwh: number;
  costEur: number;
  user: string;
}

export type SessionSortDirection = 'asc' | 'desc';

export interface SessionSort {
  field: keyof Session;
  direction: SessionSortDirection;
}

export type SessionFilterOperator =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'startswith'
  | 'endswith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte';

export interface SessionFilter {
  field: keyof Session;
  operator: SessionFilterOperator;
  value: string | number | Date | boolean | null;
}

export interface SessionQuery {
  skip?: number;
  take?: number;
  sort?: SessionSort[];
  filters?: SessionFilter[];
}

export interface SessionPage {
  data: Session[];
  total: number;
}
