# Quickstart: Profile Photo Upload Implementation

## 1. Setup Environment
First, you'll need `expo-image-picker` to handle device camera/library streams natively in Expo managed workflow.
```bash
npx expo install expo-image-picker
```
No additional dependencies are needed for image manipulation provided you utilize `allowsEditing: true` and `aspect: [1,1]` in the picker's arguments.

## 2. Firebase Storage Rules
Before touching the codebase, update the `storage.rules` (create one next to `firestore.rules` if it doesn't exist) to enforce our size/format requirements natively at the Google Cloud layer.

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/profile.jpg {
      allow read: if request.auth != null;
      allow write: if request.auth == userId && request.resource.size < 5 * 1024 * 1024;
      allow delete: if request.auth == userId;
    }
  }
}
```

## 3. UI Implementation
- Update the Profile Screen (`src/screens/profile/ProfileScreen.tsx`) to make the avatar an interactable element using `TouchableOpacity` or a native feedback wrapper.
- Utilize the "Dark Gym" themed Action Sheet (or custom modal) to prompt "Take Photo", "Choose from Library", and "Remove Photo".

## 4. State
Update your `Zustand` store for profiles (`src/stores/profileStore.ts`) to manage optimistic UI updates. When a user picks a photo, immediately render their `localUri` while asynchronously starting the Firebase Storage upload. Upon successful upload, save the download URL to the Firestore `/users/{uid}` document, and handle error rollbacks if necessary.
