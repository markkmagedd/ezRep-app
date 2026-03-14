# Data Model: Manual Workout Data

## Entities

### Exercise

The core record for local exercise discovery. Replaces the API Ninja model.

| Field | Type | Mandatory? | Description |
|-------|------|------------|-------------|
| `exerciseId` | `string` | **Yes** | Unique UUID or slug |
| `name` | `string` | **Yes** | Display name |
| `imageUrl` | `string` | No | Local asset name or path |
| `videoUrl` | `string` | No | Local asset name or path |
| `equipments` | `string[]`| No | Required tools (e.g. DUMBBELL) |
| `bodyParts` | `string[]`| **Yes** | Target regions (e.g. CHEST) |
| `gender` | `string` | No | Target gender (male/female/unisex) |
| `exerciseType` | `string` | No | (e.g. STRENGTH) |
| `targetMuscles` | `string[]`| **Yes** | Specific primary muscles |
| `secondaryMuscles`| `string[]`| No | Secondary muscles |
| `keywords` | `string[]`| No | Alias terms for search indexing |
| `overview` | `string` | No | Narrative description |
| `instructions` | `string[]`| **Yes** | Performance steps |
| `exerciseTips` | `string[]`| No | Safety/Form advice |
| `variations` | `string[]`| No | Related exercise names/ids |
| `relatedIds` | `string[]`| No | Cross-navigation links |

## State Transitions

### Search Index State (In-Memory)
1. **Bootstrap**: On store init, `EXERCISE_LIBRARY` is filtered for validity.
2. **Indexing**: Each valid exercise is concatenated into a single lowercase `searchString`.
3. **Querying**: Input text is normalized and tested against `searchString` using a regex.
4. **Filtering**: If `bodyPart` or `equipment` filters are active, they are applied post-regex search.

## Validation Rules
- **Discard & Log**: Any entry missing `exerciseId`, `name`, or `bodyParts` must be omitted from the search index and logged.
- **Asset Integrity**: Images/Videos must be verified at render-time.
