# Research: Manual Workout Data Implementation

## Decision: Simple Regex-based In-memory Index
**Rationale**: 
- For a library of 50-100 items, `Fuse.js` adds unnecessary overhead. 
- A custom in-memory index created at startup will map exercise IDs to a pre-normalized "search string" (concatenating name, keywords, and muscle lists). 
- Using `RegExp` with `.test()` provides extremely low latency (<10ms) while fulfilling SC-002 and Question 4 choice.

## Decision: Lightweight Validation at Store Initialization
**Rationale**: 
- During `exerciseStore` initialization, the system will iterate over the static `EXERCISE_LIBRARY`. 
- Valid entries must have non-empty `exerciseId` and `name`. 
- Malformed entries will be logged and omitted from the state to prevent UI crashes, fulfilling Question 5 choice.

## Decision: Conditional Rendering for Asset Fallback
**Rationale**: 
- In React Native, checking if a local file exists via `expo-file-system` for bundled assets is asynchronous and complex. 
- Instead, we will wrap image/video renders in components that attempt to resolve the asset. If the resolution returns `null` or an error, we hide the section entirely, fulfilling the Asset Fallback strategy.

## Alternatives Considered:
- **Fuse.js**: Rejected because simple substring/regex search is faster and simpler for this volume.
- **SQLite/WatermelonDB**: Rejected because static data is small enough for in-memory constants and doesn't require database management.
