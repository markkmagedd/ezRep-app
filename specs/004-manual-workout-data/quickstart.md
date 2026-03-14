# Quickstart: Manual Workout Data

## Overview
Replaces external exercise API dependency with a local static library and search index.

## Prerequisites
- Static exercise data in `src/constants/exercises.ts`.
- Valid `exerciseId`, `name`, and `bodyParts` for all entries.

## Setup Steps
1. **Initialize Store**: `exerciseStore` will load `EXERCISE_LIBRARY` and build the search index.
2. **Indexing Strategy**: Each exercise is concatenated into a normalized search string including name, keywords, and muscles.
3. **Search UI**: `ExerciseSelectorScreen` must use `exerciseStore` search functions for <100ms results.
4. **Resilient UI**: Use conditional rendering for images/videos. Hide sections if local assets are missing.

## Testing Verification
- **Search Latency**: Measure `RegExp.test()` execution on mobile devices.
- **Offline Integrity**: Disable Airplane mode; verify full search/details accessibility.
- **Validation Logging**: Check logs for discarded invalid exercise entries.
