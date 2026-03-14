# Tasks: Workout API Integration

**Input**: Design documents from `/specs/003-workout-api-integration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify API Ninjas integration key configuration in environment variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 [P] Create `Exercise` data model interface in `src/models/exercise.ts`
- [ ] T003 [P] Implement API Ninjas REST client in `src/api/api-ninjas.ts`
- [ ] T004 Implement Firestore caching interactions in `src/services/firestore-cache.ts`
- [ ] T005 Create Zustand store for exercise state management in `src/store/exercise-store.ts`
- [ ] T006 Implement core infinite scrolling and caching hook in `src/hooks/use-exercises.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse Exercises by Muscle Group (Priority: P1) 🎯 MVP

**Goal**: Users browsing for exercises to add to their routine should be able to see a comprehensive list of exercises filtered by a specific muscle group.

**Independent Test**: Can be fully tested by opening the exercise selection screen, choosing a muscle group filter, and verifying that relevant exercises are fetched and displayed from the external data source.

### Implementation for User Story 1

- [ ] T007 [P] [US1] Extend API client and Firestore service to support muscle filter querying in `src/api/api-ninjas.ts` and `src/services/firestore-cache.ts`
- [ ] T008 [P] [US1] Create `MuscleGroupFilter` UI component in `src/components/MuscleGroupFilter.tsx`
- [ ] T009 [US1] Create infinite scrolling `ExerciseList` component in `src/components/ExerciseList.tsx`
- [ ] T010 [US1] Integrate `MuscleGroupFilter` and `ExerciseList` into the routine creation screen
- [ ] T011 [US1] Implement mapping logic to categorize empty returned muscles into "Other/Unspecified" filter

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Search for Specific Exercises (Priority: P2)

**Goal**: Users should be able to search for specific exercises by name if they know exactly what they want to add to their routine.

**Independent Test**: Can be tested independently by entering a known exercise name in a search bar and verifying the system returns the correct match.

### Implementation for User Story 2

- [ ] T012 [P] [US2] Extend API client and Firestore service to support name search querying in `src/api/api-ninjas.ts` and `src/services/firestore-cache.ts`
- [ ] T013 [P] [US2] Create `ExerciseSearchBar` UI component in `src/components/ExerciseSearchBar.tsx`
- [ ] T014 [US2] Integrate `ExerciseSearchBar` with the `ExerciseList` component and `use-exercises` hook

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T015 Verify graceful error handling and fallback UI states across the exercise selection flow
- [ ] T016 Run quickstart.md validation to ensure centralized cache is correctly building and serving data

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - Sequential priority order (P1 → P2) is recommended here as US2 builds upon US1's ExerciseList.
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1's ExerciseList but search logic is independently testable

### Parallel Opportunities

- Foundational tasks (T002, T003) can be worked on in parallel.
- US1 UI components (T008) and Backend logic (T007) can be done in parallel.
- US2 UI components (T013) and Backend logic (T012) can be done in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch UI and Data tasks for User Story 1 together:
Task: "Extend API client and Firestore service to support muscle filter querying in src/api/api-ninjas.ts and src/services/firestore-cache.ts"
Task: "Create MuscleGroupFilter UI component in src/components/MuscleGroupFilter.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart.md

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → MVP!
3. Add User Story 2 → Test independently
4. Run Polish tasks to finalize delivery.
