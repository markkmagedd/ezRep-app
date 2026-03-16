# Feature Specification: Activity Grid Labels

**Feature Branch**: `010-activity-grid-labels`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "in the activity history we just implemented add the letters of all days not just M W F and also add the months"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Viewing full week day labels (Priority: P1)

As a user viewing my activity history, I want to see labels for every day of the week on the y-axis, so I can easily identify the exact day my activities occurred.

**Why this priority**: This resolves the primary user prompt where day labels were incomplete (only M, W, F).

**Independent Test**: Can be fully tested by opening the activity history view and confirming that seven labels (M, T, W, T, F, S, S) appear starting from the first day of the week.

**Acceptance Scenarios**:

1. **Given** the activity history grid is loaded, **When** I look at the y-axis (row labels), **Then** I see all 7 day initials vertically aligned with their respective rows.

---

### User Story 2 - Viewing month labels (Priority: P2)

As a user viewing my activity history, I want to see month labels above the grid, so I can understand the timeframe of the column data.

**Why this priority**: Adding month labels provides necessary macro-level context for the grid's timeline, fulfilling the second part of the user request.

**Independent Test**: Can be fully tested by opening the activity history view and verifying that month abbreviations (e.g., Jan, Feb) appear above the columns that correspond to the start of those months.

**Acceptance Scenarios**:

1. **Given** the activity history grid is loaded covering multiple months, **When** I look at the top x-axis, **Then** month labels appear aligned with the column of the first week of that month.

---

### Edge Cases

- What happens when a month begins in the middle of a week? The label should align with the column containing the first days of that month, minimizing visual overlap with adjacent month labels.
- How does the system handle very narrow screens? The day and month labels should remain visible and not squish the grid excessively, ensuring text is readable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The activity grid y-axis MUST display exactly seven day labels, representing each day of the week.
- **FR-002**: The activity grid x-axis (top) MUST display month names or abbreviations corresponding to the starting week of each month within the visible range.
- **FR-003**: The implementation MUST maintain existing grid interaction and cell alignment without breaking the layout.

### Assumptions and Dependencies

- **Assumption 1**: The application currently has access to the starting day of the week preference (e.g., Sunday vs Monday) or defaults to a standard system setting.
- **Dependency 1**: Requires the existing activity grid component to support layout modifications for additional row/column spaces without breaking underlying data mapping.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of visible calendar weeks in the activity grid are perfectly aligned with the day row labels (M, T, W, T, F, S, S).
- **SC-002**: Month labels are visible above the grid on mobile without requiring horizontal scrolling if the grid spans a timeframe designed to fit on screen.
- **SC-003**: Users can easily read the labels without layout shifts or text overlapping in the activity history component.
