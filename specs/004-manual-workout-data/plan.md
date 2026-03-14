# Implementation Plan: Manual Workout Data

**Branch**: `004-manual-workout-data` | **Date**: 2026-03-12 | **Spec**: [specs/004-manual-workout-data/spec.md]
**Input**: Feature specification from `/specs/004-manual-workout-data/spec.md`

## Summary

Migrate the exercise library from external API dependencies to a self-contained, high-performance local data model. This ensures 100% offline availability and consistent exercise descriptions. We will implement an in-memory search index to maintain <100ms latency across name, keyword, and muscle-based searches.

## Technical Context

**Language/Version**: TypeScript 5.x (Strict)  
**Primary Dependencies**: React Native 0.81, Expo SDK 54, Zustand 4.5  
**Storage**: Static JSON/TS constants bundled with app assets  
**Testing**: Jest for search indexing logic, Manual verification for UI/Offline  
**Target Platform**: iOS 15+, Android 11+  
**Project Type**: mobile-app  
**Performance Goals**: <100ms search latency for 50-100 exercises  
**Constraints**: Offline-first, Zero external API calls for workout data  
**Scale/Scope**: 50-100 comprehensive exercise definitions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **High-Contrast UI**: Screens must use `Colors.bg` (#0D0D0D) and `Colors.accent` (#C6F135).
2. **Strict TypeScript**: `ExerciseDef` must be explicitly typed in `src/types/index.ts`. No `any`.
3. **Atomic Components**: Reuse `src/components/common/Card.tsx`, `Button.tsx`, and `Input.tsx`.
4. **Rigid State Machines**: Initialize search index within a Zustand store (`exerciseStore`).
5. **Asset Resilience**: UI must hide image/video sections if local assets are missing (Edge Case).

## Project Structure

### Documentation (this feature)

```text
specs/004-manual-workout-data/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Exercise JSON Schema
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── constants/
│   └── exercises.ts     # Local exercise library data
├── types/
│   └── index.ts         # Exercise data interfaces
├── store/
│   └── exerciseStore.ts # Search index and library state
└── screens/
    └── workout/
        ├── ExerciseSelectorScreen.tsx # Updated search logic
        └── ExerciseDetailScreen.tsx   # Updated rendering logic
```

**Structure Decision**: Single project (Mobile). Data is kept in `constants/` for static bundling, indexed in `store/` for performance.
