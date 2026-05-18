# Tasks: Fix PR Spotlight

**Input**: Design documents from `/specs/014-fix-pr-spotlight/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

There are no project initialization tasks for this feature, as it modifies an existing screen and store.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

There are no foundational or blocking pieces required prior to User Story 1 since all changes directly serve US1.

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - View All-Time Personal Best (Priority: P1) 🎯 MVP

**Goal**: As a user, I want to see my actual, all-time heaviest lift in the Personal Best Spotlight card on the Home screen, rather than placeholder text or a PR limited to only recent workouts, so that I can feel motivated by my actual top achievement.

**Independent Test**: Can be independently tested by logging a workout with a heavy set in the distant past (e.g., 6 months ago), ensuring it does not appear in "recent workouts" but does successfully appear in the PR Spotlight card on the Home screen.

### Implementation for User Story 1

- [x] T001 [US1] Update `src/types/index.ts` to add the `lifetime_pr` property (`weight_kg`, `exercise_name`, `achieved_at`) to the User profile type.
- [x] T002 [US1] Update `src/store/workoutStore.ts` to implement a backfill function that retrieves all workouts, calculates the lifetime PR, and saves it to the user document if `lifetime_pr` is missing.
- [x] T003 [US1] Modify `finishWorkout` in `src/store/workoutStore.ts` to automatically compare the newly finished workout against the user's `lifetime_pr` and update the document if a new max or recent tie is achieved.
- [x] T004 [US1] Update `src/screens/home/HomeScreen.tsx` to render the PR Spotlight Card directly from the user's `lifetime_pr` object rather than manually computing it from `recentWorkouts`.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T005 Run quickstart.md validation locally to verify UI state seamlessly updates on workout finish.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A
- **Foundational (Phase 2)**: N/A
- **User Stories (Phase 3+)**: US1 can begin immediately.
- **Polish (Final Phase)**: Depends on US1 being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies.

### Within Each User Story

- Type updates before store logic
- Store logic before UI updates

### Parallel Opportunities

- Store logic and UI layout (using mock data) could hypothetically be run in parallel, but sequential execution is recommended given the small scope.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1
2. **STOP and VALIDATE**: Test User Story 1 independently by viewing the HomeScreen and completing a new max workout.
3. Deploy/demo if ready.
