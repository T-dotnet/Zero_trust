# Internal vs External User View

This document explains the difference between "Internal Team View" and the default "(External) User" view in the Data Pipeline Management Platform.

## Overview

The platform features an "Internal Team View" toggle, which allows authorized users (reviewers) to switch between a standard view and an administrative view.

## Internal Team View (Toggle ON)

When the "Internal Team View" toggle is enabled:

*   **Administrative Actions:** Reviewers gain access to administrative actions, such as:
    *   **Submit:** Manually move a 'Draft' submission into the 'Technical Review' queue.
    *   **Advance:** Manually advance a pipeline through the multi-stage review lifecycle (Technical -> Privacy -> Security -> Approved).
    *   **Submit New Version:** Propose updates for non-user-generated pipelines.
*   **Detailed Status Information:** Pipeline status indicators for 'Draft', 'Ethical Review', 'Technical Review', 'Privacy Review', and 'Security Review' are visible.
*   **Detailed Progress Text:** Progress messages are more detailed, reflecting administrative actions (e.g., "Awaiting Researcher" vs "Action Required").
*   **JIRA Links:** JIRA ticket links are visible in ticket and artifact details (if the Jira Integration toggle is also ON).

## (External) User View (Toggle OFF)

When the "Internal Team View" toggle is disabled (default):

*   **Standard View:** Users see the standard, non-administrative interface.
*   **Administrative Actions Hidden:** Administrative buttons (Submit, Advance, Submit New Version) are hidden.
*   **Simplified Status Information:** Pipeline status indicators for review stages are hidden.
*   **Simplified Progress Text:** Progress messages are simplified for standard users.
*   **JIRA Links Hidden:** JIRA ticket links are hidden.
*   **Final Publication Status:** A specific status message ("Ready for final publication") for pipelines in 'Security Review' is shown.
