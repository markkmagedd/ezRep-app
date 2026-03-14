# Data Model: Fix Manual Data Errors

This feature does not introduce new entities. It enforces the `ExerciseRecord` interface created in `004-manual-workout-data` across legacy components.

## Updated Usage

### `ExerciseList` Component
- Now consumes `filteredExercises: ExerciseRecord[]` directly from `useExerciseStore` instead of relying on the async API hook.

### `MuscleGroupFilter` Component
- Now uses `selectedBodyPart: string | null` and `setBodyPart: (bodyPart: string | null) => void` from `useExerciseStore`.

### `ExerciseState` Interface
- `applyFilters: () => void` MUST be explicitly declared in `src/store/exercise-store.ts` to satisfy TypeScript.
