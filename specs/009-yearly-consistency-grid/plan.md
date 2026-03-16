# Implementation Plan: Yearly Consistency Grid

**Branch**: `009-yearly-consistency-grid` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-yearly-consistency-grid/spec.md`

## Summary

Implement an interactive Yearly Consistency Grid (a GitHub-style contribution graph) that allows users to view their workout history over a specific calendar year. Users will navigate to this view by tapping the existing 4-week grid on the Home screen. The view will feature horizontal scrolling and dynamic tabs to switch between years where workouts exist.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React Native, Expo (SDK 54), Zustand
**Storage**: Firebase Firestore
**Testing**: N/A
**Target Platform**: iOS / Android
**Project Type**: Mobile App
**Performance Goals**: Render 365 cells smoothly without frame drops.
**Constraints**: UI must comply with "Dark Gym" aesthetics (high contrast lime-on-black).
**Scale/Scope**: Supports multi-year history across all users.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Real-time Social Synchronization**: While not a real-time social feature, we will fetch historical data securely via Firestore.
- **II. High-Contrast "Dark Gym" UI**: The grid and tabs will strictly use `Colors.bg`, `Colors.bgSurface`, and `Colors.accent` for layout and highlights.
- **III. Rigid State Machines**: The year selection and historical data fetching will be managed robustly via Zustand `workoutStore` or `sessionStore`.
- **IV. Strict TypeScript Discipline**: `WorkoutHistory` and grid day shapes will be strictly typed in `src/types/index.ts`.
- **V. Atomic Component Architecture**: Will reuse existing `Card` and `Button` components for the year tabs and layout structure.

## Project Structure

### Documentation (this feature)

```text
specs/009-yearly-consistency-grid/
├── plan.md              # This file
├── research.md          # Implementation patterns and layout decisions
├── data-model.md        # Data aggregation logic for history
├── quickstart.md        # Quick developer overview
└── tasks.md             # Imeplementation steps
```

### Source Code (repository root)

```text
src/
├── components/
│   └── home/
│       └── YearlyConsistencyGrid.tsx  # The new full-year grid component
│       └── YearSelector.tsx           # The year tab selector
├── screens/
│   └── home/
│       └── YearlyConsistencyScreen.tsx # New dedicated screen
│       └── HomeScreen.tsx              # Updates to make current grid clickable
├── store/
│   └── workoutStore.ts                 # Added aggregators for yearly history
└── types/
    └── index.ts                        # Added types for the history aggregated data
```

**Structure Decision**: Added a new screen `YearlyConsistencyScreen.tsx` within the `home` flow, supported by atomic components for the grid and year selector. State changes will be handled within the existing `workoutStore`.
