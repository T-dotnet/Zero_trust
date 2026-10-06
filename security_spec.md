# Security Specification: Ready Validator v5

## 1. Data Invariants
- Features, User Stories, Datasets, Pipelines, Jobs, Artifacts require authenticated users.
- Admin operations are restricted by either role lookup in /users/{uid} or email whitelist.
- All IDs must be strictly validated (^[a-zA-Z0-9_\\-]+$) and size-limited.
- All updates must be validated through `isValid[Entity]()` helpers.
- Status fields (e.g., in Job or Artifact) must be locked if terminal (e.g., 'completed').

## 2. The "Dirty Dozen" Payloads (Examples)
1. Inject 2KB string into featureId path.
2. Update feature.effort to 15 (invalid range 0-10).
3. Update job.status from 'completed' to 'processing' (terminal state shortcut).
4. Update artifact.id (attempt to modify immutable field).
5. Attempt create dataset without required fields ('id', 'name', 'owner').
6. Attempt update user profile role to 'admin'.
7. Attempt delete pipeline as a non-authenticated user.
8. Set pipeline.name to 1MB string.
9. Attempt list datasets without filter (insecure list pattern check).
10. Attempt create artifact with injection (PII isolation check - not applicable yet, but keep in mind).
11. Update feature.title to an invalid type (number).
12. Attempt to create a dataset with an orphaned ownerId (referential integrity test).

## 3. Test Runner
(Placeholder: `/firestore.rules.test.ts` to be implemented)
