# Navigation Contract

In order to access the newly created PR Spotlight Screen without throwing navigation type errors, the navigation parameter list (`types.ts`) MUST be updated:

```typescript
// Add to both applicable stack types...
export type HomeStackParamList = {
  // existing routes...
  PRSpotlight: undefined;
};

export type ProfileStackParamList = {
  // existing routes...
  PRSpotlight: undefined;
};
```
