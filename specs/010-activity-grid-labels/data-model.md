# Data Model: Activity Grid Labels

## Overview
This feature does not introduce any new data models, entities, or schema changes. It exclusively operates on the existing prop signature of `YearlyConsistencyGrid`:

```typescript
interface YearlyConsistencyGridProps {
  year: number;
  activityData: Record<string, number>;
}
```

No backend or store changes are required.
