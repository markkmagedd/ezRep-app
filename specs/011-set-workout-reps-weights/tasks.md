# Tasks: Set Workout Reps and Weights

**Input**: Design documents from `/specs/011-set-workout-reps-weights/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize branch and confirm project compilation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Update `src/types/index.ts` to include `PendingWorkout` type and update `RoutineWorkout` (or equivalent type) with `reps` and `weight` properties.
- [X] T003 Update `src/store/workoutStore.ts` to accept `reps` and `weight` when adding a selected workout and ensure logic exists for removing a workout.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Configure Workout Details Upon Selection (Priority: P1) 🎯 MVP

**Goal**: When a user selects a workout, they are presented with an interface to set the desired reps and weight. After confirming, the workout is added to the selected workouts list.

**Independent Test**: Can be fully tested by selecting a single workout, inputting reps and weight, confirming, and verifying that the workout appears in the selected list with the correct inputted data.

### Implementation for User Story 1

- [X] T004 [P] [US1] Create the baseline `RepWeightConfigModal` UI component in `src/components/routine/RepWeightConfigModal.tsx` using `Modal transparent={true}` and "Dark Gym" styling.
- [X] T005 [US1] Update `src/components/routine/RepWeightConfigModal.tsx` to include internal component state and text inputs for `reps` and `weight` (defaulting to "0").
- [X] T006 [US1] Connect confirm action in `src/components/routine/RepWeightConfigModal.tsx` to call a submit handler with valid number parsing.
- [X] T007 [US1] Update `src/components/routine/WorkoutSelectionModal.tsx` (or equivalent workout list container) to maintain `pendingWorkout` temporary state via `useState`.
- [X] T008 [US1] Update `src/components/routine/WorkoutSelectionModal.tsx` to intercept workout tapping for unselected workouts to open the `RepWeightConfigModal` instead of immediately adding to store.
- [X] T009 [US1] Integrate `RepWeightConfigModal` confirmation logic into `src/components/routine/WorkoutSelectionModal.tsx` to dispatch `addSelectedWorkout` to `workoutStore` upon successful submission.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. You should be able to select a workout, configure its stats, and see it added.

---

## Phase 4: User Story 2 - Cancel Workout Selection (Priority: P2)

**Goal**: Allow users to cancel the prompt (dismissing the configuration) or deselect an already selected workout by tapping it again in the list.

**Independent Test**: Can be tested by selecting a workout and immediately cancelling, OR tapping an already selected workout in the list and verifying it is removed.

### Implementation for User Story 2

- [X] T010 [US2] Update `src/components/routine/RepWeightConfigModal.tsx` to handle a cancel/dismiss action (e.g., taping outside or a cancel button).
- [X] T011 [US2] Implement the cancel handler in `src/components/routine/WorkoutSelectionModal.tsx` to clear the `pendingWorkout` state when dismissal occurs.
- [X] T012 [US2] Update `src/components/routine/WorkoutSelectionModal.tsx` `onPress` logic: if the tapped workout is already in `workoutStore.selectedWorkouts`, dispatch a removal action to deselect it entirely.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can add context to workouts and also change their minds.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T013 Verify "Dark Gym" aesthetics matching `Colors.bgSurface` (#242424) for the form and `Colors.bg` overlay with `Shadow.md` in `RepWeightConfigModal`.
- [X] T014 Ensure tap targets for confirm/cancel buttons meet minimum 14 padding requirement.
- [X] T015 Verify edge cases specifically: ensuring only valid positive numbers are passed to the store on confirm.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - Sequential in priority order (US1 → US2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2).
- **User Story 2 (P2)**: Integrates into components from User Story 1. Depends heavily on User Story 1 structural completion.

### Within Each User Story

- Models before services (Types before Store logic)
- Core implementation before integration (`RepWeightConfigModal` built before wiring into `WorkoutSelectionModal`)
- Story complete before moving to next priority

### Parallel Opportunities

- Due to the focused scope of modifying essentially one view, most parallel opportunities lie in dividing the new UI component development from the Store / State logic updates if multiple engineers were working.

---

## Parallel Example: User Story 1

```bash
# Launch new UI elements alongside Type updates:
Task: "Update `src/types/index.ts` to include `PendingWorkout`"
Task: "Create the baseline `RepWeightConfigModal` UI component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently. Tapping a workout opens the modal, entering reps/weight and confirming adds it appropriately.
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test deselect and cancellation flows → Deploy/Demo
4. Each story adds value without breaking previous stories
