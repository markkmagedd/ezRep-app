---

description: "Task list for Manual Workout Data implementation"
---

# Tasks: Manual Workout Data

**Input**: Design documents from `/specs/004-manual-workout-data/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 [P] Define `ExerciseRecord` interface in `src/types/index.ts` matching `data-model.md`
- [X] T002 [P] Create `ExerciseCategory` and `ExerciseType` enums in `src/types/index.ts`
- [X] T003 [P] Configure Jest to handle JSON/TS constants for static data testing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for the local exercise library and search index

**⚠️ CRITICAL**: Must be completed before any User Story implementation

- [X] T004 Create `EXERCISE_LIBRARY` constant with initial schema in `src/constants/exercises.ts`
- [X] T005 [P] Create `exerciseStore.ts` in `src/store/` with Zustand
- [X] T006 Implement search index bootstrap logic in `exerciseStore.ts` (validation + regex string generation)
- [X] T007 Implement regex-based search action in `exerciseStore.ts` (support name, keywords, muscles)
- [X] T008 Add validation logging for malformed exercise entries in `exerciseStore.ts`

**Checkpoint**: Foundation ready - local library and high-performance indexing are functional

---

## Phase 3: User Story 1 - Local Exercise Discovery (Priority: P1) 🎯 MVP

**Goal**: Browse and search for exercises from the local library without internet

**Independent Test**: Disable network, search for "Pec Deck", verify "Lever Pec Deck Fly" appears

### Implementation for User Story 1

- [X] T009 [US1] Update `ExerciseSelectorScreen.tsx` in `src/screens/workout/` to use `exerciseStore`
- [X] T010 [US1] Replace API-dependent search calls with `exerciseStore` search action
- [X] T011 [US1] Implement rendering of the local exercise list using existing `Card` component
- [X] T012 [US1] Ensure search results return in <100ms via the in-memory index

**Checkpoint**: User Story 1 functional - users can find exercises offline

---

## Phase 4: User Story 2 - Detailed Exercise Information (Priority: P2)

**Goal**: View instructions, muscles, and videos with asset resilience

**Independent Test**: Select an exercise, verify instructions and muscles match data, verify UI handles missing assets

### Implementation for User Story 2

- [X] T013 [US2] Update `ExerciseDetailScreen.tsx` in `src/screens/workout/` to display instructions array
- [X] T014 [US2] Map `targetMuscles` and `secondaryMuscles` to detail view labels
- [X] T015 [US2] Implement conditional rendering for `imageUrl` and `videoUrl` in `ExerciseDetailScreen.tsx`
- [X] T016 [US2] Add logic to hide image/video sections if local asset resolution fails

**Checkpoint**: User Story 2 functional - detailed offline guides with resilient UI

---

## Phase 5: User Story 3 - Muscle Group Filtering (Priority: P3)

**Goal**: Filter exercises by body part and equipment

**Independent Test**: Select "CHEST" filter, verify only chest exercises are displayed

### Implementation for User Story 3

- [X] T017 [US3] Add `filterByBodyPart` and `filterByEquipment` actions to `exerciseStore.ts`
- [X] T018 [US3] Update `ExerciseSelectorScreen.tsx` to include filter chips/dropdowns
- [X] T019 [US3] Integrate filters with the regex search results in the UI

**Checkpoint**: User Story 3 functional - advanced discovery via muscle and tool filters

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, performance finalization, and documentation

- [X] T020 [P] Finalize 50-100 exercise definitions in `src/constants/exercises.ts`
- [X] T021 [P] Optimize search index memory footprint
- [X] T022 Remove all legacy API Ninja integration code and environment variables
- [X] T023 Run `quickstart.md` validation scenarios

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: Defines the contracts for everything else.
- **Foundational (Phase 2)**: The `exerciseStore` is the engine for all stories.
- **User Story 1 (P1)**: The core entry point for the feature.
- **User Story 2 & 3 (P2, P3)**: Can proceed in parallel after Story 1 is stable.

## Parallel Opportunities

- T001, T002, T003 can run together.
- T005 and T004 can run together if the interface is agreed upon.
- T020 and T021 can run in parallel during the polish phase.

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 & 2.
2. Complete Story 1.
3. **VALIDATE**: Search is functional offline.

### Incremental Delivery
1. Add Story 2 (Details) -> Test asset fallback.
2. Add Story 3 (Filtering) -> Test complex discovery.
3. Finish with 50-100 data points.
