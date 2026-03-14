# Tasks: Exercise Selector Screen Redesign (007)

**Input**: Design documents from `/specs/007-redesign-exercise-selector/`
**Branch**: `007-redesign-exercise-selector`
**File**: `src/screens/workout/ExerciseSelectorScreen.tsx` (only file modified)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US#]**: Which user story this task belongs to

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the file and imports for the new layout.

- [x] T001 Read and understand current `ExerciseSelectorScreen.tsx` in `src/screens/workout/ExerciseSelectorScreen.tsx` — identify all existing style keys and component sections to be removed/replaced
- [x] T002 Add `Animated`, `Easing` to React Native imports in `src/screens/workout/ExerciseSelectorScreen.tsx`

**Checkpoint**: Imports ready, no visual change yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Introduce the `Animated.Value` ref and the `useEffect` that drives tray entry/exit. This is the core mechanism US1, US2, and US3 all depend on.

**⚠️ CRITICAL**: Must complete before any user story phase.

- [x] T003 Define `TRAY_HEIGHT = 120` constant and `trayAnim = useRef(new Animated.Value(TRAY_HEIGHT)).current` in `src/screens/workout/ExerciseSelectorScreen.tsx`
- [x] T004 Add `useEffect` watching `selectionBuffer.length` — when `length` goes `0→1` animate `trayAnim` to `0` (slide in, 200ms ease-out); when `1→0` animate to `TRAY_HEIGHT` (slide out, 200ms ease-in) in `src/screens/workout/ExerciseSelectorScreen.tsx`

**Checkpoint**: Animated value and effect wired up; tray not yet rendered.

---

## Phase 3: User Story 1 — Browse and Select Without Obstruction (Priority: P1) 🎯 MVP

**Goal**: The exercise browse list is always fully visible and scrollable regardless of selection count.

**Independent Test**: Open the selector, select 5 exercises, confirm all list rows above the tray are still visible and tappable.

### Implementation for User Story 1

- [x] T005 [US1] Remove the existing mid-layout `selectionPile` section (lines 164–186, the horizontal chip pile between filter chips and the FlatList) from `src/screens/workout/ExerciseSelectorScreen.tsx`
- [x] T006 [US1] Remove the `position: 'absolute'` `addButtonContainer`/`addButton` from the JSX (lines 238–244) in `src/screens/workout/ExerciseSelectorScreen.tsx`
- [x] T007 [US1] Change the exercise results `FlatList` to `flex: 1` via its `style` prop and update `contentContainerStyle` to `paddingBottom: Spacing.md` (removing the old `Spacing.xxl + 88` workaround) in `src/screens/workout/ExerciseSelectorScreen.tsx`
- [x] T008 [US1] Add the `<Animated.View>` bottom tray **below** the `FlatList`, driven by `trayAnim.interpolate({ inputRange: [0, TRAY_HEIGHT], outputRange: [0, TRAY_HEIGHT] })` on `translateY`, in `src/screens/workout/ExerciseSelectorScreen.tsx`
- [x] T009 [US1] Inside the tray, render the "Add (N) Exercises" full-width `TouchableOpacity` button (calls `commitSelections`) using `trayAddBtn` style with `paddingVertical: 14` in `src/screens/workout/ExerciseSelectorScreen.tsx`
- [x] T010 [US1] Remove `selectionPile`, `selectionPileList`, `selectedChip`, `addButtonContainer`, `addButton`, `addButtonText` from `StyleSheet.create` and add new `tray`, `trayAddBtn`, `trayAddBtnText` styles in `src/screens/workout/ExerciseSelectorScreen.tsx`

**Checkpoint**: US1 complete — list never obscured, tray slides in/out, Add button functional.

---

## Phase 4: User Story 2 — Review and Remove Pending Selections (Priority: P2)

**Goal**: User can see selected exercises in the tray and remove individual ones without losing their browse list position.

**Independent Test**: Select 3 exercises, remove the second one via the tray chip `×`, confirm count drops to 2 and list scroll position is unchanged.

### Implementation for User Story 2

- [x] T011 [US2] Add a horizontal `FlatList` inside the `Animated.View` tray (above the Add button) rendering each `selectionBuffer` item as a chip with its name and a `×` remove button; each chip calls `toggleSelection(item)` on press in `src/screens/workout/ExerciseSelectorScreen.tsx`
- [x] T012 [US2] Add `trayChipsList`, `trayChip`, `trayChipLabel`, `trayChipRemove` style entries to the `StyleSheet.create` block; `trayChip` uses `Colors.bgSurface` background, `Colors.borderActive` border, with `flexDirection: 'row'` and `alignItems: 'center'` in `src/screens/workout/ExerciseSelectorScreen.tsx`

**Checkpoint**: US2 complete — selected exercises shown in tray, individually removable, list scroll preserved.

---

## Phase 5: User Story 3 — Search and Filter (Priority: P3)

**Goal**: Confirm search and body-part/equipment filter chips are fully accessible with the new layout (non-regression).

**Independent Test**: Search "bench", tap "Chest" chip, confirm filtered results appear correctly; clear search, confirm category filter persists.

### Implementation for User Story 3

- [x] T013 [US3] Verify the search bar `View` and body-part chip `FlatList` are positioned **above** the browse `FlatList` in the JSX (no structural change needed if already correct) in `src/screens/workout/ExerciseSelectorScreen.tsx`
- [x] T014 [US3] Verify the equipment chip `FlatList` (conditional) is also positioned in the header zone above the browse list, not inside or below it in `src/screens/workout/ExerciseSelectorScreen.tsx`

**Checkpoint**: US3 verified — search and filter fully accessible at all times, matching pre-redesign behaviour.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T015 [P] Add `Shadow.md` to the `tray` style for visual depth separation between tray and list in `src/screens/workout/ExerciseSelectorScreen.tsx`
- [x] T016 [P] Add a 1px `borderTopWidth: 1, borderTopColor: Colors.border` to `tray` style for a clean visual separator in `src/screens/workout/ExerciseSelectorScreen.tsx`
- [x] T017 Run manual quickstart.md test checklist on iOS Simulator (iPhone 16 Pro and iPhone SE): no-selection, 1-selection, 5-selection, remove-chip, confirm, cancel
- [x] T018 Remove any dead imports (e.g. unused style constants) introduced or left over from the restructure in `src/screens/workout/ExerciseSelectorScreen.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user story phases
- **Phase 3 (US1)**: Depends on Phase 2 — this is the MVP
- **Phase 4 (US2)**: Depends on Phase 3 (tray must exist before chip row is added inside it)
- **Phase 5 (US3)**: Can run in parallel with Phase 4 (verification only, no shared edits at the same time)
- **Phase 6 (Polish)**: Depends on all story phases complete

### Within Each Story

- Structural JSX changes (T005–T009) before style additions (T010)
- US2 chip row (T011) added inside the tray created in US1 (T008)

### Parallel Opportunities

```
Phase 1:  T001, T002 can run in parallel
Phase 3:  T005, T006 can run in parallel (different JSX regions)
Phase 6:  T015, T016, T018 can all run in parallel
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T004)
3. Complete Phase 3: User Story 1 (T005–T010)
4. **STOP and VALIDATE**: list never obscured, tray animates, Add button works
5. Proceed to US2 and US3

### Incremental Delivery

1. Setup + Foundational → animation scaffold ready
2. US1 → layout bug fully fixed (MVP!)
3. US2 → per-exercise removal from tray
4. US3 → filter/search regression verified
5. Polish → visual refinements

---

## Notes

- All tasks target a **single file**: `src/screens/workout/ExerciseSelectorScreen.tsx`
- No Firestore, no store, no navigation changes
- No new npm dependencies
- Tests not requested — manual verification via `quickstart.md` scenarios
