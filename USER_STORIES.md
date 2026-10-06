# Comprehensive Product Requirements & User Stories: Data Pipeline Management Platform

This document serves as the single source of truth for developing the Data Pipeline Management Application. It is comprehensive enough that a frontend developer can build the entire application from scratch using only this document.

## 1. Technical Stack & Architecture Requirements
* **Framework:** React 18+ (Functional components, Hooks).
* **Styling:** Tailwind CSS (Utility-first, responsive design). All styling rules must adhere strictly to `DESIGN_SYSTEM.md`. No ad-hoc or raw styling (e.g., `<button className="...">`) without mapping to unified components.
* **Tables & Lists:** The app implements global standardized spacing for all data tables (`px-4 py-3`), explicit `hover:bg-slate-50` selection states, and solid headers to conform to the UI Design System specification.
* **Icons:** `lucide-react` (Specific icons are called out in stories).
* **State Management:** React `useState` for local/UI state. (Mock data arrays should be used to simulate backend state for this prototype).
* **Layout:** Full-screen web application. Fixed left sidebar for navigation, fixed top header, scrollable main content area.

## 2. Data Models (Mock Data Schemas)
To build the UI, the developer must implement the following data structures:
* **Pipeline:** `{ id: string, name: string, description: string, version: string, status: 'Active' | 'Draft' | 'Rejected' | 'Pending Review', lastRun: string, author: string, tags: string[], stages: string[] }`
* **Job:** `{ id: string, pipeline: string, status: 'Running' | 'Completed' | 'Failed' | 'Queued' | 'Code Error' | 'Data Error' | 'System Error' | 'Output Issue', progress: number, duration: string, time: string, steps: { name: string, status: string, duration: string, error?: string }[] }`
* **Artifact:** `{ id: string, name: string, type: 'Dataset' | 'Model' | 'Report', size: string, date: string, pipeline: string, format: string, path: string }`

---

# Core

## Epic 0: App Shell & Global Components [Internal Team View]

### US0.1: Main Layout & Sidebar Navigation
**As a** User, **I want** a persistent layout with a sidebar, **So that** I can navigate between major sections of the app.
* **Acceptance Criteria (BDD):**
  * **Given** the user loads the app, **Then** they see a fixed left sidebar (`w-64`, `bg-slate-900`, `text-slate-300`).
  * **And** the sidebar contains a Logo/Brand area at the top.
  * **And** navigation links for: 
    * **Datasets** (`Database` icon): Managing source data.
    * **Pipelines** (`GitMerge` icon): Managing processing logic.
    * **Jobs** (`Activity` icon): Monitoring execution.
    * **Artifacts** (`Folder` icon): Accessing outputs.
  * **When** a user clicks a link, **Then** the active link is highlighted (`bg-indigo-600`, `text-white`), and the main content area updates to show that view.

### US0.2: Top Header
**As a** User, **I want** a top header, **So that** I can see my profile and perform global actions.
* **Acceptance Criteria (BDD):**
  * **Given** the app is loaded, **Then** a fixed top header (`h-16`, `bg-white`, `border-b`) is visible above the main content.
  * **And** it contains a Search bar (`Search` icon) on the left.
  * **And** it contains a user profile section on the right with a placeholder avatar and a "Help" (`LifeBuoy`) icon.

### US0.3: Global Toast Notifications
**As a** User, **I want** to see temporary notifications, **So that** I know when my actions succeed or fail.
* **Acceptance Criteria (BDD):**
  * **Given** an action triggers a toast (e.g., `showToast('Success!')`), **Then** a small notification box appears at the bottom right (`fixed bottom-6 right-6`).
  * **And** it displays a `CheckCircle2` icon (emerald) and the message text.
  * **And** it automatically disappears after 3 seconds.
  * **And** it animates in (`slide-in-from-bottom-5`, `fade-in`).

### US0.12: Global Pagination
**As a** User, **I want** to see paginated tables across the application, **So that** I can easily navigate through large datasets without performance issues.
* **Acceptance Criteria (BDD):**
  * **Given** a table has more items than the current "Items per page" setting.
  * **Then** a pagination control appears at the bottom of the table.
  * **And** it displays the current range (e.g., "Showing 1 to 10 of 50").
  * **And** it provides "Previous" and "Next" buttons, along with direct page number links.
  * **And** it includes a dropdown to select the number of items per page (5, 10, 20, 50, 100).
  * **When** a new page or items-per-page value is selected, **Then** the table updates instantly to show the correct slice of data.

---

## Epic 1: Pipeline Management

### US1.1: Pipeline Dashboard & Lifecycle Tabs
**As a** Data Engineer, **I want** to view pipelines categorized by their lifecycle state.
* **Acceptance Criteria (BDD):**
  * **Given** the user navigates to "Pipelines", **Then** they see a page header with a "Create Pipeline" button (`Plus` icon).
  * **And** they see two main tabs: "Approved Catalog" and "Submitted for Review".
  * **When** clicking "Approved Catalog", **Then** they see all production-ready pipelines.
  * **When** clicking "Submitted for Review", **Then** they see pipelines in Draft, Review, or Rejected states.
  * **Card UI:** Each card displays the Pipeline Name, Description, Version, Status Badge (colored based on status), and a "User Generated" tag if applicable.
  * **Card Interaction:** Clicking the pipeline name in the card opens the Pipeline Details modal, mirroring the "Details" button functionality.

### US1.2: Pipeline Details Modal & Architecture View
**As a** Data Engineer, **I want** to click a pipeline card to see its full architecture and metadata.
* **Acceptance Criteria (BDD):**
  * **Given** the user clicks a pipeline card, **Then** a full-screen modal opens.
  * **Sidebar (Left):** Shows Author, Version, Type, and Tags.
  * **Main Content (Architecture Tab):** Shows a visual workflow of processing stages.
  * **Architecture UI:** Each stage is a card (e.g., "Data Ingestion", "PHI Redaction") connected by `ArrowRight` icons.
  * **Stage Details:** Clicking a stage card (simulated) would show specific logic or parameters for that step.
  * **Footer:** Contains "Close" and "Configure Run" (`Play` icon) buttons.

### US1.3: Pipeline Rejection Flow
**As a** Data Engineer, **I want** to see why my pipeline was rejected and revise it.
* **Acceptance Criteria (BDD):**
  * **Given** the user opens a Pipeline Details modal for a pipeline with status 'Rejected'.
  * **Then** the modal header has a red tint (`bg-rose-50`).
  * **And** a collapsible banner appears at the top of the content area.
  * **When** collapsed, the banner shows a `ShieldAlert` icon, "Pipeline Rejected", and a `ChevronDown` icon.
  * **When** clicked, it expands to show detailed reviewer notes in an italicized block.
  * **And** the modal footer contains a "Revise Pipeline" button (`RefreshCw` icon).
  * **When** "Revise Pipeline" is clicked, **Then** the pipeline status changes to 'Draft', a toast appears, and the modal closes.

### US1.4: Trigger Pipeline Run Modal
**As a** Data Engineer, **I want** to manually start a pipeline.
* **Acceptance Criteria (BDD):**
  * **Given** the user clicks "Configure Run" in the Pipeline Details modal.
  * **Then** a new smaller modal opens over the existing one.
  * **And** it lists available datasets with checkboxes.
  * **When** no datasets are checked, **Then** the "Start Run" button is disabled.
  * **When** at least one dataset is checked and "Start Run" is clicked, **Then** the modal closes, a toast says "Pipeline run initiated", and a new Job is added to the Jobs list.

### US1.5: Submit New Version / Bug Fix
**As a** Data Engineer, **I want** to submit updates or fixes for my pipelines with automated versioning.
* **Acceptance Criteria (BDD):**
  * **Given** the user clicks "Submit New Version" from an approved pipeline's details OR "Submit Bug Fix" from a failed job.
  * **Then** a "Submit New Version" modal opens.
  * **And** the version number is automatically pre-filled:
    * **Update:** Increments the minor version (e.g., v1.1.0 -> v1.2.0).
    * **Bug Fix:** Increments the patch version (e.g., v1.1.0 -> v1.1.1).
  * **And** for Bug Fixes, the description is pre-populated with the specific job error details.
  * **When** the user completes the 2-step wizard (Description -> Submission Method Selection: Git or Upload) and clicks "Submit", **Then** a new pipeline entry is created with status 'Technical Review' and the correct 'Submission Type'.
  * **And** the app automatically navigates to the "Submitted for Review" tab and opens the detail modal for the newly submitted version.

### US1.6: Pipeline Submission Type Filtering
**As a** Reviewer, **I want** to filter submitted pipelines by their submission type.
* **Acceptance Criteria (BDD):**
  * **Given** the user is on the "Submitted for Review" tab in the Pipelines view.
  * **Then** a second drop-down menu appears next to the Status filter.
  * **And** it contains options: "All Types", "New", "Update", and "Bug Fix".
  * **When** a type is selected, **Then** the list filters to show only pipelines matching that specific submission type.

### US1.7: Create New Pipeline Wizard
**As a** Data Engineer, **I want** a step-by-step wizard to create a new pipeline.
* **Acceptance Criteria (BDD):**
  * **Given** the user clicks "Create Pipeline", **Then** a multi-step modal opens.
  * **Step 1 (Basic Info):** User enters Name, Category (dropdown), Description, Initial Version, and Pipeline Type (dropdown, managed by a feature toggle).
  * **Step 2 (Requirements & Artifacts):** User defines Supported Formats, Max File Size, Secure Vault Access, and selects Output Artifacts.
  * **Step 3 (Submission):** User chooses between **Git Integration** (Repository URL, Branch/Tag) or **Manual File Upload** (Documentation, Source Code).
  * **When** "Submit" is clicked, **Then** a new pipeline is added to the "Submitted for Review" tab with status 'Technical Review'.
  * **And** the app automatically navigates to the "Submitted for Review" tab and opens the detail modal for the newly created pipeline.
  * **And** the "Architecture" view includes a link to the Git repository or the uploaded files for code review.

### US1.8: Pipeline View Modes & Grouping
**As a** Data Engineer, **I want** to switch between card and table views for my pipelines.
* **Acceptance Criteria (BDD):**
  * **Given** the user is in the "Submitted for Review" tab.
  * **Then** they see a view mode toggle (`Box` for cards, `List` for table).
  * **When** "Table View" is active, **Then** pipelines are grouped by name.
  * **And** each group can be expanded/collapsed to show all submitted versions of that pipeline, sorted by version number (descending).
  * **And** the table includes columns: Pipeline Group, Pending Submissions, and Status.
  * **And** each group can be expanded/collapsed to show all submitted versions of that pipeline, with an inner table containing headers: Version / Description, Submission Type / Merge, Status / Progress, Created / SHA.
  * **And** the "Merge" column displays real-time branch health (Clean, Behind, Conflict) with corresponding icons (`CheckCircle2` or `AlertCircle`).
  * **And** the "SHA" column displays the specific Git commit hash for each submission.
  * **And** each version row has a side color border that is only visible on hover (Bug Fix: Red, Update: Blue, New: Emerald).
  * **And** the review progress message is color-coded: **Blue** for reviewer-initiated actions/states and **Yellow** for author-initiated actions/states.
  * **And** clicking a version row opens its details modal.

### US1.9: Pipeline Change Log
**As a** Data Engineer, **I want** to see the history of changes for a pipeline.
* **Acceptance Criteria (BDD):**
  * **Given** the user is in the Pipeline Details modal.
  * **Then** they see sub-tabs for "Architecture" and "Change Log".
  * **When** "Change Log" is clicked, **Then** the view updates to show a chronological list of versions, their descriptions, and submission dates.

### US1.10: Review Timeline Color-Coding
**As a** Data Engineer, **I want** to see color-coded messages in the review timeline, **So that** I can easily distinguish between reviewer and author actions.
* **Acceptance Criteria (BDD):**
  * **Given** the user is in the Pipeline Details modal and viewing the Review Timeline.
  * **Then** the progress messages (e.g., "Awaiting initial technical validation") are displayed in colored badges.
  * **And** messages indicating reviewer actions or system states (e.g., "Scanning new regex patterns") are **Blue** (`text-indigo-600 bg-indigo-50 border-indigo-100`).
  * **And** messages indicating author actions or feedback (e.g., "Feedback sent", "Revision required") are **Yellow** (`text-amber-600 bg-amber-50 border-amber-100`).

---

## Epic 2: Job Monitoring

### US2.1: Jobs Table View & Filtering [Support Tickets]
**As a** Data Engineer, **I want** to see a list of all job executions with advanced filtering.
* **Acceptance Criteria (BDD):**
  * **Given** the user navigates to "Jobs", **Then** they see a Jobs Dashboard with clickable cards (Total, Active, Completed, Failed) that filter the job list, followed by a table with search and filter controls.
  * **And** selected dashboard cards have a subtle shadow and border.
  * **Search:** A text input that filters jobs by Dataset name or Pipeline name.
  * **Filters:** Dropdowns for Status, Pipeline, and Dataset.
  * **Sorting:** Clicking column headers (Job ID, Time) toggles ascending/descending sort order.
  * **Columns:** Job ID, Pipeline, Status, Progress, Duration, Time, Actions.
  * **Status UI:** 
    * Running: Blue text/bg, animated progress bar (`w-full bg-slate-100`, inner `bg-blue-500`).
    * Completed: Emerald text/bg, full progress bar.
    * Failed/Errors: Rose text/bg, halted progress bar.
  * **Actions Column:** Contains a "Human Support" (`LifeBuoy`) button for failed jobs, and "Export Logs" (`Download`) for 'System Error' jobs.

### US2.2: Job Details & Execution Timeline Modal [Support Tickets]
**As a** Data Engineer, **I want** to see the exact steps a job took and where it failed.
* **Acceptance Criteria (BDD):**
  * **Given** the user clicks a row in the Jobs table, **Then** a Job Details modal opens.
  * **Content:** Displays a vertical timeline of steps.
  * **Step UI:** Each step has an icon (`CheckCircle2` for success, `AlertCircle` for failure, `Clock` for pending).
  * **Failure UI:** If a step failed, it has red text, and an error message block (`bg-rose-50`, `text-rose-700`, monospace font) appears directly below it.
  * **Error Types:** The system specifically identifies failures as **Code Error**, **Data Error**, **System Error**, or **Output Issue**.
  * **Footer:** Contains "Close", "Human Support" (if failed), and "Retry Job" (if transient error).

### US2.3: Retry Failed Job
**As a** Data Engineer, **I want** to restart a job that failed due to a temporary issue.
* **Acceptance Criteria (BDD):**
  * **Given** the user is in the Job Details modal for a 'Code Error' or 'Data Error' job.
  * **When** they click "Retry Job" (`RefreshCw` icon).
  * **Then** the job's status in the main table changes to 'Queued', progress resets to 0, the modal closes, and a success toast appears.

### US2.4: Human Support Escalation Modal [Support Tickets]
**As a** Data Engineer, **I want** to request help for systemic job failures.
* **Acceptance Criteria (BDD):**
  * **Given** the user clicks the "Human Support" button (from the table or Job Details modal).
  * **Then** a centered Success Modal appears (`fixed inset-0`, `bg-slate-900/50`).
  * **UI:** White box, large green `CheckCircle2` icon, title "Support Request Sent".
  * **Text:** "We've received your request for help with job [Job ID]. Our engineering support team is investigating and will follow up with you via email shortly."
  * **Action:** A full-width "Got it, thanks" button.
  * **When** clicked, the modal closes.

---

## Epic 3: Artifact Management

### US3.1: Artifacts Grid View
**As a** Data Engineer, **I want** to see all outputs generated by my pipelines.
* **Acceptance Criteria (BDD):**
  * **Given** the user navigates to "Artifacts", **Then** they see a grid of cards.
  * **Card UI:** Icon based on type (`Database` for Dataset, `Box` for Model). Displays Name, Size, Date, and generating Pipeline.
  * **Actions:** Each card has an "Edit" (`Edit2`) icon and a "Download" (`Download`) button.

### US3.2: Artifact Details & Data Preview Modal
**As a** Data Engineer, **I want** to inspect an artifact before downloading it.
* **Acceptance Criteria (BDD):**
  * **Given** the user clicks an artifact card (not the edit/download buttons).
  * **Then** an Artifact Details modal opens with a split-pane layout.
  * **Sidebar (Left):** Shows "Origin Details" (Source Dataset, Pipeline, Version, Date) and "Key Metrics" (Size, Format, Rows).
  * **Main Content (Right):** Shows a "Data Preview" section.
  * **Preview UI:** Displays a scrollable area with sample data. For text artifacts, it shows a redacted text block. For datasets, it shows a mock data table.
  * **Full Content Toggle:** A "View Full Artifact" button that expands the preview to show more simulated content.

### US3.3: Inline Artifact Renaming
**As a** Data Engineer, **I want** to rename an artifact directly in the grid.
* **Acceptance Criteria (BDD):**
  * **Given** the user clicks the "Edit" icon on an artifact card.
  * **Then** the artifact name becomes a text input field (`input type="text"`).
  * **And** "Save" (`Check`) and "Cancel" (`X`) icons appear next to it.
  * **When** the user types a new name and clicks Save, **Then** the UI updates with the new name, edit mode closes, and a success toast appears.

### US3.4: Artifact Download Modal
**As a** Data Engineer, **I want** to configure how I download an artifact.
* **Acceptance Criteria (BDD):**
  * **Given** the user clicks "Download" on an artifact card.
  * **Then** a Download Configuration modal opens.
  * **Options:** Radio buttons to select format (JSON, CSV, Parquet). A toggle switch for "Include full process logs".
  * **Dynamic Summary:** A box at the bottom updates to show the expected filename (e.g., `[ArtifactName].csv`) and whether logs are included.
  * **When** the user clicks "Download" in the modal, **Then** the modal closes and a toast says "Downloading [ArtifactName]...".

### US3.5: PHI Proportion Highlighting for Output Issues
**As a** Compliance Officer, **I want** to see exactly why an artifact was flagged with an output issue.
* **Acceptance Criteria (BDD):**
  * **Given** the user opens the Artifact Details modal for an artifact with status 'Output Issue'.
  * **Then** the "PHI Proportion" metric card is highlighted with a rose-colored background and border (`bg-rose-50/30`, `border-rose-200`).
  * **And** a "Output Issue" badge (`AlertCircle` icon) is displayed within the card.
  * **And** a specific warning message explains that the PHI threshold was exceeded.

---

## Epic 4: Dataset Management

### US4.1: Dataset Inventory Table
**As a** Data Engineer, **I want** to see all available datasets in a searchable table.
* **Acceptance Criteria (BDD):**
  * **Given** the user navigates to "Datasets", **Then** they see a table with columns: Name, Owner, Type, Access Type, Last Updated, and Created.
  * **And** they can filter datasets by Search (Name), Status, Owner, Access Type, and Type.
  * **And** clicking column headers sorts the data.
  * **And** each row has a checkbox for bulk actions (simulated).

### US4.2: Dataset Import Flow
**As a** Data Engineer, **I want** to import new datasets into the platform.
* **Acceptance Criteria (BDD):**
  * **Given** the user clicks "Import Dataset", **Then** a 2-step modal opens.
  * **Step 1:** User enters Dataset Name and selects Type (Audio, Text, Video).
  * **Step 2:** User selects a Pipeline to associate with this dataset for initial processing.
  * **When** "Complete Import" is clicked, **Then** a success toast appears and the dataset is added to the list.

---

# Horizon 1

## Epic 5: Global Controls & Security

### US5.1: Internal Team View Toggle [Internal Team View]
**As a** Reviewer, **I want** to toggle an "Internal Team View" in the header, **So that** I can access administrative actions like advancing reviews or submitting drafts.
* **Acceptance Criteria (BDD):**
  * **Given** the user is viewing the top header.
  * **Then** they see a toggle switch labeled "Internal View".
  * **When** toggled ON, **Then** additional actions become visible in the Pipelines view:
    * **Submit:** Button to move a 'Draft' submission into the 'Technical Review' queue.
    * **Advance:** Button to manually advance a pipeline through the multi-stage review lifecycle (Technical -> Privacy -> Security -> Approved).
    * **Submit New Version:** Button visible for non-user-generated pipelines in their details modal, allowing reviewers to propose updates.

### US5.2: Support Tickets Toggle [Support Tickets]
**As a** User, **I want** to toggle the visibility of Support Tickets, **So that** I can control the visibility of support-related UI elements.
* **Acceptance Criteria (BDD):**
  * **Given** the user is in the Settings modal.
  * **Then** they see a toggle switch labeled "Support Tickets".
  * **When** toggled OFF, **Then** the "Support Requests" tab and related UI elements are hidden.

### US5.3: Support Performance Toggle [Support Performance]
**As a** User, **I want** to toggle the visibility of Support Performance metrics, **So that** I can control the visibility of performance-related UI elements.
* **Acceptance Criteria (BDD):**
  * **Given** the user is in the Settings modal.
  * **Then** they see a toggle switch labeled "Support Performance".
  * **When** toggled OFF, **Then** the "Job Performance" tab is hidden.

### US5.4: Jira Integration Toggle [Jira Integration]
**As a** User, **I want** to toggle the visibility of Jira Integration features, **So that** I can control the visibility of Jira-related UI elements.
* **Acceptance Criteria (BDD):**
  * **Given** the user is in the Settings modal.
  * **Then** they see a toggle switch labeled "Jira Integration".
  * **When** toggled OFF, **Then** Jira-related UI elements are hidden.

### US5.5: Automated Change Log Toggle [Automated Change Log]
**As a** Data Engineer, **I want** to toggle the visibility of an automated change log, **So that** I can see a detailed list of commits and files changed between pipeline versions.
* **Acceptance Criteria (BDD):**
  * **Given** the user is in the Settings modal.
  * **Then** they see a toggle switch labeled "Automated Change Log".
  * **When** toggled ON, **Then** the pipeline details modal displays an automated change log comparing Git SHAs.

### US5.6: Settings Presets
**As a** User, **I want** to use presets to quickly configure multiple feature toggles at once.
* **Acceptance Peak:**
  * **Given** the user is in the Settings modal.
  * **Then** they see a "Presets" dropdown menu.
  * **When** they open the dropdown, **Then** they see options like "Baseline", "Container", "Dry-run", and "Pipeline Creation".
  * **When** they select a preset, **Then** the corresponding feature toggles are automatically turned on or off.

### US5.7: Pipeline Sidebar Details Toggle
**As a** User, **I want** to toggle the visibility of the Pipeline Sidebar Details, **So that** I can control whether Input Requirements and Output Artifacts are shown in the pipeline sidebar.
* **Acceptance Criteria (BDD):**
  * **Given** the user is in the Settings modal.
  * **Then** they see a toggle switch labeled "Pipeline Sidebar Details".
  * **When** toggled ON, **Then** the pipeline sidebar displays Input Requirements and Output Artifacts.

### US5.8: Pipeline Type Dropdown Toggle
**As a** User, **I want** to toggle the visibility of the Pipeline Type Dropdown, **So that** I can control whether the pipeline type selection is available during pipeline creation.
* **Acceptance Criteria (BDD):**
  * **Given** the user is in the Settings modal.
  * **Then** they see a toggle switch labeled "Pipeline Type Dropdown".
  * **When** toggled ON, **Then** the "Create New Pipeline" wizard includes a dropdown to select the pipeline type.

---

## Epic 6: Container Registry [Container Registry]

### US6.1: Image Inventory & Grouping
**As a** DevSecOps Engineer, **I want** to see a grouped view of container images, **So that** I can manage different versions of the same image efficiently.
* **Acceptance Criteria (BDD):**
  * **Given** the user navigates to "Pipelines" -> "Container Registry".
  * **Then** they see a table of container images.
  * **And** images with the same name are grouped together.
  * **And** each group can be expanded to show all associated tags/versions.
  * **And** the table displays Image Name, Security Status, Size, Created Date, and Status.

### US6.2: Vulnerability Heatmap
**As a** Security Analyst, **I want** a visual summary of vulnerabilities for each image group, **So that** I can quickly identify high-risk assets.
* **Acceptance Criteria (BDD):**
  * **Given** the "Vulnerability Heatmap" feature is enabled.
  * **Then** the registry table displays a "Security" column with color-coded squares.
  * **And** the squares represent Critical (Red), High (Orange), Medium (Yellow), and Low (Gray) vulnerabilities.
  * **And** the counts represent the maximum vulnerability count across all tags in that group.
  * **And** hovering over a square shows a tooltip with the specific count.

### US6.3: Image Details Modal & Sidebar
**As a** Developer, **I want** to see detailed metadata and build layers for a specific container image.
* **Acceptance Criteria (BDD):**
  * **Given** the user clicks an image name in the registry.
  * **Then** a large modal opens with two tabs: "Details" and "Associated Pipelines".
  * **Details Tab:**
    * **Main Content:** Displays a vulnerability breakdown and a "Base Image Layers" section.
    * **Sidebar (Right):** Displays key metadata: Version Tag, Image Size, Created Date, and Health Status.
    * **Layers UI:** Shows a vertical list of Docker instructions (e.g., `FROM`, `RUN`, `COPY`) with their respective sizes.
  * **Associated Pipelines Tab:** Displays a table of all pipelines that use this specific image tag, including their run history and failure rates.

### US6.4: Tag Comparison Tool
**As a** DevSecOps Engineer, **I want** to compare different tags of the same image, **So that** I can verify security improvements or configuration changes.
* **Acceptance Criteria (BDD):**
  * **Given** an image group has multiple tags.
  * **When** the user clicks the "Compare Tags" icon.
  * **Then** a modal opens showing a side-by-side comparison of all tags.
  * **And** it compares Version, Size, Created Date, and Vulnerability counts.

### US6.5: Orphaned Image Detection
**As a** System Administrator, **I want** to identify images that are no longer used by any pipelines, **So that** I can clean up the registry.
* **Acceptance Criteria (BDD):**
  * **Given** an image has no associated pipelines.
  * **Then** an "Orphaned" badge appears next to the image name in the registry.
  * **And** hovering over the badge explains that no pipelines are currently using this image.

### US6.6: Error Clustering & Infrastructure Alerts
**As a** System Administrator, **I want** to see if a job failure is part of a larger infrastructure issue, **So that** I can prioritize system-wide fixes.
* **Acceptance Criteria (BDD):**
  * **Given** the "Error Clustering" feature is enabled.
  * **And** multiple jobs fail with the same error pattern (e.g., "Connection Timeout").
  * **Then** a global alert banner appears at the top of the Jobs view.
  * **And** the banner identifies the error as an "Infrastructure-wide Issue".
  * **And** individual job rows in the table display an "Infra Issue" badge.
  * **And** the Job Details modal highlights the error as part of a cluster.

### US6.7: Advanced Architecture & Lineage
**As a** Data Architect, **I want** to see the lineage of data through processing stages, **So that** I can understand complex dependencies.
* **Acceptance Criteria (BDD):**
  * **Given** the "Advanced Architecture" feature is enabled.
  * **Then** the Architecture view in the Pipeline Details modal displays lineage connections between stages.
  * **And** clicking a stage card reveals stage-level environment variables and configuration details.

### US6.8: Vulnerability Scan Toggle
**As a** Security Manager, **I want** to toggle the visibility of detailed vulnerability scans, **So that** I can simplify the interface for users who don't need security data.
* **Acceptance Criteria (BDD):**
  * **Given** the user is in the Settings modal.
  * **Then** they see a toggle switch labeled "Vulnerability Scan" in the "Infrastructure & Registry" group.
  * **When** toggled OFF, **Then** the "Vulnerability Scan" section in the container image details modal is hidden.

---

# Horizon 2

## Epic 7: Readiness Analysis & Guided Solutions

### US7.1: Readiness Gate for Unbuilt Pipelines
**As a** System Administrator, **I want** a Readiness Gate to evaluate pipelines lacking container builds, **So that** developers can see structural issues before attempting to submit.
* **Acceptance Criteria (BDD):**
  * **Given** a pipeline is not marked as having a container built.
  * **Then** the pipeline displays a "Pending Build" or "Low Readiness" status depending on settings.
  * **When** the developer enters the Readiness Gate, **Then** an automated readiness score out of 100 is presented.
  * **And** it explicitly lists critical or minor issues found in the pipeline's structure (e.g., missing dependencies, vulnerable packages).

### US7.2: Contextual Resolution Actions
**As a** Developer, **I want** to quickly resolve readiness issues through direct action buttons, **So that** I don't have to hunt for related decisions or search for automation tools.
* **Acceptance Criteria (BDD):**
  * **Given** a developer is viewing an issue in the Readiness Gate.
  * **Then** they see resolution-specific buttons based on the issue metadata:
    * **Go to Decision/Action:** Indigo primary buttons (`bg-indigo-600`) that switch the view to the relevant related tab.
    * **Run Automation:** A primary button to execute a one-click fix.
  * **And** a "Learn More" link is provided as a simple Indigo text link (`text-indigo-600`) without a button container.

### US7.3: Acknowledge & Override Workflow
**As a** Data lead, **I want** to acknowledge an issue with a justification, **So that** I can override secondary readiness blocks that don't require code changes.
* **Acceptance Criteria (BDD):**
  * **Given** an issue can be bypassed, **Then** an "Acknowledge & Override" button is visible.
  * **UI:** White background, thin grey border (`border-slate-200`), and slate text, matching the "Guided Solutions" style.
  * **When** clicked, **Then** a mandatory justification input field appears.
  * **When** a reason is provided and "Confirm" is clicked, **Then** the issue state changes to "Acknowledged" with an Emerald theme.

### US7.4: Guided Solutions AI Chat
**As a** User, **I want** to be able to disable the readiness analysis feature, **So that** I can simplify the interface and skip the readiness gating process if my organization doesn't require it.
* **Acceptance Criteria (BDD):**
  * **Given** the user is in the Settings modal.
  * **Then** they see a toggle switch labeled "Readiness Analysis & Score".
  * **When** toggled OFF, **Then** the readiness step in the pipeline creation wizard is skipped.
  * **And** pipeline creation immediately proceeds from the repository linking directly to documentation/requirements.
  * **And** list views display "Pending Build" instead of "Low Readiness".
