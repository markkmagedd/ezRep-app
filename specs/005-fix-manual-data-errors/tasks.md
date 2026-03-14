---

description: "Task list for fixing manual data errors"
---

# Tasks: Fix Manual Data Errors

**Input**: Design documents from `/specs/005-fix-manual-data-errors/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Update store interfaces to resolve TypeScript errors blocking compilation.

- [X] T001 Define `applyFilters: () => void` within the `ExerciseState` interface in `src/store/exercise-store.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core refactoring required before specific user journeys can be verified.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Refactor `src/components/ExerciseList.tsx` to consume `filteredExercises` from `useExerciseStore` and remove legacy `use-exercises` API hook references
- [X] T003 Refactor `src/components/MuscleGroupFilter.tsx` to use `selectedBodyPart` and `setBodyPart` from `useExerciseStore`
- [X] T004 [P] Refactor `src/components/ExerciseSearchBar.tsx` to use `searchQuery` and `setSearchQuery` from `useExerciseStore`

**Checkpoint**: Foundation ready - legacy UI components are wired to the new local state

---

## Phase 3: User Story 1 - Error-Free Application Launch (Priority: P1) 🎯 MVP

**Goal**: The application launches successfully without throwing unhandled exceptions or TypeScript type errors.

**Independent Test**: Can be fully tested by running `npm run tsc` to verify no type errors exist, and launching the app in the simulator without encountering a crash.

### Implementation for User Story 1

- [X] T005 [US1] Run `npx tsc --noEmit` and verify 0 TypeScript errors remain across the codebase
- [X] T006 [US1] Launch application and verify `CreateRoutineScreen` renders the refactored components without runtime errors

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Stable Exercise Discovery and Details (Priority: P2)

**Goal**: Browse, search, and view exercise details from the local library without the app crashing or displaying broken UI components.

**Independent Test**: Can be fully tested by navigating to the Exercise Selector, typing a query, filtering by muscle group, and selecting an exercise to view its details without triggering any runtime errors.

### Implementation for User Story 2

- [X] T007 [US2] Verify search query input updates `ExerciseList` correctly without throwing errors
- [X] T008 [US2] Verify muscle group filter chips update `ExerciseList` correctly without throwing errors
- [X] T009 [US2] Verify navigating to `ExerciseDetailScreen` handles missing assets gracefully without crashing

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T010 [P] Clean up unused legacy types or unused imports in `src/components/ExerciseList.tsx` and `src/components/MuscleGroupFilter.tsx`
- [X] T011 Run quickstart.md validation commands to ensure full stability

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Must be completed first to resolve the root TypeScript error in the store interface.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories. It wires the UI to the corrected store.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion. Must execute in priority order (P1 → P2).
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### Parallel Opportunities

- T004 can run in parallel with T002 or T003 as they touch different UI components within the foundational phase.
- T010 can be done independently during the final polish phase.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify the compiler passes and the app boots.
