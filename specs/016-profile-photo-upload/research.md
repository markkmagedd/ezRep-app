# Research: Profile Photo Upload

## Topic 1: Firebase Storage Configuration & Rules

**Decision**: Use Firebase Storage to store user profile images at `users/{userId}/profile.jpg`. Implement Firebase Storage Security Rules to enforce the 5MB size limit and file type (only images).

**Rationale**: Firestore is not meant for storing large binary blobs. Firebase Storage is designed for this. We need to secure it so users can only upload to their own folder:
```text
match /users/{userId}/profile.jpg {
  allow read: if true;
  allow write: if request.auth != null && request.auth.uid == userId 
               && request.resource.size < 5 * 1024 * 1024
               && request.resource.contentType.matches('image/.*');
}
```
This strictly enforces the 5MB limit at the backend level as defined by FR-003, along with permission constraints.

**Alternatives considered**: Base64 encoding the image directly in Firestore. Rejected because it blows up Firestore document size and read costs, and is explicitly against best practices for binary data > 1MB.

---

## Topic 2: Image Selection and Cropping on React Native (Expo)

**Decision**: Use `expo-image-picker` with `allowsEditing: true` and `aspect: [1, 1]` to natively handle selection, camera, and cropping.

**Rationale**: `expo-image-picker` perfectly meets the functional requirements:
- Supports both Photo Library and Camera natively.
- Has a built-in UI for cropping if `allowsEditing: true` is set.
- Allows forcing a 1:1 aspect ratio via `aspect: [1, 1]`.
- Provides the file size via the asset's `fileSize` property to enforce the soft 5MB limit before uploading to Firebase Storage.

**Alternatives considered**: 
- `expo-camera` + custom cropping UI: Rejected as way too much effort when `expo-image-picker` provides a native, robust OS-level UI for both camera and gallery.
- `react-native-image-crop-picker`: Rejected since we are in an Expo managed workflow and `expo-image-picker` is the standard, well-integrated choice.
