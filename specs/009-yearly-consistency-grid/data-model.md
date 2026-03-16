# Data Model: Yearly Consistency Grid

## Entities

### `YearlyConsistencyData`
Not a persisted database model, but an ephemeral aggregator stored in state to optimize component rendering.

- **AvailableYears**: `number[]`
  - Array of years (e.g., `[2024, 2025, 2026]`) representing all years the user has logged a workout.
- **YearlyHistory**: `Record<string, number>`
  - Mapping of `YYYY-MM-DD` string to the number of workouts performed that day (e.g., `{"2026-03-14": 1}`).
  - Used to instantly determine if a box is highlighted (`count > 0`).

## Integrations

- **`workoutStore` getState**: 
  - Derive `AvailableYears` by mapping over all loaded `WorkoutSession`s and extracting `new Date(session.created_at).getFullYear()`.
  - Dedup the array to feed into the year-selector tabs.
- **Rendering Context**:
  - Provide a utility function `generateCalendarMatrix(year: number)` that maps `YYYY-MM-DD` strings into a 2D array of weeks and days (where empty leading cells represent blank prepended days of the first week of the year).
