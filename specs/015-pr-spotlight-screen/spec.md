# Feature Specification: PR Spotlight Screen

**Feature Branch**: `015-pr-spotlight-screen`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "I want you to make the pr spotlight card in the homescreen clickable so that it shows a screen that have a list of the heaviest lift in all workouts also this screen I want it to be accessed from the profile screen"

## Clarifications
### Session 2026-03-16
- Q: Which specific details should be visible for each PR in the "Heaviest Lifts" list? → A: Option B: Display exercise name, maximum weight, and the date it was achieved.
- Q: How should the PRs be sorted or grouped in the list? → A: Option A: Sort simply alphabetically by exercise name.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View PR List from Home Screen (Priority: P1)

Users want to tap the "PR Spotlight" card on the Home Screen to navigate to a detailed list of their heaviest lifts.

**Why this priority**: The Home Screen is the primary landing area, and providing immediate access to personal records through the existing card provides high value and motivation.

**Independent Test**: Can be fully tested by tapping the PR spotlight card and verifying that it navigates to the new screen containing the correct PR data.

**Acceptance Scenarios**:

1. **Given** the user is on the Home Screen, **When** they tap the PR Spotlight card, **Then** they are navigated to the "Heaviest Lifts" screen.
2. **Given** the user navigates to the Heaviest Lifts screen, **When** the screen loads, **Then** a list of all historical heaviest lifts (by exercise) is displayed.

---

### User Story 2 - View PR List from Profile Screen (Priority: P2)

Users want to access the "Heaviest Lifts" screen from their Profile screen.

**Why this priority**: The Profile screen acts as a central hub for user statistics and historical data, making it a logical permanent home for accessing PRs.

**Independent Test**: Can be fully tested by navigating to the Profile screen, tapping the new entry point, and verifying navigation.

**Acceptance Scenarios**:

1. **Given** the user is on the Profile Screen, **When** they tap the option for "Heaviest Lifts" (or similar), **Then** they are navigated to the "Heaviest Lifts" screen.

---

### Edge Cases

- What happens when the user has no recorded workouts or PRs? The screen should display an encouraging empty state ("No PRs yet. Keep lifting!").
- What happens if the data takes a moment to calculate/load? The system should display a loading indicator instead of freezing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST make the existing "PR Spotlight" card on the Home Screen tappable.
- **FR-002**: System MUST navigate the user to a dedicated "Heaviest Lifts" screen upon tapping the Home Screen card.
- **FR-003**: System MUST provide an intuitive entry point (e.g., button, list tile) on the Profile Screen to access the "Heaviest Lifts" screen.
- **FR-004**: System MUST display a consolidated list of the user's heaviest lifts (maximum weight) for each exercise they have ever performed across all workouts, alongside the date the record was achieved. The list MUST be sorted alphabetically by exercise name.
- **FR-005**: System MUST display an empty state message if the user has no recorded PRs.

### Key Entities *(include if feature involves data)*

- **Exercise PR**: Represents the heaviest logged weight for a specific exercise across the user's entire workout history. It includes the exercise name, the maximum weight lifted, and the date the record was achieved.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of tested users can successfully navigate to the "Heaviest Lifts" screen from both the Home and Profile screens.
- **SC-002**: The "Heaviest Lifts" screen loads the complete list of PRs in under 1 second.
- **SC-003**: Users without any logged workouts receive a clear empty state rather than a blank screen or error.
