# Tasks: Routine Workout Reps & Sets Selection

**Input**: Design documents from `/specs/012-routine-reps-sets/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

**Checkpoint**: Setup ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Selecting Reps and Sets for Routine Workout (Priority: P1) 🎯 MVP

**Goal**: Users can define the volume (Sets and Reps) of a routine workout without being bound to a specific weight.

**Independent Test**: Can be independently tested by creating or editing a routine, picking a workout to add, and verifying that the modal prompts for "Sets" and "Reps" instead of "Weight".

### Implementation for User Story 1

- [X] T001 [US1] Update `addExerciseToDay` to accept `targetSets` and `targetReps` (explicitly removing or ignoring `targetWeight`) in `src/store/routineStore.ts`
- [X] T002 [US1] Update configuration modal to prompt for "Sets" and "Reps" with defaults (3 sets, 10 reps) instead of "Weight" in `src/screens/routine/CreateRoutineScreen.tsx`
- [X] T003 [US1] Add positive integer validation to prevent saving on `0` or empty inputs in `src/screens/routine/CreateRoutineScreen.tsx`
- [X] T004 [US1] Update `RoutineDayExercise` list items to display target Sets and Reps instead of Weight in `src/screens/routine/CreateRoutineScreen.tsx`
- [X] T005 [P] [US1] Update `RoutineDay` exercise displays to show configured Sets and Reps instead of Weight in `src/screens/routine/RoutineDetailScreen.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T006 Run interactive tests following testing scenario to ensure UI correctly rejects empty inputs and saves sets/reps
- [X] T007 Clean up unused state or variables related to target weight in modal logic in `src/screens/routine/CreateRoutineScreen.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately.

### Parallel Opportunities

- Task T005 [P] can run in parallel with earlier UI updates as it affects a separate read-only file (`src/screens/routine/RoutineDetailScreen.tsx`).

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready
