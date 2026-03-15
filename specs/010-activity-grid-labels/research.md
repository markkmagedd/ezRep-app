# Research & Technical Decisions: Activity Grid Labels

## Context
This is a small UI update to an existing React Native component (`YearlyConsistencyGrid`).

## Findings

1. **Day Labels Implementation**: 
   - Decision: Explicitly map a 7-element array `["M", "T", "W", "T", "F", "S", "S"]` and render a `Text` element for each day.
   - Rationale: The requirement is explicitly to show all 7 days. Calculating positioning is straightforward as we already have grid math set up for the cell size and gaps (`cell + gap` height = 18px).

2. **Month Labels Implementation**:
   - Decision: Include conditional logic when mapping the `weeks` matrix. For each week, check if the current zero-index day's month differs from the previous week's zero-index day's month. If it differs, or if it's the absolute first week, render a month label string.
   - Rationale: Easy to map using standard JS `Date` objects which are already generated for the matrix.

## Needs Clarification Resolutions
- None required. All details fully specified in `spec.md`.
