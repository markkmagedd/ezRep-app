# Research: Yearly Consistency Grid Layout

## Grid Rendering Performance
- **Decision**: Use a horizontal `ScrollView` containing 52/53 columns (weeks), each with up to 7 rows (days).
- **Rationale**: Rendering 365 simple `View` components in React Native is well within performance limits and does not require complex windowing like `FlatList`, as long as the cells are simple and view-only. `ScrollView` allows smooth horizontal panning over the year.
- **Alternatives considered**: `FlatList` with `numColumns={7}`. However, a horizontal `FlatList` is harder to structure correctly when we specifically want top-to-bottom columns of 7 days flowing left-to-right.

## Generating the Calendar Layout
- **Decision**: Pre-calculate a 2D array: `Week[] -> Day[]`. The first week might have `< 7` days depending on the start day of the year (e.g., if Jan 1st is a Wednesday).
- **Rationale**: Building the exact data structure before render ensures the JSX logic is trivially simple and clean.
- **Alternatives considered**: Raw CSS Grid equivalents but React Native lacks true CSS Grid support outside of custom Flexbox manipulation.

## Dynamic Year Discovery
- **Decision**: In `workoutStore`, aggregate the `createdAt` timestamps of all completed workouts to extract unique years.
- **Rationale**: Avoids unnecessary querying and simply reads the data we already fetch or can quickly aggregate into an array like `[2024, 2025, 2026]`.
- **Alternatives considered**: Hardcoding years backwards from today, but this violates the requirement to only show years with activity.
