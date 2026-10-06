# Data Pipeline Management Platform: Full Feature List & Technical Details

This document provides a comprehensive overview of all features implemented in the Data Pipeline Management Platform.

## 1. Core Platform Architecture
*   **App Shell:** A persistent layout featuring a fixed left sidebar for navigation and a top header for global actions.
*   **Navigation:** Seamless switching between Datasets, Pipelines, Jobs, and Artifacts.
*   **Global Search:** Context-aware search in the top header (simulated).
*   **Toast System:** Real-time feedback for user actions (Success, Info, Warning).
*   **Global Pagination:** Standardized pagination across all major tables (Datasets, Artifacts, Jobs, Pipeline History, Support Requests, Pipelines, and Container Registry). Includes configurable items per page (5, 10, 20, 50, 100) and direct page navigation.

## 2. Dataset Management
*   **Dataset Inventory:** A centralized table view of all source data with columns for Owner, Type, Access Level, and timestamps. Redundant "Total rows" text removed for a cleaner interface.
*   **Advanced Filtering:** Filter datasets by Name (Search), Status (Secure Vault), Owner, Access Type (Private, Shared, Restricted), and Data Type (Audio, Text, Video).
*   **Multi-Column Sorting:** Sort datasets by any column header.
*   **Import Wizard:** A 2-step process to bring new data into the platform:
    *   **Step 1:** Define metadata (Name, Type).
    *   **Step 2:** Associate with a processing pipeline for initial ingestion.

## 3. Pipeline Management
*   **Lifecycle Tabs:**
    *   **Approved Catalog:** Production-ready pipelines available for immediate use.
    *   **Submitted for Review:** Pipelines in Draft, Technical Review, Privacy Review, or Rejected states.
*   **View Modes:** Toggle between a visual **Card View** and a structured **Table View**.
*   **Card View Enhancements:** Pipeline names in the pipeline cards are clickable and trigger the pipeline details modal, mirroring the functionality of the "Details" button.
*   **Version Grouping:** In Table View, multiple submissions of the same pipeline are grouped together with expand/collapse functionality. Versions are automatically sorted by semantic version number (descending). The table now includes columns for Pipeline Group, Pending Submissions, and Status, with an inner table featuring detailed headers: Version / Description, Submission Type / Merge, Status / Progress, Created / SHA.
*   **Color-Coded Indicators:** Version rows in the inner table feature a side-border that appears on hover, color-coded by submission type (Bug Fix: Red, Update: Blue, New: Emerald) for quick visual identification.
*   **Streamlined Actions:** The "Submitted for Review" table is optimized for review workflows, with direct "Submit" and "Advance" actions, and row-click navigation to details.
*   **Creation Wizard:** A robust 3-step workflow for developers:
    *   **Basic Info:** Name, Category, Description, Initial Version, and Pipeline Type dropdown (managed by a feature toggle).
    *   **Requirements & Artifacts:** Supported formats, size limits, security requirements (Vault), and output artifacts definition.
    *   **Submission Options:** Choose between **Git Integration** (Repository URL, Branch/Tag) or **Manual File Upload** (Documentation, Source Code).
*   **Streamlined Submission Flow:** After creating a pipeline or submitting a new version, the app automatically navigates to the "Submitted for Review" tab and opens the detail modal for the new submission.
*   **Review Timeline Color-Coding:** Progress messages in the review timeline are color-coded: **Blue** for reviewer-initiated actions/states and **Yellow** for author-initiated actions/states.
*   **Git Integration & Validation:**
    *   **Merge Status Tracking:** Real-time visibility into branch health (Clean, Behind, Conflict) with automated merge status indicators.
    *   **SHA Tracking:** Every submission is linked to a specific Git SHA for auditability and precise code review.
    *   **Diff Inspection:** Direct links to view Git diffs for submitted versions (simulated).
*   **Flexible Review Workflow:** Reviewers can access the source code directly in Git for line-by-line comments or inspect manually uploaded documentation and code files.
*   **Pipeline Details Modal:**
    *   **Architecture View:** Visual representation of processing stages (Ingestion -> NLP -> Redaction, etc.).
    *   **Advanced Architecture:** Enhanced architecture view with lineage tracking and stage-level environment variables (managed by a feature toggle).
    *   **Change Log:** Chronological history of all versions and submission notes.
*   **Versioning Engine:** Automated version increments based on submission type:
    *   **Updates:** Increments minor version (v1.1.0 -> v1.2.0).
    *   **Bug Fixes:** Increments patch version (v1.1.0 -> v1.1.1).
*   **Reviewer Feedback:** A specialized banner for rejected pipelines showing detailed notes and a one-click "Revise" flow.
*   **Submission Filtering:** Filter the review queue by Status and Submission Type (New, Update, Bug Fix).

## 4. Job Monitoring
*   **Real-time Tracking:** A Jobs Dashboard featuring clickable cards (Total, Active, Completed, Failed) for filtering, and a dynamic table showing job status with live progress bars.
*   **Search & Filter:** Filter jobs by Dataset, Pipeline, or Status.
*   **Error Clustering:** Automated grouping of similar job failures to identify infrastructure-wide issues, flagged with a specialized banner and status indicators (managed by a feature toggle).
*   **Job Details Modal:**
    *   **Execution Timeline:** A step-by-step breakdown of the job's progress with status icons (Success, Failure, Pending).
    *   **Error Diagnostics:** Detailed error messages and tracebacks for specific failure types: **Code Error**, **Data Error**, **System Error**, and **Output Issue**.
*   **Recovery Actions:**
    *   **Retry:** Restart failed jobs with a single click.
    *   **Human Support:** Escalate systemic issues to the engineering team.
    *   **Log Export:** Download full execution logs for system-level debugging.

## 5. Artifact Management
*   **Artifact Inventory:** A searchable table of all generated outputs (Transcripts, Models, Reports).
*   **Details & Preview:**
    *   **Split-Pane View:** Metadata and metrics on the left, data preview on the right.
    *   **Data Preview:** Redacted text previews for transcripts and mock data tables for datasets.
    *   **PHI Highlighting:** Automated visual alerts (rose-colored highlighting) when the PHI Proportion metric exceeds safety thresholds.
*   **Inline Editing:** Rename artifacts directly in the list view.
*   **Download Configuration:**
    *   **Format Selection:** Export to JSON, CSV, or Parquet.
    *   **Log Inclusion:** Option to bundle processing logs with the artifact download.

## 6. Container Registry [Container Registry]
*   **Image Inventory:** A centralized view of all container images, grouped by image name with version counts.
*   **Vulnerability Heatmap:** Visual security indicators for each image, aggregating vulnerabilities (Critical, High, Medium, Low) across all tags.
*   **Orphaned Image Detection:** Automated identification of images not associated with any active pipelines, flagged with an "Orphaned" badge.
*   **Tag Comparison Tool:** A specialized modal for comparing metadata and security profiles across different tags of the same image.
*   **Image Details Modal:**
    *   **Two-Tab Structure:** "Details" for metadata and "Associated Pipelines" for usage tracking.
    *   **Metadata Sidebar:** Key information (Version Tag, Image Size, Created Date, Health Status) moved to a dedicated right-side sidebar for better organization.
    *   **Vulnerability Breakdown:** Detailed scan results with severity counts.
    *   **Base Image Layers:** Visual representation of Docker layers (FROM, RUN, COPY) with size information, displayed in the sidebar.
*   **Associated Pipelines Tracking:** A sub-table within the image details showing all pipelines using the image, including run counts and failure rates.
*   **Registry Cleanup:** Removal of internal registry prefixes (e.g., `mrff-registry.internal/`) from image names for a cleaner, more readable interface.

## 7. Global Controls & Security
*   **Internal Team View Toggle [Internal Team View]:** A specialized toggle in the top header for reviewers to access administrative actions:
    *   **Submit:** Manually move a 'Draft' submission into the 'Technical Review' queue.
    *   **Advance:** Progress a pipeline through the multi-stage review lifecycle (Technical -> Privacy -> Security -> Approved).
    *   **Submit New Version:** Access version submission tools for non-user-generated pipelines.
*   **Settings Menu & Feature Toggles:** A comprehensive settings menu to control visibility of various features.
    *   **Presets:** Grouped toggles for quick configuration (e.g., Baseline, Container, Dry-run, Pipeline Creation).
    *   **Support Tickets Toggle:** Controls the visibility of the "Support Requests" tab and related UI elements.
    *   **Support Performance Toggle:** Controls the visibility of the "Job Performance" tab.
    *   **Jira Integration Toggle:** Controls the visibility of Jira-related UI elements.
    *   **Automated Change Log Toggle:** Controls the visibility of an automated change log in the pipeline details modal.
    *   **Pipeline Sidebar Details Toggle:** Controls the visibility of Input Requirements and Output Artifacts in the pipeline sidebar.
    *   **Pipeline Type Dropdown Toggle:** Controls the visibility of the pipeline type dropdown in the "Create New Pipeline" wizard.
    *   **Container-based Pipelines Toggle:** Enables Docker/Container management for pipelines.
    *   **Container Registry Toggle:** Enables registry management features.
    *   **Architecture Diff Tool Toggle:** Enables visual comparison of pipeline architecture versions.
    *   **Advanced Architecture Toggle:** Enables lineage tracking and stage-level environment variables.
    *   **Vulnerability Scan Toggle:** Controls the visibility of detailed scan results in the container image details modal.
    *   **Error Clustering Toggle:** Enables automated grouping of similar job failures.
    *   **Draft Status for Updates Toggle:** Allows saving pipeline updates as drafts before submission.
    *   **Dry Run Simulations Toggle:** Enables technical dry runs for draft pipelines.
    *   **Dry Run Log Feature Toggle:** Shows dry run log history in pipeline details.
*   **Dry Run Log:** A detailed log of dry run executions, accessible via a link in the dry run simulator, showing data sample names, dates, durations, and results.

## 8. Ticketing & Support
*   **Support Requests:** A dedicated interface for users to submit and track support tickets related to pipeline issues or system errors.
*   **Support Performance:** A dashboard for internal teams to monitor support ticket resolution times and performance metrics.
*   **Jira Integration:** Seamless integration with Jira for tracking and managing support tickets and engineering tasks.

## 9. Design System & Standardization
*   **Unified UI Components:** The application relies on `DESIGN_SYSTEM.md` as the ultimate source of truth for component logic rather than raw inline HTML.
*   **Tables & Lists:** Global tables must adhere to standard spacing (`px-4 py-3`), have `bg-slate-50` headers, and use explicit `hover:bg-slate-50` highlighting for row selection. (Ongoing migration required to replace legacy `px-6` and `bg-slate-50/50` implementations).
*   **Buttons:** Action buttons and link-based CTAs must map to the unified `src/components/ui/Button.tsx` variants (`primary`, `secondary`, `ghost`, `destructive`, `outline`) as cataloged in the Design System.

## 10. Readiness Analysis & Guided Resolution
*   **Readiness Gate:** Unbuilt pipelines must pass an automated analysis that parses their repository to calculate a "Readiness Score" and explicitly list structural issues.
*   **Contextual Resolution Actions:** Every readiness issue provides direct resolution paths:
    *   **Go to Decision / Review Action:** Integrated triggers (Indigo primary buttons) that jump directly to the relevant decision or action tab for resolution.
    *   **Run Automation:** One-click execution (Indigo primary button) for systemic fixes or environment setup.
*   **Acknowledge & Override:** A standardized administrative bypass (White background, light grey border) for resolving issues that require human justification rather than code changes.
*   **Guided Solutions AI Chat:** A contextual AI assistant embedded directly within standard issue resolution modals. Users converse with the AI to debug errors without leaving the context card.
*   **Readiness Toggle:** An explicit boolean toggle in the settings menu allows teams to switch off readiness checking globally if they prefer an un-gated workflow.
