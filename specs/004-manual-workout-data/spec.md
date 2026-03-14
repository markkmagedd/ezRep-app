# Feature Specification: Manual Workout Data

**Feature Branch**: `004-manual-workout-data`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: User description: "I want you to remove the apininja we added in the last spec and revert back to the written data of the workouts without using any api and for references here is the way I want the excercises to be written manually..."

## Clarifications

### Session 2026-03-12
- Q: Asset Fallback Strategy → A: Hide the image/video section entirely for that exercise.
- Q: Initial Library Scope → A: 50-100 exercises including common variations.
- Q: Search Depth → A: Search through name, keywords, and muscle lists.
- Q: Data Loading Performance → A: Use an in-memory search index for faster results.
- Q: Data Integrity → A: Discard and log error for invalid exercise entries.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Local Exercise Discovery (Priority: P1)

As a gym user, I want to browse and search for exercises from a built-in library so that I can find workouts quickly even without an internet connection.

**Why this priority**: Core functionality of the app depends on users being able to find exercises. Reliability is improved by removing external API dependencies.

**Independent Test**: Can be fully tested by disabling network connectivity and searching for "Bench Press" in the exercise list, verifying it appears with full details.

**Acceptance Scenarios**:

1. **Given** the app is in offline mode, **When** the user opens the exercise selector, **Then** a comprehensive list of pre-defined exercises is displayed.
2. **Given** the user is searching for an exercise, **When** they type "Pec Deck", **Then** the "Lever Pec Deck Fly" appears in the results with its full manual data.

---

### User Story 2 - Detailed Exercise Information (Priority: P2)

As a gym user, I want to view detailed instructions, target muscles, and videos for each exercise so that I can perform the movements with correct form.

**Why this priority**: High-quality static data ensures consistency in the information provided to the user, improving safety and training effectiveness.

**Independent Test**: Can be fully tested by selecting an exercise and verifying all fields (instructions, target muscles, overview, etc.) match the specified JSON structure.

**Acceptance Scenarios**:

1. **Given** a selected exercise, **When** the user views the details page, **Then** the system displays the overview, step-by-step instructions, and exercise tips provided in the manual data.

---

### User Story 3 - Muscle Group Filtering (Priority: P3)

As a gym user, I want to filter exercises by muscle group and equipment so that I can plan my workout based on the tools and target areas I have available.

**Why this priority**: Organizing the manual data by muscle groups and equipment makes the library searchable and useful for different gym setups.

**Independent Test**: Can be fully tested by selecting "CHEST" as a body part filter and verifying only chest-related exercises are shown.

**Acceptance Scenarios**:

1. **Given** the exercise list, **When** the user filters by "CHEST", **Then** only exercises with "CHEST" in their `bodyParts` list are displayed.

---

## Edge Cases

- **Missing Assets**: If a specific `imageUrl` or `videoUrl` defined in the manual data is missing from the local storage, the system MUST hide the corresponding image or video section in the UI entirely.
- **Data Integrity**: During initialization, the system MUST validate each exercise entry; if mandatory fields (e.g., `exerciseId`, `name`) are missing, the entry MUST be discarded from the in-memory index and an error logged.
- **Performance**: Does the exercise list remain responsive when searching through a large set of manual exercise data?

## Assumptions

- **Data Availability**: It is assumed that the project has a mechanism for storing and loading structured local data (e.g., within the app bundle).
- **Asset Storage**: It is assumed that images and videos referenced in the data will be added to the project's assets independently or as part of this implementation.
- **Language**: Manual data will be provided in English as per the reference example.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove all dependencies on external workout APIs for exercise discovery and details.
- **FR-002**: System MUST retrieve exercise data from a local, structured data source.
- **FR-003**: Each exercise record MUST strictly follow the provided data schema (Id, Name, Image, Equipment, BodyParts, Muscles, Overview, Instructions, Tips, Variations, RelatedIds).
- **FR-004**: System MUST include a library of 50-100 exercises covering all major muscle groups and common variations defined in the project.
- **FR-005**: System MUST allow searching by exercise name, keywords, and muscle lists defined in the exercise data.
- **FR-006**: System MUST support filtering by body part and equipment type.

### Key Entities

- **Exercise**: The core data object representing a workout movement. Key attributes: `exerciseId`, `name`, `bodyParts`, `targetMuscles`, `instructions`.
- **Muscle Group**: A category used for organizing and filtering exercises (e.g., "CHEST", "BACK").
- **Equipment**: The tools required for an exercise (e.g., "DUMBBELL", "LEVERAGE MACHINE").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of exercises are loaded from local data with zero external network requests during discovery.
- **SC-002**: The system MUST utilize an in-memory search index to ensure exercise search results return in under 100ms on standard mobile devices.
- **SC-003**: All exercises in the provided library have valid, non-empty fields for `instructions` and `targetMuscles`.
- **SC-004**: The app package size increase due to local data and assets is documented and within project limits.
