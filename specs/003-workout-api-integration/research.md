# Phase 0: Outline & Research

## Research 1: API Ninjas Exercises API Capabilities
- **Decision**: Use `https://api.api-ninjas.com/v1/exercises` endpoint with `muscle`, `name`, and `offset` parameters.
- **Rationale**: The API naturally supports pagination via the `offset` parameter, which makes our infinite scrolling requirement (FR-007) straightforward to implement. It also directly supports filtering by `muscle` and searching by `name`.
- **Alternatives considered**: Scraping or looking for other open source JSON datasets (rejected because API Ninjas provides a structured, queryable REST API out of the box).

## Research 2: Centralized Cache Strategy in Firestore
- **Decision**: Store individual exercise documents in an `exercises` Firestore collection. When a user queries for a muscle group or name, the client first queries Firestore (ordered by name, with limit). If the number of returned documents is less than the requested limit (e.g., 10), the client fetches the next batch from the API using the relevant `offset`, writes the new records to Firestore, and then displays them.
- **Rationale**: This allows all users to organically build the centralized cache. Over time, the most common queries will be entirely served from Firestore, drastically reducing API hits. Firestore's native pagination (`startAfter`, `limit`) maps well to the API's `offset` approach. 
- **Alternatives considered**: Caching entire API response payloads as single documents (rejected because it makes granular searching and infinite scrolling difficult to manage within Firestore).
