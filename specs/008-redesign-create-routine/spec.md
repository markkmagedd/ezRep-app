# Feature Specification: Redesign Create Routine Screen

**Feature Branch**: `008-redesign-create-routine`  
**Created**: 2026-03-13  
**Status**: Draft  
**Input**: User description: "i want a complete redesign to the create routine screen because it has many unwanted spaces and also the problem is whenever I select exercises the exercises keeps piling up and it covers the whole screen What I want to do is the user keeps choosing workouts and the workouts is added to a bar on the bottom that says exercises chosen and for the user to check which exercises are chosen and to be able to remove exercises"

## Clarifications

### Session 2026-03-13
- Q: How should the bottom bar physical display the detailed list without covering the screen? → A: Expandable bottom sheet/panel that slides up to show a vertical list and swipes back down.
- Q: Where should the main "Create Routine" button be located? → A: Always visible below the collapsed summary, ensuring no extra taps to finish.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add and Manage Exercises via Bottom Bar (Priority: P1)

Users browsing for exercises to add to their routine need a way to keep track of what they have selected without losing their place in the exercise list. They need to see a summary, review selections, and remove items easily.

**Why this priority**: Resolves the core usability bug where selected exercises pile up and block the screen, preventing users from creating their routine effectively.

**Independent Test**: Can be fully tested by selecting multiple exercises and verifying that a bottom bar appears, updates its count, allows reviewing the selections, and allows removing them—all without covering the main exercise browsing list.

**Acceptance Scenarios**:

1. **Given** the user is on the create routine screen, **When** they select an exercise, **Then** it gets added to a bottom bar that indicates the number of chosen exercises (e.g., "1 exercise chosen").
2. **Given** the user has chosen multiple exercises, **When** they interact with the bottom bar, **Then** they can see the specific list of exercises they have chosen.
3. **Given** the user is viewing their chosen exercises, **When** they tap to remove an exercise, **Then** the exercise is removed from the selection and the count updates.
4. **Given** the user has added many (e.g., 10+) exercises, **When** they look at the screen, **Then** the main list of available exercises remains scrollable and fully accessible without being covered.

---

### User Story 2 - Clean and Consistent Layout (Priority: P2)

Users need a visually clean interface without awkward, unintended empty spaces between search inputs, filters, and lists so the app feels high-quality and easy to parse.

**Why this priority**: Fixes the reported "unwanted spaces" and improves the overall visual quality of the routine creation flow.

**Independent Test**: Can be fully tested by navigating to the screen and observing the layout margins and padding between the search bar, filter chips, and exercise list.

**Acceptance Scenarios**:

1. **Given** the user navigates to the create routine screen, **When** the page loads, **Then** there are no unusually large or unintended gaps between the search bar, filter chips, and the list of exercises.

### Edge Cases

- What happens when the user removes all chosen exercises? (The bottom bar should disappear or return to an empty state).
- How does the system handle selecting the exact same exercise twice? (Usually not allowed or shows a visual indication that it's already added).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display the exercise search bar, filters, and exercise list with consistent, minimal spacing (eliminating large unwanted gaps).
- **FR-002**: System MUST display a dedicated bottom bar or tray summarizing the current selection (e.g., "X exercises chosen") when at least one exercise is selected.
- **FR-003**: System MUST constrain the height of the chosen exercises area so that it never covers the entire screen, ensuring the main exercise catalog remains visible and scrollable.
- **FR-004**: System MUST allow users to view the detailed list of their chosen exercises by expanding the bottom bar into a half-screen or modal sheet that slides up over the catalog.
- **FR-005**: System MUST allow users to remove an exercise directly from the chosen exercise list.
- **FR-006**: System MUST prominently display a "Create Routine" (finish) button that is always sticky and visible beneath the selection summary or sheet.

### Key Entities

- **Draft Routine**: The routine currently being built.
- **Draft Day**: A specific day within the draft routine.
- **Draft Exercise**: An exercise selected for a specific draft day, including its target sets and reps.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select 15+ exercises and still view and interact with the main exercise catalog without the screen being blocked.
- **SC-002**: Users can view their chosen exercises and remove an item with no more than 1-2 taps from the bottom bar.
- **SC-003**: Visual inspection confirms consistent vertical spacing between search, filters, and the list, with no unexplained gaps.
