# Feature Specification: Set Workout Reps and Weights

**Feature Branch**: `011-set-workout-reps-weights`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "in the workout selector after I create w routine I want to be able to set the reps and weights of the workout after clicking it and before it is added to the pull up bar that shows all the workouts selected"

## Clarifications

### Session 2026-03-16
- Q: What visual format should be used for the configuration prompt? → A: A centered modal/dialog overlay overlaying the workout list.
- Q: What happens if the user taps a workout that is already selected? → A: Remove the workout from the selected list entirely (deselect it).
- Q: What should the initial values be in the configuration fields? → A: Start with "0" for both reps and weights and require the user to change it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Workout Details Upon Selection (Priority: P1)

When a user selects a workout to add to their new routine, they are immediately presented with an interface to set the desired reps and weight for that specific workout. After confirming these details, the workout is then added to the list of selected workouts (the "pull-up bar" view).

**Why this priority**: It is the core requirement requested by the user, ensuring that all workouts in a routine have specific, intended targets for reps and weight.

**Independent Test**: Can be fully tested by selecting a single workout, inputting reps and weight, confirming, and verifying that the workout appears in the selected list with the correct inputted data.

**Acceptance Scenarios**:

1. **Given** the user is viewing the workout selector, **When** they tap a workout, **Then** they are prompted to enter reps and weight before the workout is added.
2. **Given** the reps and weight prompt is open, **When** the user inputs "10" for reps and "50" for weight and confirms, **Then** the workout is added to the selected workouts list displaying "10 reps" and "50 weight".

---

### User Story 2 - Cancel Workout Selection (Priority: P2)

When the user is prompted to enter reps and weight after selecting a workout, they have the option to cancel the operation, which dismisses the prompt and returns them to the workout selector without adding the workout.

**Why this priority**: Users need an escape hatch if they accidentally tap the wrong workout.

**Independent Test**: Can be tested by selecting a workout and immediately cancelling to ensure the selected list does not change.

**Acceptance Scenarios**:

1. **Given** the user is viewing the reps and weight configuration prompt, **When** they tap cancel, **Then** the prompt closes and the workout is not added to the selected workouts list.

---

### Edge Cases

- How does the system handle non-numeric or negative input values?
- What happens if the user backgrounds the app while this prompt is open?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST intercept the default workout selection action to show a centered modal/dialog overlay instead of immediately adding the workout.
- **FR-002**: System MUST allow the user to input numerical values for `reps`.
- **FR-003**: System MUST allow the user to input numerical values for `weight`.
- **FR-004**: System MUST allow the user to confirm the entered details, which then adds the workout to the selected list.
- **FR-005**: System MUST allow the user to dismiss or cancel the configuration prompt without adding the workout.
- **FR-006**: System MUST remove a workout from the selected list if the user taps it again in the workout selection list.
- **FR-007**: System MUST set the initial values for reps and weights to "0" and require valid positive numbers for confirmation.

### Key Entities

- **Pending Workout Selection**: Represents the temporary state of a workout that has been tapped but not yet confirmed with reps and weights.
- **Routine Workout**: The final entity that gets added to the routine, containing the workout reference, reps, and weight.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of workouts added to a new routine through the selector have explicitly set (or confirmed) reps and weights.
- **SC-002**: Users can complete the selection, configuration, and confirmation of a single workout in under 5 seconds.
- **SC-003**: The cancellation rate for the workout configuration prompt is less than 10%, indicating natural user flow.
