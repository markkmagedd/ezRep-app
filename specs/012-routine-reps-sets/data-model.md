# Phase 1: Data Model Updates

No drastic schema changes are required. This feature simply restricts inputs and properly populates existing fields.

- Entity `RoutineDayExercise` in `src/types/index.ts`:
  - `target_sets`: will remain `number`, but UI enforces it > 0.
  - `target_reps`: will remain `number`, but UI enforces it > 0.
  - `target_weight_kg`: will be explicitly set to `null` or ignored since it's an optional parameter (`number | null`) not needed for routing context.

## Store Modifications
- `routineStore`: The method (`addExerciseToDay` or similar) should take `targetSets: number` and `targetReps: number` as arguments when pushing the exercise instance onto the current day.
