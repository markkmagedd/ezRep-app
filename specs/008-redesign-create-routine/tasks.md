# Tasks: Redesign Create Routine Screen

**Input**: Design documents from `/specs/008-redesign-create-routine/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

There are no external packages to install or major configuration changes since this is a UI refactor.

- [x] T001 Verify `src/screens/routine/CreateRoutineScreen.tsx` is clean and ready for changes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

There are no foundational or blocking infrastructure tasks for this feature since it relies entirely on the existing `useRoutineStore`.

---

## Phase 3: User Story 1 - Add and Manage Exercises via Bottom Bar (Priority: P1) 🎯 MVP

**Goal**: Implement an expandable bottom sheet or collapsible panel to track selected exercises without covering the main exercise catalog. Guarantee a sticky "Create Routine" button below the overview so users can submit efficiently.

**Independent Test**: Add exercises and see them appear in an expandable bottom tray. Removing exercises from the tray works. The main list remains scrollable.

### Implementation for User Story 1

- [x] T002 [US1] Add `isSheetExpanded` state toggle and update `Animated.timing` logic for height transitions in `src/screens/routine/CreateRoutineScreen.tsx`.
- [x] T003 [US1] Create the base expandable bottom sheet `Animated.View` structure replacing the old tray in `src/screens/routine/CreateRoutineScreen.tsx`.
- [x] T004 [US1] Migrate the map function for selected `exercises` into a `ScrollView` inside the new expandable bottom sheet in `src/screens/routine/CreateRoutineScreen.tsx`.
- [x] T005 [US1] Add the sticky "Create Routine" footer view directly underneath the expandable bottom sheet in `src/screens/routine/CreateRoutineScreen.tsx`.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. The layout might have some unwanted spaces, but the bottom sheet mechanics will work.

---

## Phase 4: User Story 2 - Clean and Consistent Layout (Priority: P2)

**Goal**: Redesign the Create Routine screen to have consistent, minimal spacing between search components and lists.

**Independent Test**: Screen loads with no unusual or unintended gaps between the search bar, filter chips, and the list of exercises.

### Implementation for User Story 2

- [x] T006 [US2] Simplify the main layout hierarchy by removing unnecessary `flex: 1` wrappers around `ExerciseSearchBar`, `MuscleGroupFilter`, and `ExerciseList` in `src/screens/routine/CreateRoutineScreen.tsx` to prevent hidden gaps.
- [x] T007 [US2] Update `StyleSheet` values in `src/screens/routine/CreateRoutineScreen.tsx` to fix any remaining vertical spacing/margins.

**Checkpoint**: At this point, both User Stories 1 AND 2 should be working smoothly with a clean UI.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T008 [P] Run manual validation checks from `specs/008-redesign-create-routine/quickstart.md`.
- [x] T009 [P] Confirm iOS `KeyboardAvoidingView` does not conflict with the new bottom bar layout.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately.
- **Foundational (Phase 2)**: N/A.
- **User Stories (Phase 3+)**: US1 (Phase 3) must be done before US2 (Phase 4).
- **Polish (Final Phase)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies.
- **User Story 2 (P2)**: Technically independent, but best applied to the same file (`CreateRoutineScreen.tsx`) after the structural changes of US1 are complete to avoid merge conflicts.

### Parallel Opportunities

- Due to all changes modifying `CreateRoutineScreen.tsx`, parallelization between US1 and US2 is not recommended. Tasks should be executed sequentially.
- Polish tasks (T008, T009) can be done in parallel once the code is implemented.

---

## Implementation Strategy

### Incremental Delivery

1. Setup environment.
2. Build the basic sheet expansion logic (T002-T004).
3. Connect the sticky button (T005) -> Test MVP.
4. Clean up the surrounding gaps (T006-T007) -> Test P2.
5. Final manual validation (T008-T009).

