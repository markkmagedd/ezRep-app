# Implementation Plan: Set Workout Reps and Weights

**Branch**: `011-set-workout-reps-weights` | **Date**: 2026-03-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-set-workout-reps-weights/spec.md`

## Summary

Intercept the workout selection tap to present a centered modal overlay where the user must configure reps and weight (starting at "0") before the workout is added to the selected routine summary (pull-up bar). Tapping an already selected workout will deselect it.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React Native (0.81), Expo (SDK 54), Zustand 4.5
**Storage**: N/A (Local Zustand `workoutStore` for routine state)
**Testing**: Jest / manual UI testing
**Target Platform**: iOS/Android
**Project Type**: mobile-app
**Performance Goals**: Instant interaction, smooth modal appearances (< 100ms lag)
**Constraints**: Follow "Dark Gym" UI aesthetics (high contrast, explicit shadows). Atomic component architecture.
**Scale/Scope**: Single configuration overlay within the routine creation flow.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Real-time Social Synchronization**: (N/A) This is purely a pre-session routine authoring flow.
- **High-Contrast "Dark Gym" UI**: The modal must use `Colors.bgSurface` (#242424) for the form and `Colors.bg` overlay with `Shadow.md`. Tap targets must be at least padding 14.
- **Rigid State Machines**: Pre-session configuration state. We will use local state (`useState`) for the temporary configuration and Zustand (`workoutStore`) once confirmed.
- **Strict TypeScript Discipline**: Yes. `PendingWorkout` type to be created and strictly typed.
- **Atomic Component Architecture**: Will use existing `Button` and `Input` components where available.

## Project Structure

### Documentation (this feature)

```text
specs/011-set-workout-reps-weights/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── routine/
│       ├── WorkoutSelectionModal.tsx  # New or updated
│       └── RepWeightConfigModal.tsx   # New centered modal for configuration
├── types/
│   └── index.ts                       # Update RoutineWorkout / PendingWorkout
└── store/
    └── workoutStore.ts                # Update store methods to accept reps/weights
```

**Structure Decision**: Using the mobile app component-centric approach, building new UI components for the configuration modal inside the routine creation flow.

## Complexity Tracking

*No violations.*
