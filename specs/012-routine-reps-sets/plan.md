# Implementation Plan: Routine Workout Reps & Sets Selection

**Branch**: `012-routine-reps-sets` | **Date**: 2026-03-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-routine-reps-sets/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

The core requirement is to allow users to specify the number of target sets and reps when adding an exercise to a routine day, rather than specifying a target weight. The prompt should have sensible defaults (3 sets, 10 reps) and proper validation (prevent saving on 0 or empty inputs).

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React Native, Expo SDK 54, Zustand
**Storage**: Firebase Firestore
**Testing**: Jest / React Native Testing Library
**Target Platform**: iOS/Android Mobile App
**Project Type**: Mobile Application
**Performance Goals**: Instant UI reflection of state updates
**Constraints**: Adhere to Dark Gym UI constraints
**Scale/Scope**: Local / Client-first state management

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Real-time Social Synchronization**: N/A (Routine creation is mostly a single-player editing feature)
- **High-Contrast "Dark Gym" UI**: Needs custom variants and inputs for numbers that match the dark system and handle validation errors clearly.
- **Rigid State Machines**: Zustand store (`routineStore`) modifications required.
- **Strict TypeScript Discipline**: `RoutineDayExercise` type will be leveraged explicitly.
- **Atomic Component Architecture**: Will reuse atomic inputs (e.g. standard TextInput with dark styling).

## Project Structure

### Documentation (this feature)

```text
specs/012-routine-reps-sets/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── index.ts                # Ensure `target_sets` and `target_reps` are defined correctly on `RoutineDayExercise`
├── store/
│   └── routineStore.ts         # Logic for adding exercises and saving sets/reps
├── screens/
│   └── routine/
│       └── CreateRoutineScreen.tsx  # Modal/UI changes for prompting sets/reps instead of weight
```

**Structure Decision**: Modifying an existing mobile app structure. The `CreateRoutineScreen` or the underlying `ExerciseSelector` modal will need to be updated.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | N/A        | N/A                                 |
