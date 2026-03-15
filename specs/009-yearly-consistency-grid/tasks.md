# Tasks: Yearly Consistency Grid

**Input**: Design documents from `/specs/009-yearly-consistency-grid/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

There are no unique external dependencies or top-level project changes needed for this UI-only feature. Phase 1 is empty as the project is already set up perfectly.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Create `YearlyConsistencyScreen.tsx` barebones view in `src/screens/home/YearlyConsistencyScreen.tsx`
- [x] T002 Add `YearlyConsistency` to the navigation stack typing in `src/types/index.ts`
- [x] T003 Register `YearlyConsistencyScreen` in the `AppNavigator` in `src/navigation/AppNavigator.tsx`

**Checkpoint**: Foundation ready - basic screen navigation is possible.

---

## Phase 3: User Story 1 - Navigating to Full Year View (Priority: P1) 🎯 MVP

**Goal**: Establish the entry point and navigation pathway bridging the quick-glance dashboard widget to the deep-dive historical view.

**Independent Test**: Can be fully tested by tapping the home widget and verifying a navigation transition occurs to the new yearly view screen.

### Implementation for User Story 1

- [x] T004 [US1] Wrap the `ConsistencyGrid` widget in `src/screens/home/HomeScreen.tsx` with a `TouchableOpacity` router link.
- [x] T005 [US1] Verify transition from `HomeScreen` to `YearlyConsistencyScreen`.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. You should be able to tap the Home screen widget and land on the empty Yearly Consistency screen.

---

## Phase 4: User Story 2 - Viewing and Navigating the Yearly Contribution Graph (Priority: P2)

**Goal**: See a full GitHub-style grid displaying all workouts for a specific calendar year and switch between past years based on activity history.

**Independent Test**: Can be fully tested by loading the Yearly Consistency screen directly and visually verifying that a year's worth of cells are rendered, correctly colored, and the year tabs dynamically reflect active history.

### Implementation for User Story 2

- [x] T006 [P] [US2] Implement data aggregation logic `getYearlyActivityOptions()` and `getGridForYear(year)` in `src/store/workoutStore.ts`
- [x] T007 [P] [US2] Create atomic `YearSelector` tab component in `src/components/home/YearSelector.tsx`
- [x] T008 [P] [US2] Create `YearlyConsistencyGrid` layout component in `src/components/home/YearlyConsistencyGrid.tsx` using a horizontal `ScrollView` matrix.
- [x] T009 [US2] Integrate `YearSelector` and `YearlyConsistencyGrid` into `src/screens/home/YearlyConsistencyScreen.tsx`, wiring them to the new Zustand store methods.
- [x] T010 [US2] Apply Dark Gym aesthetics and ensure empty boxes are muted while active boxes use `Colors.accent`.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work seamlessly.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T011 [P] Test grid matrix generation across leap years.
- [x] T012 Run quickstart validation to verify scroll behavior and padding spacing.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A - Project is ready.
- **Foundational (Phase 2)**: Starts immediately - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion. User Stories proceed sequentially in priority order (P1 → P2).
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories. 
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Should be tested by using the navigation built in US1.

### Within Each User Story

- Store/Logic aggregation before specialized UI components.
- Components before Screen layout integration.

### Parallel Opportunities

- Store logic (T006), Tab layout (T007), and Grid Matrix layout (T008) can all be built simultaneously by different developers.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
2. Complete Phase 3: User Story 1
3. **STOP and VALIDATE**: Ensure the transition from the home screen works effortlessly without crashing.

### Incremental Delivery

1. Foundation ready.
2. Add User Story 1 → Test independently → You can navigate to the page (MVP!).
3. Add User Story 2 → Test independently → The page now beautifully shows multi-year data. 
