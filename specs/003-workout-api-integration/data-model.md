# Data Model: Workout API Integration

## Entities

### `Exercise`
Represents an individual workout exercise, sourced from API Ninjas and cached in Firebase Firestore.

**Attributes**:
- `id` (string): Unique identifier, deterministically generated from the exercise `name` (e.g., lowercase, spaces replaced with hyphens) to ensure idempotency when saving to the cache.
- `name` (string): The name of the exercise (e.g., "Incline Hammer Curls").
- `muscle` (string): The primary muscle targeted. If the API returns an empty or unrecognized value, this should be mapped to `"other"`.
- `equipment` (string): Equipment needed (e.g., "dumbbell").
- `difficulty` (string): Difficulty level (e.g., "beginner").
- `instructions` (string): Step-by-step instructions for the exercise.

**Relationships**:
- None strict. These exercises will be referenced by ID or embedded in User `Routine` documents elsewhere in the system.

**State Transitions**:
- Read-only for the end user.
- Created/Updated in Firestore only via the caching mechanism when the client fetches a new page from the external API.
