# Feature Specification: Fix Workout Selector UI and Selection Logic

**Feature Branch**: `006-fix-workout-selector-ui`  
**Created**: 2026-03-13  
**Status**: Draft  
**Input**: User description: "the workout selector screen is not the design I am looking for the filters above have weird spaced beneath them the pile that is formed from selecting many workouts lead to covering the whole screen which looks so bad"

## User Scenarios & Testing *(mandatory)*

## Clarifications

### Session 2026-03-13
- Q: Should the "pile" of selected workouts be removable directly from the selector screen? → A: Fully Interactive: Tapping a chip in the pile removes the exercise immediately.
- Q: Should the "selection pile" be a horizontal scrollable row or a vertical wrapping list? → A: Horizontal Scroll: A single row of chips that scrolls horizontally, never growing vertically.
- Q: Where should the horizontal selection pile be placed in the layout? → A: Below Search: Between the search bar and the top of the exercise list.
- Q: Should the selection pile bar be visible when no exercises are selected? → A: Completely Hide: The bar is not rendered when the selection is empty.
- Q: Should the "Confirm" button be always visible, or should it only appear once exercises are selected? → A: Conditional: Only show the "Add (X) Exercises" button after at least one selection is made.

### User Story 1 - Clean Filter Layout (Priority: P1)

As a gym user, I want to browse exercises with a clean and professional layout, so that the interface feels modern and easy to navigate.

**Why this priority**: Correcting basic layout and spacing issues is fundamental to user trust and a "premium" app feel.

**Independent Test**: Can be fully tested by opening the Exercise Selector and visually confirming the spacing between filters and the exercise list matches the design system.

**Acceptance Scenarios**:

1. **Given** the Exercise Selector screen is open, **When** the user views the filter chips, **Then** there is consistent vertical padding (e.g., 16dp) between the filters and the search bar/list.
2. **Given** a specific muscle group is selected, **When** the list updates, **Then** the filter bar remains fixed with no "jumpy" spacing or awkward gaps.

---

### User Story 2 - Managed Selection Pile (Priority: P1)

As a gym user, I want to select multiple exercises without the list of selected items obstructing my ability to find more exercises, so that I can efficiently build my routine.

**Why this priority**: A UI that covers the primary action area (the search/list) is a critical usability failure that prevents the user from completing their task.

**Independent Test**: Can be fully tested by selecting 10+ exercises and verifying that the search bar and exercise library list remain visible and interactable.

**Acceptance Scenarios**:

1. **Given** the user has selected multiple exercises, **When** the "pile" grows, **Then** the selection area uses a single-row horizontal scrollable bar to keep the main list visible.
2. **Given** the selection area is visible, **When** the user taps a "confirm" or "add" button, **Then** the exercises are added to the workout without the selection UI ever growing vertically or obstructing the list.

---

### Edge Cases

- What happens when the user selects so many exercises that even a "collapsed" view would be crowded?
- How does the UI behave on small-screen devices (e.g., iPhone SE) vs. large tablets?
- Should the "pile" of selected workouts be removable directly from the selector screen, or is it a view-only summary? → **Resolved**: Tapping a chip in the pile removes it immediately.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide consistent vertical spacing between the category filters and the exercise search bar.
- **FR-002**: System MUST place the "selected exercises" area directly below the exercise search bar and above the exercise library list. This area MUST only be visible when at least one exercise is selected.
- **FR-003**: The "selected exercises" area MUST be a horizontal scrollable bar that never exceeds the height of a single chip row, ensuring maximum screen space remains dedicated to the exercise library list.
- **FR-004**: System MUST allow users to deselect an exercise directly by tapping its chip in the "selection pile" to quickly correct mistakes.
- **FR-005**: UI MUST follow the "Dark Gym" aesthetic with high-contrast borders and subtle shadows for the selection chips.
- **FR-006**: System MUST only display the "Add (X) Exercises" confirmation button at the bottom of the screen once at least one exercise has been selected.

### Key Entities *(include if feature involves data)*

- **SelectionBuffer**: A temporary list of `ExerciseRecord` objects picked by the user before they are formally committed to the workout routine.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select up to 20 exercises while maintaining full visibility of the search bar.
- **SC-002**: 100% of testers agree that the vertical spacing in the filter section looks intentional and professional.
- **SC-003**: The "Selection Pile" never occupies more than 30% of the total screen height on standard mobile devices.
