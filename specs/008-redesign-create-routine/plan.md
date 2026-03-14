# Implementation Plan: Redesign Create Routine Screen

**Branch**: `008-redesign-create-routine` | **Date**: 2026-03-13 | **Spec**: [specs/008-redesign-create-routine/spec.md](specs/008-redesign-create-routine/spec.md)
**Input**: Feature specification from `/specs/008-redesign-create-routine/spec.md`

## Summary

Redesign the Create Routine screen to have consistent, minimal spacing between search components and lists. Implement an expandable bottom sheet or collapsible panel to track selected exercises without covering the main exercise catalog. Guarantee a sticky "Create Routine" button below the overview so users can submit efficiently.

## Technical Context

**Language/Version**: TypeScript 5.x / React Native  
**Primary Dependencies**: React Native, Expo SDK 54, Zustand, `@gorhom/bottom-sheet`  
**Storage**: N/A for this UI change.  
**Testing**: N/A  
**Target Platform**: iOS / Android Mobile App  
**Project Type**: Mobile App  
**Performance Goals**: 60 fps smooth sheet expansions  
**Constraints**: Needs to accommodate iOS `KeyboardAvoidingView`  
**Scale/Scope**: 1 primary screen rewrite (CreateRoutineScreen Step 2)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **II. High-Contrast "Dark Gym" UI & Aesthetics**: Must rigidly use `Colors.bgCard` or `Colors.bgSurface` for the bottom sheet and maintain the `Colors.accent` for the "Create Routine" and selected list.
- **V. Atomic Component Architecture & Unified Variants**: Refactor and reorganize components (e.g. padding and margins) without breaking standard `Card` and `Button` atomic setups.

All constitution checks pass.

## Project Structure

### Documentation (this feature)

```text
specs/008-redesign-create-routine/
├── plan.md              
├── research.md          
├── data-model.md        
├── quickstart.md        
├── contracts/           
└── tasks.md             
```

### Source Code (repository root)

```text
src/
├── screens/
│   └── routine/
│       └── CreateRoutineScreen.tsx
```

**Structure Decision**: Only modifying the layout inside `src/screens/routine/CreateRoutineScreen.tsx`. No new components introduced outside of this screen.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
