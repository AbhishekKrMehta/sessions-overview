# Decisions & Trade-offs

## Approach

Built a single-page session overview dashboard with Angular 20 and Kendo UI Grid matching `Assesment Design.png`. The architecture focuses on **proportionate simplicity**: a feature component managing the grid query pipeline, clean presentational subcomponents, and pure helper functions for formatting and filter mapping. Every filter, sort, and page action queries `FakeSessionService` on the server side.

## Key Decisions

- **Feature Component + Subcomponents & Pure Helpers** — Kept state management lean without external state libraries (e.g. NgRx). Presentational concerns are split into dedicated subcomponents (`SessionsHeaderComponent`, `SessionsErrorComponent`) using modern Signal `input` and `output`. Complex filter translation and formatting are isolated in pure, testable helper functions (`session-filters.ts`, `session-formatters.ts`).
- **Pragmatic RxJS & Signals Balance** — Used RxJS where it shines: debouncing filter keystrokes (300ms) and cancelling obsolete in-flight requests (`switchMap`). Used Angular Signals (`gridData`, `loading`, `errorMessage`, `isFiltered`) for synchronous UI state and reactive template binding with `OnPush` change detection. Avoided `@experimental` APIs (like `rxResource`) to keep the codebase stable and production-ready.
- **Resilient Error Handling** — Handled the simulated 5% backend error inside `switchMap` so failures never terminate the stream. The UI presents a non-intrusive alert with a **Retry** button that re-runs the request without resetting user inputs.
- **Inclusive Date Range Boundaries** — Timestamps contain exact times. To ensure full-day matches, start dates are set to `00:00:00.000` (`gte`) and end dates to `23:59:59.999` (`lte`).
- **Minimum Threshold for Energy & Cost** — Exact matching on floating-point numbers is impractical. Numeric inputs are treated as minimum thresholds (`gte`) with clear placeholder cues (`≥ kWh`, `≥ €`).
- **Usability Enhancements** — Added dynamic range boundaries (preventing "Started To" < "Started From" and "Max Duration" < "Min Duration"), a one-click **"Reset all filters"** button when filters are active, click-to-copy for truncated Session IDs, and a non-blocking top progress bar so typing is never interrupted by loading overlays.

## Trade-offs & Future Improvements

- **URL Query Sync** — State is currently kept in component memory. In production, syncing filters and pagination to URL query parameters would allow support agents to share and bookmark filtered views.
- **Advanced Numeric Operators** — Kept single minimum threshold inputs to match the visual design. Could be extended with operator toggles (`=`, `>`, `<`).
- **Bundle Budget** — Increased the initial bundle budget in `angular.json` to accommodate Kendo UI Grid and default theme styles.

## AI Usage

- **Tools**: GitHub Copilot & Gemini.
- **Role of AI**: Acted as a sounding board and pair programmer to bounce ideas off, review architectural trade-offs (e.g. evaluating `rxResource` vs. stable RxJS/Signal boundaries), review edge cases, and verify bundle configuration.
- **Human Ownership**: All feature design, architectural choices, domain logic (inclusive date boundaries, minimum threshold filters, dynamic range constraints), and code structure were driven and decided directly by me.
