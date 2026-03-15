# Tasks: Activity Grid Labels

**Input**: Design documents from `/specs/010-activity-grid-labels/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure
*Note: No setup is required since this is a feature modifying an existing React component.*

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented
*Note: No foundational work is required for this UI update.*

---

## Phase 3: User Story 1 - Viewing full week day labels (Priority: P1) 🎯 MVP

**Goal**: Display labels for every day of the week on the y-axis, resolving the missing initials (M, T, W, T, F, S, S).

**Independent Test**: Can be fully tested by opening the activity history view and confirming that seven vertically aligned labels appear starting from the first day of the week.

### Implementation for User Story 1

- [x] T001 [US1] Update day labels mapping in `src/components/home/YearlyConsistencyGrid.tsx` to include all 7 days ("M", "T", "W", "T", "F", "S", "S") instead of skipping days.
- [x] T002 [US1] Adjust layout math (`top` offset calculation) inside the mapping loop in `src/components/home/YearlyConsistencyGrid.tsx` to properly align the 7 labels with the height of the cells and gaps.

**Checkpoint**: At this point, the row labels for the y-axis should display all 7 days aligned with the weekly rows.

---

## Phase 4: User Story 2 - Viewing month labels (Priority: P2)

**Goal**: Show month labels above the grid, so users can understand the timeframe of the column data.

**Independent Test**: Can be fully tested by opening the activity history view and verifying that month abbreviations appear above the columns that correspond to the start of those months.

### Implementation for User Story 2

- [x] T003 [US2] Extract current month calculation logic inside the week column mapping of `src/components/home/YearlyConsistencyGrid.tsx` to determine when a new month begins.
- [x] T004 [US2] Render a `Text` element containing the month abbreviation above columns where the month differs from the previous column's month in `src/components/home/YearlyConsistencyGrid.tsx`.
- [x] T005 [US2] Adjust styling in `src/components/home/YearlyConsistencyGrid.tsx` to ensure month labels fit properly on narrow mobile screens (e.g., handling width overlap without distorting grid columns).

**Checkpoint**: Users should now see month labels pinned to the correct column. The entire feature is now complete.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T006 [P] Verify `YearlyConsistencyGrid.tsx` displays correctly within `HomeScreen.tsx` layout constraints.
- [x] T007 [P] Run quickstart.md validation locally using the Expo bundler to ensure the application renders successfully and the design feels responsive.

---

## Dependencies & Execution Order

### Phase Dependencies
- **User Story 1 (P1)**: Can begin independently.
- **User Story 2 (P2)**: Modifies the same component `YearlyConsistencyGrid.tsx`. Ideally done sequentially after T001-T002 to avoid merge conflicts in the local file.
- **Polish**: Depends on the completion of US1 and US2.

### Within Each User Story
- Logic calculations must be written before text element rendering boundaries (T003 before T004).

### Parallel Opportunities
- Polish tasks T006 and T007 can be executed sequentially after US 2 completion. Due to the single-file nature of this update, massive parallelization is not optimal.
