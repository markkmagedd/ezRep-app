# Tasks: PR Spotlight Screen

**Input**: Design documents from `/specs/015-pr-spotlight-screen/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Verify project structure and existing dependencies

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Update navigation parameter lists (`HomeStackParamList` and `ProfileStackParamList`) in `src/types/index.ts` to include `PRSpotlight`
- [X] T003 [P] Define `ExercisePR` interface and implement `loadAllExercisePRs` action and `exercisePRs` state in `src/store/workoutStore.ts`
- [X] T004 [P] Create base `PRSpotlightScreen` component skeleton in `src/screens/profile/PRSpotlightScreen.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View PR List from Home Screen (Priority: P1) 🎯 MVP

**Goal**: Users want to tap the "PR Spotlight" card on the Home Screen to navigate to a detailed list of their heaviest lifts.

**Independent Test**: Can be fully tested by tapping the PR spotlight card and verifying that it navigates to the new screen containing the correct PR data.

### Implementation for User Story 1

- [X] T005 [P] [US1] Wrap the existing PR Spotlight card in `src/screens/home/HomeScreen.tsx` with `TouchableOpacity` and trigger navigation to `PRSpotlight`
- [X] T006 [US1] Implement `FlatList` in `src/screens/profile/PRSpotlightScreen.tsx` to display sorted `ExercisePR` data
- [X] T007 [US1] Add empty state rendering ("No PRs yet. Keep lifting!") and `<ActivityIndicator>` loading state in `src/screens/profile/PRSpotlightScreen.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View PR List from Profile Screen (Priority: P2)

**Goal**: Users want to access the "Heaviest Lifts" screen from their Profile screen.

**Independent Test**: Can be fully tested by navigating to the Profile screen, tapping the new entry point, and verifying navigation parity.

### Implementation for User Story 2

- [X] T008 [P] [US2] Add a navigation entry point (e.g., button, list tile) for "Heaviest Lifts" in `src/screens/profile/ProfileScreen.tsx` that routes to `PRSpotlight`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T009 Code cleanup and refactoring
- [X] T010 Run quickstart.md validation to verify Home and Profile flows and empty state logic

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel if applicable, but are sequential here.
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independently testable from Profile screen

### Parallel Opportunities

- T003 and T004 (Zustand state vs UI skeleton) in Foundational can be done in parallel.
- T005 (Home Screen change) can happen in parallel with T006, T007 (PRSpotlightScreen list logic).
- T008 (Profile Screen change) can be done in parallel with T005, T006, T007.
