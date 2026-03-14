# Feature Specification: Exercise Selector Screen Redesign

**Feature Branch**: `007-redesign-exercise-selector`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "the design of the workout selector is still bugged because the piled workouts cover the workouts to select — i want a complete redesign to this page"

---

## Clarifications

### Session 2026-03-13

- Q: Where should the selection summary (chips + Add button) live in the new layout? → A: Sticky bottom tray — slides up from below the list when ≥1 exercise is selected, sits above the tab bar safe area.
- Q: Should the tray entrance/exit be animated or instant? → A: Animated slide-up (~200ms ease) when first item is selected; slides back down when last item is removed.
- Q: How should the tray behave when 10+ exercises are selected? → A: Fixed-height tray with a single horizontally-scrollable chip row; the Add button label already communicates the total count.

---

## User Scenarios & Testing

### User Story 1 — Browse and Select Exercises Without Obstruction (Priority: P1)

A user opens the Exercise Selector to add exercises to their routine. They want to scroll through the full exercise list, search by name, and filter by body-part category. Selected exercises should be visibly tracked but must **never block** the browse list.

**Why this priority**: The core function of this screen is browsing and selecting exercises. If selections cover the list, the screen is unusable — this is the primary bug driving this redesign.

**Independent Test**: Open the selector, scroll the exercise list, select 3+ exercises, and confirm every exercise row remains fully visible and tappable.

**Acceptance Scenarios**:

1. **Given** the selector is open with no selections, **When** the user scrolls the exercise list, **Then** all exercise rows are fully visible and no UI element overlaps them.
2. **Given** the user has 5 exercises selected, **When** they look at the exercise list, **Then** the full list is still scrollable and no row is hidden beneath a selection indicator.
3. **Given** the user has 1+ exercises selected, **When** they tap the "Add Exercises" button, **Then** all selected exercises are committed and the screen closes.

---

### User Story 2 — Review and Remove Pending Selections (Priority: P2)

A user who has selected multiple exercises wants to review their pending selections and remove one before confirming, without losing their place in the browse list.

**Why this priority**: The ability to undo a selection without losing browse context is essential for a comfortable multi-select workflow.

**Independent Test**: Select 3 exercises, then remove the second one, and confirm the browse list position is unchanged and the selection count drops to 2.

**Acceptance Scenarios**:

1. **Given** 3 exercises are selected, **When** the user removes one from the selection summary, **Then** the count updates immediately and the browse list scroll position is preserved.
2. **Given** all selections are removed, **When** the user looks at the screen, **Then** the "selection summary" area collapses or empties gracefully and the "Add Exercises" button is hidden.

---

### User Story 3 — Search and Filter Exercises (Priority: P3)

A user can type a name in the search bar and/or tap a body-part chip to narrow the visible exercise list.

**Why this priority**: Filtering is an existing capability that must be preserved and remain fully accessible throughout the redesign.

**Independent Test**: Type "bench" in the search bar, confirm only matching rows appear; then tap "Chest" chip, confirm results narrow further.

**Acceptance Scenarios**:

1. **Given** the search bar is empty, **When** the user types "bench", **Then** only exercises whose name contains "bench" (case-insensitive) are shown.
2. **Given** no filter is active, **When** the user taps the "Chest" category chip, **Then** the list shows only chest exercises.
3. **Given** a filter and search are active, **When** the user clears the search bar, **Then** the category filter alone persists.

---

### Edge Cases

- What happens when the user selects 10+ exercises? The tray maintains a fixed height; the chip row scrolls horizontally so the tray never grows taller or overlaps the browse list.
- What happens when the exercise list is empty (no search results)? An empty state message should appear within the list area, not across the whole screen.
- What happens if the user navigates away without confirming? Selections are discarded and no changes are made to the routine (existing behaviour preserved).

---

## Requirements

### Functional Requirements

- **FR-001**: The exercise browse list MUST always be fully visible and scrollable regardless of how many exercises are currently selected.
- **FR-002**: The layout MUST use a **sticky bottom tray** pattern: the selection summary (chip row + Add button) slides up from the bottom when ≥1 exercise is selected and sits above the tab-bar safe area, never overlapping the browse list above it.
- **FR-003**: Each exercise row MUST show the exercise name, primary muscle(s), equipment tag, an info button (navigates to detail), and a clear selected/unselected state indicator.
- **FR-004**: Users MUST be able to deselect an exercise either by tapping the row again in the browse list or by tapping the remove control in the selection summary.
- **FR-005**: The "Add Exercises" button MUST only be visible and actionable when at least one exercise is selected.
- **FR-006**: Search and body-part category filtering MUST remain available at all times while browsing.
- **FR-007**: The selection summary MUST display the count of currently selected exercises and allow individual removal of selections.
- **FR-008**: The screen MUST provide a clear way to navigate back/cancel without committing any selections.
- **FR-009**: The bottom tray MUST animate into view (slide up, ~200ms ease) when the first exercise is selected, and animate out (slide down) when the last selection is removed.
- **FR-010**: The bottom tray MUST maintain a fixed height at all times; the chip row MUST scroll horizontally to accommodate any number of selections without growing vertically.

### Key Entities

- **Exercise**: A single exercise entry with an ID, name, target muscles, and equipment tags.
- **Selection Buffer**: The transient, in-memory list of exercises the user has marked during this session; discarded on cancel, committed on confirm.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: At any point during selection (1–20 exercises selected), 100% of exercise rows in the browse list are visible and tappable without scrolling past an overlapping element.
- **SC-002**: A user can find, select, review, and confirm 5 exercises in under 60 seconds from opening the selector.
- **SC-003**: Zero layout overlap incidents between the selection summary UI and the browse list across all supported device sizes (SE 3rd gen to Pro Max).
- **SC-004**: Existing search and filter functionality produces identical results before and after the redesign (no regression).

---

## Assumptions

- The redesign applies only to `ExerciseSelectorScreen.tsx`; no underlying store or data logic changes are needed.
- Equipment filter chips (second row) are a secondary filter and will remain as a horizontally scrollable row beneath body-part chips, within the filter area.
- The visual design language (dark theme, accent colour, typography tokens) is inherited from the existing design system and applied consistently.
- "Complete redesign" means restructuring the layout (not a cosmetic tweak) — the selection pile that floats over the list is **removed** and replaced with a non-overlapping pattern.
