# Feature Specification: Routine Workout Reps & Sets Selection

**Feature Branch**: `012-routine-reps-sets`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "I dont want to select the weight while selecting a workout while selecting a routine instead I want the user to be able to select reps and sets"

## Clarifications

### Session 2026-03-16

- Q: What should the initial values for Sets and Reps be in the configuration modal? → A: Use sensible defaults (e.g., 3 sets, 10 reps).
- Q: How should the system respond to 0 or empty inputs for Sets and Reps? → A: Prevent saving and display a validation error message.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Selecting Reps and Sets for Routine Workout (Priority: P1)

When a user is configuring a routine and selects a workout to add to it, they need to be able to specify the target number of sets and reps for that specific workout within the context of the routine, without being required to specify a weight.

**Why this priority**: It is the core requirement of the feature, ensuring users can define the volume of a routine workout without being bound to a specific weight, which often varies per session.

**Independent Test**: Can be independently tested by creating or editing a routine, picking a workout to add, and verifying that the modal prompts for "Sets" and "Reps" instead of "Weight".

**Acceptance Scenarios**:

1. **Given** a user is creating or editing a routine and selects a workout to add, **When** the configuration modal appears, **Then** the user is prompted to enter "Sets" and "Reps" values instead of "Weight" or other metrics.
2. **Given** the user has entered valid Sets and Reps, **When** they confirm the addition to the routine, **Then** the workout is added to the routine with the specified Sets and Reps targets.
3. **Given** the user is viewing the routine details, **When** they look at the added workout, **Then** they see the configured Sets and Reps.

---

### Edge Cases

- User enters `0` for sets or reps: System prevents saving and shows validation error.
- User leaves the inputs empty: System prevents saving and shows validation error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST prompt the user for "Sets" when adding a workout to a routine.
- **FR-002**: System MUST prompt the user for "Reps" when adding a workout to a routine.
- **FR-003**: System MUST NOT prompt the user for "Weight" when adding a workout to a routine.
- **FR-004**: System MUST store the configured target "Sets" and "Reps" associated with the workout within that specific routine.
- **FR-005**: System MUST display the configured "Sets" and "Reps" on the routine details/summary view.
- **FR-006**: System MUST validate that Sets and Reps inputs are positive integers.
- **FR-007**: System MUST prepopulate the inputs with default values (e.g., 3 sets, 10 reps) when adding a new workout.

### Key Entities *(include if feature involves data)*

- **Routine Workout**: Represents a generic workout added to a specific routine. Needs attributes for target `sets` and target `reps`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of newly added workouts to a routine successfully capture target sets and reps instead of weight.
- **SC-002**: Users can successfully add a workout with sets and reps to a routine in under 30 seconds.
- **SC-003**: The user interface restricts input to only sets and reps during this flow, with no visible weight fields.
