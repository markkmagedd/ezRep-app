# Feature Specification: Fix PR Spotlight

**Feature Branch**: `014-fix-pr-spotlight`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "I want you to make sure that the best pr spotlight card in the homescreen shows the real heaviest pull not just a placeholder text"

## Clarifications
### Session 2026-03-16
- Q: Tie-breaking behavior for identical PR weights → A: Option A (Show the most recently performed lift of that weight.)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View All-Time Personal Best on Home Screen (Priority: P1)

As a user, I want to see my actual, all-time heaviest lift in the Personal Best Spotlight card on the Home screen, rather than placeholder text or a PR limited to only recent workouts, so that I can feel motivated by my actual top achievement.

**Why this priority**: Focuses on resolving the core user complaint—that the PR card sometimes displays placeholder text because the true Heaviest Lift is not being retrieved.

**Independent Test**: Can be independently tested by logging a workout with a heavy set in the distant past (e.g., 6 months ago), ensuring it does not appear in "recent workouts" but does successfully appear in the PR Spotlight card on the Home screen.

**Acceptance Scenarios**:

1. **Given** a user with no logged workouts, **When** they view the Home screen, **Then** the Personal Best Spotlight card should show an appropriate placeholder ("No PRs yet").
2. **Given** a user has multiple logged sets across their entire history (not just recent ones), **When** they view the Home screen, **Then** the card displays the strictly heaviest `weight_kg` and the associated `exercise_name` from their entire history without showing placeholder text.
3. **Given** a user creates a new workout with a weight higher than their current PR, **When** they return to the Home screen, **Then** the PR Spotlight card updates to show this new heaviest lift.

---

### Edge Cases

- What happens when the user has completed workouts but none of the sets have a `weight_kg` logged (e.g. only reps or duration)?
- For tie-breaking when the user has multiple lifts with the exact same maximum weight, the system must display the most recently performed lift of that weight.

### Dependencies and Assumptions

- **Assumptions**: We assume the data source query can be optimized so that determining the all-time PR does not severely degrade Home screen load time.
- **Dependencies**: Depends on the workout/set history available within the user's data storage to determine the maximum load.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST query the user's entire workout history (or all completed sets) to determine the absolute highest `weight_kg` lifted, regardless of how long ago the workout occurred.
- **FR-002**: If multiple lifts share the absolute highest `weight_kg`, the system MUST return the lift that was performed most recently.
- **FR-003**: The Home screen MUST display the `weight_kg` and the `exercise_name` of this maximum lift inside the Personal Best Spotlight card.
- **FR-004**: The system MUST gracefully fallback to the placeholder "No PRs yet" only when the user has zero completed sets with a valid weight.
- **FR-005**: The system MUST update the PR spotlight efficiently (e.g. recalculating only when necessary or by efficiently querying the datastore).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users with historical data correctly see their heaviest lift on the Home screen 100% of the time, avoiding unwarranted placeholder text.
- **SC-002**: The home screen loads without noticeable delay (under 1 second) even when scanning the entire lift history for the PR.
- **SC-003**: The PR spotlight correctly updates immediately after a user logs a new, heavier lift.
