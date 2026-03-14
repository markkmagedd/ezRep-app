# Implementation Plan: Fix Workout Selector UI and Selection Logic

**Branch**: `006-fix-workout-selector-ui` | **Date**: 2026-03-13 | **Spec**: [specs/006-fix-workout-selector-ui/spec.md]
**Input**: Feature specification from `/specs/006-fix-workout-selector-ui/spec.md`

## Summary

This feature addresses UI/UX issues in the exercise selector by introducing a multi-selection workflow, fixing inconsistent vertical spacing, and implementing a non-intrusive horizontal scrollable selection pile. It preserves the "Dark Gym" aesthetic while improving the efficiency of adding multiple exercises to a workout.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React Native, Expo (SDK 54), Zustand 4.5, Ionicons
**Storage**: Zustand (`workoutStore`), React `useState` (SelectionBuffer)
**Testing**: Manual UI validation with multi-selection scenarios
**Target Platform**: iOS 15+, Android 11+
**Project Type**: mobile-app
**Performance Goals**: Fluid UI interactions during selection/deselection
**Constraints**: Selection pile must not exceed 30% of screen height (SC-003)
**Scale/Scope**: Refactoring 1 screen (`ExerciseSelectorScreen.tsx`) and styling components.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Real-time Social Synchronization**: N/A (Solo selection flow).
- **High-Contrast "Dark Gym" UI & Aesthetics**: **PASS**. Adheres to high-contrast colors and spacing tokens.
- **Rigid State Machines**: **PASS**. Managed by Zustand and local state transitions.
- **Strict TypeScript Discipline**: **PASS**. Using existing `ExerciseRecord` and `WorkoutState` types.
- **Atomic Component Architecture & Unified Variants**: **PASS**. Using common components and design tokens.

## Project Structure

### Documentation (this feature)

```text
specs/006-fix-workout-selector-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (next step)
```

### Source Code (repository root)

```text
src/
├── screens/
│   └── workout/
│       └── ExerciseSelectorScreen.tsx  # Main refactoring target
└── store/
    └── workoutStore.ts                 # Store context
```

**Structure Decision**: Single screen refactor. Selection logic is contained within the screen to keep the store clean of transient state.
