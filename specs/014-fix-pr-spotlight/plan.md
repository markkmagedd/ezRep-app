# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

The goal of this feature is to ensure the PR Spotlight Card on the Home Screen displays the actual all-time heaviest lift for a user rather than restricting it to only recent workouts or showing placeholder text incorrectly. To achieve this efficiently, we will cache a `lifetime_pr` object directly onto the User Profile document in Firestore and evaluate it synchronously whenever a workout is finished. For existing users without this cached value, the application will retrieve all past workouts precisely once to compute the all-time PR, then persist it back to the user document.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React Native, Expo SDK 54, Zustand 4.5, Firebase (Firestore)
**Storage**: Firestore Documents (`users/{uid}`)
**Testing**: Jest / Not specified natively
**Target Platform**: iOS/Android Mobile App
**Project Type**: Mobile App
**Performance Goals**: < 1 second load time for retrieving PR on Home screen.
**Constraints**: Firestore cannot group-by or natively aggregate embedded arrays. Max PR evaluation must occur either on the client efficiently or once per write.
**Scale/Scope**: O(1) read scalable architecture by caching PR into user profiles instead of parsing history tree.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] I. Real-time Social Synchronization: We are using Firestore, so it is strictly compliant.
- [x] II. High-Contrast "Dark Gym" UI & Aesthetics: We are leveraging the existing design tokens (e.g. `Colors`) in `HomeScreen.tsx`.
- [x] III. Rigid State Machines: We are using Zustand strictly to manage the active workout data and handle `finishWorkout` atomic commit logic.
- [x] IV. Strict TypeScript Discipline: Native interfaces and types will be defined in `src/types`.
- [x] V. Atomic Component Architecture & Unified Variants: Existing components (Card, Ionicons) are used.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
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
├── components/
│   └── home/
├── store/
│   └── workoutStore.ts
├── types/
│   └── index.ts
└── screens/
    └── home/
        └── HomeScreen.tsx
```

**Structure Decision**: The application is an Expo mobile project. All relevant files are in `src/`. We will modify the `WorkoutStore`, the user profile types, and the `HomeScreen.tsx`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No specific complexity tracking needed; strictly adheres to constitution.
