# Quickstart: Fix Manual Data Errors

## Overview
This feature resolves compilation and runtime errors stemming from the transition to the local manual workout data library.

## Setup Steps
1. Apply the interface fix in `src/store/exercise-store.ts`.
2. Refactor `ExerciseList.tsx` to remove the API hook and use the store's `filteredExercises`.
3. Refactor `MuscleGroupFilter.tsx` to align with the new store property names.
4. Refactor `ExerciseSearchBar.tsx` (if applicable) to ensure it uses `searchQuery` and `setSearchQuery`.

## Validation Commands
- Run `npm run tsc -- --noEmit` and ensure it returns 0 errors.
- Launch the application and test the `CreateRoutineScreen` to ensure the exercise list renders and filters correctly without crashing.
