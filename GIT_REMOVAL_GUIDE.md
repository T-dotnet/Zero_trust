# Git Integration Removal Guide

This document provides instructions for reverting the Git-integrated versioning and review features added to the MRFF Pipeline Review platform.

## Markers
All Git-related code blocks in `src/App.tsx` are wrapped with the following comments:
- `/* GIT_INTEGRATION_START */`
- `/* GIT_INTEGRATION_END */`

## Removal Steps

### 1. Imports
Locate the `lucide-react` import block at the top of `src/App.tsx`.
- Remove the `FileSearch` icon (and any other icons specifically added for Git if they are no longer used).

### 2. Mock Data
Locate `MOCK_PIPELINES` in `src/App.tsx`.
- Remove the extended pipeline entries (IDs `pipe-8` through `pipe-13`) that contain `gitSha`, `gitBranch`, and `mergeStatus`.
- Revert the remaining pipelines to their original state (removing `gitSha` and `mergeStatus` fields).

### 3. Dashboard Table (Submitted for Review)
Locate the table row mapping for submitted pipelines.
- Remove the `gitBranch` badge next to the version number.
- Remove the `mergeStatus` indicator (Clean/Behind/Conflict) in the submission type column.
- Remove the `gitSha` display in the date column.
- Remove the `FileSearch` ("View Git Diff") button in the actions column.

### 4. Pipeline Details Modal
Locate the `selectedPipelineForDetails` rendering logic.
- Remove the entire "Git Health & Source Integrity" section (the block starting with `Github` icon and ending with the "View Full Diff" button).

## Verification
After removal, run:
1. `npm run lint` to ensure no unused icons or variables remain.
2. `npm run build` to verify the application still compiles correctly.
