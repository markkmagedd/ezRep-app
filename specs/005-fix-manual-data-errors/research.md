# Research: Fix Manual Data Errors

## Decision: Add `applyFilters` to `ExerciseState` interface
**Rationale**: The TypeScript compiler flagged `applyFilters` as missing from `ExerciseState` in `src/store/exercise-store.ts`. It was implemented in the store object but omitted from the interface definition, causing `get().applyFilters()` to fail type checking.

## Decision: Refactor Legacy UI Components to use new `exerciseStore`
**Rationale**: `ExerciseList.tsx`, `MuscleGroupFilter.tsx`, and `ExerciseSearchBar.tsx` were built for the `003-workout-api-integration` and relied on the deleted `use-exercises` hook and the old store properties (`selectedMuscle`, `setMuscle`). 
We will refactor these components to consume `filteredExercises`, `selectedBodyPart`, and `setBodyPart` from the new local `useExerciseStore`. This avoids a major rewrite of `CreateRoutineScreen` while restoring full functionality.

## Alternatives Considered:
- **Replacing inline components with `ExerciseSelectorScreen` navigation**: Rejected because it would require changing the user flow for creating routines (which currently has inline search). Refactoring the components to use the new local store is less intrusive and preserves the UX.
