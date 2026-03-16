# Feature Specification: Yearly Consistency Grid

**Feature Branch**: `009-yearly-consistency-grid`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "I want the grid consistency to be clickable and when the user clicks it it opens a bigger gridconsistency looking like github one that shows all th workouts accross the last years. Also in the activity history we just implemented add the letters of all days not just M W F and also add the months"

## Clarifications

### Session 2026-03-14
- Q: When opening the Yearly Consistency grid, are the individual day boxes interactive (e.g. clicking a box opens that day's history)? → A: View Only: The boxes are not clickable. The grid is purely a visual dashboard.
- Q: How should the user navigate between different years of history? → A: Year Tabs. Show exactly one calendar year at a time, but only display year selectors/tabs for years where the user has completed at least one workout.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigating to Full Year View (Priority: P1)

As a user, I want to tap the small consistency grid on the Home screen to view my entire training history for the past year.

**Why this priority**: It establishes the entry point and navigation pathway bridging the quick-glance dashboard widget to the deep-dive historical view.

**Independent Test**: Can be fully tested by tapping the home widget and verifying a navigation transition occurs to the new yearly view screen.

**Acceptance Scenarios**:

1. **Given** the user is viewing the Home screen dashboard, **When** they tap on the existing 4-week Consistency Grid, **Then** they are navigated to a new "Yearly Consistency" screen.

---

### User Story 2 - Viewing and Navigating the Yearly Contribution Graph (Priority: P2)

As a user, I want to see a full GitHub-style grid displaying all my workouts for a specific calendar year, and be able to easily switch between past years, so I can visualize long-term dedication across my entire app history.

**Why this priority**: Opening the screen is useless without the actual data breakdown. This is the core visual value-add of the feature.

**Independent Test**: Can be fully tested by loading the Yearly Consistency screen directly and visually verifying that a year's worth of cells are rendered and correctly colored based on mock or real workout history.

**Acceptance Scenarios**:

1. **Given** the user is on the Yearly Consistency screen, **When** the page renders, **Then** a grid containing cells for the past 365 days is displayed.
2. **Given** the user has logged workouts on specific dates, **When** those cells are rendered in the grid, **Then** they are visually highlighted (colored in) while resting days remain faint/empty.
3. **Given** the user has workout data spanning multiple years, **When** they view the screen, **Then** they see tabs/buttons to switch between the active years.
4. **Given** the user has no workouts logged in a specific year (e.g. 2023), **When** they view the year selectors, **Then** that year is absent from the available options.

### Edge Cases

- What happens if the user just installed the app and has only 1 day of historical data? (Grid still shows the current year but only 1 is filled; no other year tabs appear).
- How does the system handle leap years (366 days instead of 365)?
- What happens if the user deletes their only workout in a past year? (The tab for that year should dynamically disappear).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST make the existing Home Screen consistency grid an interactive, tappable element.
- **FR-002**: System MUST navigate the user to a dedicated "Yearly Consistency" view when the home grid is tapped.
- **FR-003**: System MUST fetch and consolidate workout history for the currently selected calendar year.
- **FR-004**: System MUST display a grid structure with columns typically representing weeks and rows representing days of the week for the selected year.
- **FR-005**: System MUST visually distinguish between days where a workout occurred and days with no activity.
- **FR-006**: System MUST dynamically render year-switching tabs/buttons ONLY for years where the user has logged at least one workout.
- **FR-007**: Individual boxes within the Yearly Consistency view MUST be view-only and non-interactive.
- **FR-008**: System MUST display labels for all days of the week (M, T, W, T, F, S, S) along the grid.
- **FR-009**: System MUST display month labels (Jan, Feb, Mar, etc.) above the grid columns corresponding to the start of each month.

### Key Entities 

- **Workout History Record**: An aggregation representing dates on which one or more workouts were completed. Needs to quickly output simple Boolean states (Workout occurred: True/False) or intensity scales for the grid cells.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully access the yearly view in exactly 1 tap from the home screen.
- **SC-002**: The yearly grid layout renders 365 days of data smoothly with no noticeable frame-drops or lag on load.
- **SC-003**: The visual grid accurately reflects the user's historical workout logs with 100% precision.
- **SC-004**: The touch targets/cells in the yearly view remain visually clear and maintain a proportional size (no microscopic boxes on small screens).
