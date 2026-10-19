# Frontend Hiring Case — Session Overview

Starter project for the Deftpower frontend take-home case.

## Getting started

```
npm install
npm start
```

The app is served at `http://localhost:4200`. You'll see a placeholder page — replace it with your implementation.

## Kendo trial banner

This project uses Kendo UI for Angular without a commercial license. A **"License activation"** warning banner will appear in the app and in the console. This is expected — you can ignore it for the purposes of this case. Do not spend time on licensing workarounds.

## The case

Build a session overview page that matches the provided screenshot (`Assesment Design.png`).

Support uses this list to quickly locate a specific session, every column must be filterable as shown in the screenshot. The charger column has a dropdown filter populated with the distinct chargers returned by the backend (use `FakeSessionService.getChargers()`).

## Requirements

- Use the provided `FakeSessionService` for the data
- Server-side filtering, sorting, and paging — the grid must round-trip through the service on every change. The mock simulates a backend.
- Use the screenshot as a visual reference — it doesn't need to be pixel-perfect (see "Improvements" below)
- Document your decisions and trade-offs in a separate `DECISIONS.md` file (max 1 A4): which approach you chose, which alternatives you rejected, and why

## Improvements

The screenshot is a starting point, not a finished spec. If you notice something in the design that could be better for the user, missing functionality, usability gaps, inconsistencies, feel free to improve on it. Call out any such changes in `DECISIONS.md` with a short rationale.

## Scope — what you do NOT have to do

- No unit tests or e2e tests
- No i18n / translations
- No authentication
- No real backend — use the provided service

## AI usage

AI tools (Claude, Copilot, Cursor, etc.) are allowed and encouraged. We explicitly want to see *how* you use them — which choices you make yourself and where you trust the AI. Reflect on this briefly in `DECISIONS.md`.

## Time & deadline

Expected time investment: 2 to 4 hours. Deadline: 1 week after receiving this brief.
