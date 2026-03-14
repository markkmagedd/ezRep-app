# Implementation Plan: Fix Manual Data Errors

**Branch**: `005-fix-manual-data-errors` | **Date**: 2026-03-12 | **Spec**: [specs/005-fix-manual-data-errors/spec.md]
**Input**: Feature specification from `/specs/005-fix-manual-data-errors/spec.md`

## Summary

This feature resolves TypeScript compilation errors and potential runtime crashes introduced during the manual workout data migration. It focuses on updating the `ExerciseState` interface and refactoring legacy components (`ExerciseList.tsx`, `MuscleGroupFilter.tsx`, `ExerciseSearchBar.tsx`) to properly consume the new `exerciseStore`.

## Technical Context

**Language/Version**: TypeScript 5.x (Strict)  
**Primary Dependencies**: React Native 0.81, Expo SDK 54, Zustand 4.5  
**Storage**: Static JSON/TS constants (via `useExerciseStore`)  
**Testing**: `tsc --noEmit` and manual simulator testing  
**Target Platform**: iOS 15+, Android 11+  
**Project Type**: mobile-app  
**Performance Goals**: N/A (Bug Fixes)  
**Constraints**: Must restore full functionality to `CreateRoutineScreen` without altering the core user flow.  
**Scale/Scope**: Refactoring 3 legacy components and 1 store interface.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Strict TypeScript**: Resolving missing interface properties (`applyFilters`) and ensuring `ExerciseRecord` is used correctly aligns directly with the "Strict TypeScript Discipline" principle.
- **Atomic Components**: `ExerciseList` and `MuscleGroupFilter` act as composite UI elements on the `CreateRoutineScreen` and must maintain consistent styling (Dark Gym UI).

## Project Structure

### Documentation (this feature)

```text
specs/005-fix-manual-data-errors/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (next step)
```

### Source Code (repository root)

```text
src/
├── store/
│   └── exercise-store.ts        # Update interface
└── components/
    ├── ExerciseList.tsx         # Refactor to use store
    ├── MuscleGroupFilter.tsx    # Refactor to use new store props
    └── ExerciseSearchBar.tsx    # Refactor to use new store props
```

**Structure Decision**: Single project. Changes are strictly within existing files in `src/store/` and `src/components/`.
