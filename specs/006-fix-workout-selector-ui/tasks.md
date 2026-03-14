---

description: "Task list for fixing workout selector UI and selection logic"
---

# Tasks: Fix Workout Selector UI and Selection Logic

**Input**: Design documents from `/specs/006-fix-workout-selector-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Manual UI validation is the primary testing method for this feature.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Verify existing theme constants in `src/constants/theme.ts` align with "Dark Gym" requirements (FR-005)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and state preparation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Define `SelectionBuffer` local state and selection logic in `src/screens/workout/ExerciseSelectorScreen.tsx`
- [x] T003 [P] Update `handleSelect` in `src/screens/workout/ExerciseSelectorScreen.tsx` to toggle items in the buffer instead of immediate navigation

**Checkpoint**: Foundation ready - selection logic is decoupled from immediate store updates.

---

## Phase 3: User Story 1 - Clean Filter Layout (Priority: P1) 🎯 MVP

**Goal**: Resolve inconsistent vertical spacing and provide a professional layout for the filter section.

**Independent Test**: Open the Exercise Selector and verify 16dp spacing between filters and search bar using `Spacing.md`.

### Implementation for User Story 1

- [x] T004 [US1] Adjust `styles.searchRow` in `src/screens/workout/ExerciseSelectorScreen.tsx` to use `marginBottom: Spacing.sm` (FR-001)
- [x] T005 [US1] Apply consistent vertical padding to filter chip containers in `src/screens/workout/ExerciseSelectorScreen.tsx` (FR-001)
- [x] T006 [US1] Ensure the filter bar remains fixed and doesn't "jump" during list updates in `src/screens/workout/ExerciseSelectorScreen.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Managed Selection Pile (Priority: P1)

**Goal**: Implement a non-intrusive, interactive horizontal selection pile that doesn't obstruct the exercise list.

**Independent Test**: Select 10+ exercises and verify the selection bar remains a single row and is scrollable.

### Implementation for User Story 2

- [x] T007 [US2] Implement the horizontal scrollable selection bar using `FlatList` in `src/screens/workout/ExerciseSelectorScreen.tsx` (FR-003)
- [x] T008 [US2] Position the selection bar below the search bar and above the exercise list (FR-002)
- [x] T009 [US2] Implement conditional visibility for the selection bar (only visible if count > 0) in `src/screens/workout/ExerciseSelectorScreen.tsx`
- [x] T010 [US2] Style selection chips with high-contrast borders and interactive removal (FR-004, FR-005)
- [x] T011 [US2] Implement the conditional "Add (X) Exercises" button at the bottom of `src/screens/workout/ExerciseSelectorScreen.tsx` (FR-006)
- [x] T012 [US2] Update confirmation logic to batch-add all exercises from `SelectionBuffer` to `useWorkoutStore` and then navigate back

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and final validation

- [x] T013 [P] Verify UI behavior on small-screen devices (iPhone SE simulation)
- [x] T014 Run `quickstart.md` validation steps to ensure all requirements are met
- [x] T015 Code cleanup and removal of any legacy selection logic in `src/screens/workout/ExerciseSelectorScreen.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all UI work.
- **User Stories (Phase 3+)**: Depend on Foundational phase. US1 and US2 can be implemented sequentially.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### Implementation Strategy

1. **Phase 1 & 2**: Prepare the data structure and selection toggle logic.
2. **Phase 3 (US1)**: Fix the spacing issues (MVP increment).
3. **Phase 4 (US2)**: Implement the complex selection UI and batch-add logic.
4. **Final Validation**: Run quickstart tests.
