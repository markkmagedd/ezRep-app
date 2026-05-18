# Data Model: Profile Photo Upload

## Firestore Schema Update

### Entity: User Profile (`users/{userId}`)

This collection already exists but will be augmented with a new attribute.

| Field Name | Type | Description | Required | Validation |
|------------|------|-------------|----------|------------|
| `profilePhotoUrl` | String | URL to the user's uploaded profile picture stored in Firebase Storage. | No | Must be a valid URL starting with `https://`. When removed, this can be set to `null` or an empty string. |

## Firebase Storage Configuration

We are introducing `Firebase Storage` to handle binary blob storage that Firestore is unsuited for.

### Storage Path

- **Path format**: `users/{userId}/profile.jpg`
- **Naming convention**: Since each user only has one active profile photo at a time, overwriting `profile.jpg` guarantees cleanup of old photos.

### Security Rules (Storage)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allows any authenticated user to read all profile photos
    match /users/{userId}/profile.jpg {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.auth.uid == userId 
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## State Management

### Zustand Store (`useProfileStore`)

The global profile store will reflect the current user's locally updated state synchronously before backend roundtrips.

```typescript
interface ProfileState {
  profilePhotoUrl: string | null;
  // ... existing profile data
  updateProfilePhoto: (localUri: string) => Promise<void>;
  removeProfilePhoto: () => Promise<void>;
}
```
