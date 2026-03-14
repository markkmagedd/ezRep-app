# Quickstart: Workout API Integration

## Testing the API Ninjas Integration

This integration utilizes API Ninjas for fetching exercise data and Firebase Firestore for centralized caching.

### Prerequisites

1. An API Key from API Ninjas (sign up for free at `api-ninjas.com`).
2. The API key must be configured in your local environment file (e.g., `.env` or `app.config.js`).
3. Firebase emulator or active Firebase project initialized so that Firestore requests can be processed.

### Validating the Flow

1. **Clear local cache/emulator**: Ensure your Firestore `exercises` collection is empty.
2. **Search for a specific muscle** (e.g., "biceps"):
   - The app should query Firestore, find 0 results.
   - The app makes a request to `https://api.api-ninjas.com/v1/exercises?muscle=biceps&offset=0`.
   - The app receives the results, writes them to Firestore, and renders the UI.
3. **Verify caching**:
   - Reload the app.
   - Search for "biceps" again.
   - The app should instantly load the results directly from Firestore *without* hitting the API Ninjas endpoint.
4. **Infinite Scrolling**:
   - Scroll to the bottom of the "biceps" list.
   - The app should automatically ping API Ninjas with `offset=10` (or your page size), save *those* new results to Firestore, and append them to the UI.
