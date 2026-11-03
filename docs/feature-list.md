# Feature list — all features enabled

[Documentation home](README.md) · [Personas](personas.md) · [User flows](user-flows.md) · [Control reference](settings-and-feature-toggles.md)

This is the canonical feature list for the documented product experience. **All capabilities are included and all exposed capability switches are selected ON.** Flows do not hide optional capabilities to simplify the story. This documentation does not change application defaults or saved settings.

“Always available” means the seeded feature has no associated toggle (`toggle: null`). “Enabled” means its associated Settings boolean is selected ON in configuration **E1** below. Neither term means every action appears in every state: item status, actor view, and available data still determine visibility. Simulated operations remain simulated when enabled.

## E1 — canonical all-features-enabled configuration

Apply in Settings; do not rely on the partial **All ON** shortcut. Check all four feature groups, then explicitly verify every capability setting below.

| Settings section | Selected ON throughout the flows |
| --- | --- |
| Support & Integration | Support Tickets; Support Performance; Jira Integration; Automated Change Log; Reviewer Dashboard; Readiness Analysis & Score |
| Readiness sub-settings | Documentation Links; Code Snippet Suggestions; Acknowledge & Override; Resource Profiling; Compatibility Matrix; Positive Reinforcement; **Quality Gates** |
| Infrastructure & Registry | Container-based Pipelines; Container Registry; Vulnerability Heatmap; **Vulnerability Scan**; Orphaned Image Detection; **Error Clustering** |
| Architecture & Visualization | Architecture Diff Tool; **Advanced Architecture** |
| Pipeline Workflow | Pipeline Sidebar Details; Pipeline Type Dropdown; Draft Status for Updates; Dry Run Simulations; Dry Run Log Feature |

Bold settings deserve explicit attention: some start OFF or are omitted from All ON. Readiness sub-settings are also omitted from that shortcut and from named configuration persistence.

**Actor/view selections are separate from capability switches:** select **IA Layout = Current Layout**, keep `isReviewerView=false` for the reproducible walkthroughs, use **Internal View OFF** for author/researcher steps, and **Internal View ON** for internal review/registry steps. F36 is available throughout; changing its selected mode is a handoff, not disabling the feature. Reviewer Dashboard is enabled but is not visible with `isReviewerView=false`; there is no direct Reviewer View switch in the inspected UI.

E1 is a documentation configuration, not a saved preset. The [control reference](settings-and-feature-toggles.md) records actual initial values, feature mapping gaps, and persistence. In particular, **Quality Gates ON currently blocks the seeded new-pipeline wizard**; [J2](user-flows.md#j2-create-a-custom-pipeline-and-confirm-a-build) shows that boundary rather than silently switching it OFF.

## Core platform and dataset capabilities

| ID | Seeded feature title | E1 selection | Purpose and principal flow |
| --- | --- | --- | --- |
| F1 | App Shell | Always available | Persistent workspace and global controls; all flows |
| F2 | Navigation | Always available | Move among data, pipelines, jobs, and artifacts; all flows |
| F3 | Global Search | Always available | Find items and jump to views; search metadata describes parts as simulated |
| F4 | Toast System | Always available | Action feedback; a success toast alone does not verify a backend operation |
| F5 | Global Pagination | Always available | Page through inventories and queues |
| F6 | Dataset Inventory | Always available | Inspect registered source datasets; flow J1 |
| F7 | Advanced Filtering | Always available | Narrow the dataset inventory; flow J1 |
| F8 | Multi-Column Sorting | Always available | Inspect ordered lists; verify per-table behavior rather than assume a universal multi-sort engine |
| F9 | Import Wizard | Always available | Register dataset metadata and optionally queue a job; flow J1 |

## Pipeline lifecycle capabilities

| ID | Seeded feature title | E1 selection | Purpose and principal flow |
| --- | --- | --- | --- |
| F10 | Lifecycle Tabs | Always available | Approved Catalog, New Pipelines, and Updates in the current UI; flows J2/J4/J8 |
| F11 | View Modes | Always available | Card/table presentation where offered |
| F12 | Version Grouping | Always available | Group submitted versions for inspection; flow J8 |
| F13 | Color-Coded Indicators | Always available | Distinguish submission type and state |
| F14 | Creation Wizard | Always available | Git-led new-pipeline registration; flow J2 |
| F15 | Git Integration | Always available | Repository/branch/version context; no real fetch verified; flows J2/J8 |
| F16 | Architecture View | Always available capability | Display pipeline structure; entry/detail variants also depend on F46/F47 and build/status conditions |
| F17 | Change Log | Always available | History view; richer automated content also uses F41 |
| F18 | Versioning Engine | Always available | Suggest minor versions for updates and patch versions for bug fixes; flow J8 |
| F19 | Reviewer Feedback | Always available | Review comments and revision states; flow J4 |

## Jobs and artifacts

| ID | Seeded feature title | E1 selection | Purpose and principal flow |
| --- | --- | --- | --- |
| F20 | Real-time Tracking | Always available | Display job status/progress; some progression is timer-simulated; flow J1 |
| F21 | Search & Filter | Always available | Narrow job lists; flow J6 |
| F22 | Error Clustering | Enabled: `showErrorClustering` | Surface similar failures; banner needs a matching cluster; flow J6 |
| F23 | Job Details Modal | Always available | Inspect execution context and failure steps; flow J6 |
| F24 | Retry | Always available capability | Requeue eligible failed jobs; exact buttons depend on status/ticket state; flow J6 |
| F25 | Human Support | Enabled: `showSupportTickets` | Escalate a failed job or output issue; flows J5/J6 |
| F26 | Artifact Inventory | Always available | Find outputs and review status; flow J5 |
| F27 | Details & Preview | Always available | Inspect available output metadata/preview; flow J5 |
| F28 | PHI Highlighting | Always available | Highlight supplied PHI metrics/concerns; no real detector verified; flow J5 |
| F29 | Inline Editing | Always available | Rename an artifact; current handler updates local state |
| F30 | Download Configuration | Always available | Select format and log inclusion for eligible artifacts; confirmation is simulated; flow J5 |

## Containers and global controls

| ID | Seeded feature title | E1 selection | Purpose and principal flow |
| --- | --- | --- | --- |
| F31 | Image Inventory | Enabled: `showContainerRegistry` | Inspect seeded images; requires internal, non-reviewer navigation; flow J7 |
| F32 | Vulnerability Heatmap | Enabled: `showVulnerabilityHeatmap` | Summarize supplied vulnerability counts; flow J7 |
| F33 | Orphaned Image Detection | Enabled: `showOrphanedDetection` | Flag images without a pipeline association; flow J7 |
| F34 | Tag Comparison Tool | Enabled: `showContainerRegistry` | Compare displayed versions; flow J7 |
| F35 | Image Details Modal | Enabled: `showContainerRegistry` | Inspect image metadata and pipeline usage; flow J7 |
| F36 | Internal Team View Toggle | Available; OFF for author, ON for internal steps | Footer **Internal View**; flows J4/J5/J6/J7 |
| F37 | Settings Menu | Always available | Configure E1 through the footer gear |
| F38 | Support Tickets Toggle | Enabled: `showSupportTickets` | Same state as F25/F53 |
| F39 | Support Performance Toggle | Enabled: `showSupportPerformance` | Same state as F54 |
| F40 | Jira Integration Toggle | Enabled: `showJiraIntegration` | Same state as F55 |
| F41 | Automated Change Log Toggle | Enabled: `showAutomatedChangeLog` | Additional version/change context; flows J4/J8 |
| F42 | Pipeline Sidebar Details Toggle | Enabled: `showPipelineSidebarDetails` | Input/output context and creation step; flows J2/J4 |
| F43 | Pipeline Type Dropdown Toggle | Enabled through Settings: `showPipelineTypeDropdown` | Type selector; Features Active click is incomplete; flow J2 |
| F44 | Container-based Pipelines Toggle | Enabled: `showContainerPipelines` | Container configuration fields; flow J2 |
| F45 | Container Registry Toggle | Enabled: `showContainerRegistry` | Same state as F31/F34/F35; flow J7 |
| F46 | Architecture Diff Tool Toggle | Enabled: `showArchitectureDiff` | Architecture entry for eligible pipelines; flows J4/J8 |
| F47 | Advanced Architecture Toggle | Enabled: `showAdvancedArchitecture` | Richer architecture/lineage display; flows J4/J8 |
| F48 | Vulnerability Scan Toggle | Enabled: `showVulnerabilityScan` | Detailed scan display, not a live scan trigger; flow J7 |
| F49 | Error Clustering Toggle | Enabled: `showErrorClustering` | Same state as F22; flow J6 |
| F50 | Draft Status for Updates Toggle | Enabled through Settings: `showDraftUpdates` | Draft actions; Features Active click is incomplete; flows J2/J3/J8 |
| F51 | Dry Run Simulations Toggle | Enabled: `showDryRunUpdates` | Sample/no-data dry-run UI; flow J3 |
| F52 | Dry Run Log Feature Toggle | Enabled: `isFeatureDryRunLogEnabled` | Same state as F56; flow J3 |

## Support and readiness capabilities

| ID | Seeded feature title | E1 selection | Purpose and principal flow |
| --- | --- | --- | --- |
| F53 | Support Requests | Enabled: `showSupportTickets` | Ticket workflow; flow J6 |
| F54 | Support Performance | Enabled: `showSupportPerformance` | Display support metrics; flow J6 |
| F55 | Jira Integration | Enabled: `showJiraIntegration` | Internal links and simulated Jira actions; flow J6 |
| F56 | Dry Run Log | Enabled: `isFeatureDryRunLogEnabled` | Inspect simulated run history; flow J3 |
| F57 | Readiness Gate | Enabled through Settings: `showReadinessAnalysis` | Readiness and resolution UI; Features Active lookup/click is incomplete; flow J2 |
| F58 | Guided Solutions AI Chat | Enabled through Settings: `showReadinessAnalysis` | Preview guidance in details resolution UI; not connected to a live assistant; flow J2 |
| F59 | Readiness Feature Toggle | Always-listed configuration description | `toggle: null`; does not itself switch readiness. The actual switch is Settings → Readiness Analysis & Score |

Source: seeded `INITIAL_FEATURES`, `getToggleStatus`, and actual handlers in [App.tsx](../src/App.tsx#L3264). Rows with related names often describe the control and the capability separately; they are not separate independent implementations. E1 also enables exposed settings without feature IDs, including Reviewer Dashboard and the readiness sub-settings.
