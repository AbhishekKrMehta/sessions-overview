# Decisions & Trade-offs

## Approach

Built a single-page session overview dashboard with Angular 20 and Kendo UI Grid matching `Assesment Design.png`. The guiding principle was **proportionate simplicity**: rather than introducing complex state management layers or custom stores for a single view, we used a single smart standalone component (`SessionsOverviewComponent`) paired with pure helper functions (`session-formatters.ts` and `session-filters.ts`). Every user action (filtering, sorting, paging, retrying) round-trips to `FakeSessionService` with server-side queries.

## Key Decisions

- **Smart Standalone Component + Pure Helpers over External State Stores** — Rejected NGRX or complex multi-service abstractions. Kept the reactive pipeline directly in `SessionsOverviewComponent` using RxJS and Angular Signals with `ChangeDetectionStrategy.OnPush`. Pure utility functions remain completely decoupled, easy to read, and testable.
- **Reactive Stream with `switchMap` & Debouncing** — Used `switchMap` to cancel pending in-flight requests when filters, sort, or pagination change rapidly, preventing race conditions. Text filters are debounced by 300ms via Reactive Forms; paging and sorting trigger immediately. Any filter change automatically resets pagination to page 1 (`skip = 0`).
- **Resilient Error Handling (5% Failure Rate)** — Caught errors *inside* `switchMap` (returning `of(null)`) rather than on the parent query stream. This guarantees that simulated backend errors never terminate the subscription. The UI displays an alert banner with a **Retry** button that re-executes the current query without clearing filters.
- **Inclusive Date Boundaries for Started Range** — Session timestamps contain exact hours and minutes. To ensure same-day searches (e.g. Feb 1 to Feb 1) or ranges capture all sessions on those calendar days, `startedFrom` is normalized to `00:00:00.000` (`gte`) and `startedTo` to `23:59:59.999` (`lte`) in local time.
- **Minimum-Threshold Semantics for Energy & Cost** — In the design screenshot, Energy and Cost have single input boxes. Because both fields contain floating-point numbers in the dataset, exact equality (`eq`) is practically unusable. Mapped both to greater-than-or-equal (`gte`) and added clear placeholder indicators (`≥ kWh`, `≥ €`).
- **Support Usability Improvements** — Added a one-click **"Reset all filters"** button visible when filters are active, and click-to-copy functionality for truncated Session IDs with visual feedback.

## Trade-offs & Things You'd Revisit

- **URL Query Parameter Synchronization** — Filter, sort, and pagination state are held in memory. In a production app, syncing query state to the URL (`?status=Active&page=2`) would enable support staff to bookmark and share specific views.
- **Operator Selection for Numeric Filters** — Kept single minimum-threshold inputs to match the visual design. In the future, a small operator toggle (`=`, `>`, `<`) could give users further precision.
- **Bundle Budget Adjustment** — Adjusted `maximumError` in `angular.json` to 5 MB to accommodate the baseline Kendo UI component bundle and theme without build failures.

## AI Usage

- **Tools used**: Google Antigravity paired with Gemini.
- **Where AI accelerated development**: Fast generation of Kendo Grid filter row templates, CSS alignment matching `Assesment Design.png` (status pill badges, avatar circles), and writing the filter verification script.
- **Human judgment & steering**:
  - The developer explicitly constrained the architecture to remain simple, proportionate, and easy to explain, avoiding unnecessary services.
  - Defined the domain logic for inclusive date-range boundaries and the `gte` operator choice for floating-point fields.
  - Resolved the Angular CLI bundle budget constraint in `angular.json`.
