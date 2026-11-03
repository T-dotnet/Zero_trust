# MVP prototype checkpoint

The `mvp` Git branch contains an interactive frontend prototype. The default entry is the MVP; `/?view=full` opens the original application. Run `npm run dev` and open port 3000.

The prototype demonstrates dataset import, pipeline submission, mandatory Ethical → Technical → Privacy → Security review, feedback/rejection and revision, author publication, new pipeline versions, local evidence attachments/previews, simulated runs/retries/cancellation, support requests/resolution, log export, artifact validation/download, and a persisted/exportable activity history. All included MVP capabilities are enabled. The full-product feature list remains separate from this MVP's narrower scope.

Use the header role selector to switch between Researcher and the four stage reviewers. This is a demonstration of role-specific interfaces, not backend authorization. Demo records and decisions are stored locally. No authentication, real repository analysis, execution service, PHI scanning, or security enforcement is claimed. Imports stay in this browser; use synthetic data.

## Design specification

The [primary design reference](design-concept.png) established the monochrome structure. The final user direction softens it to **modern and clean**: white canvas, 224px sidebar, 60px utility header, lighter structural lines, title-case headings, dark green actions, and modest 4–5px corner rounding. No decorative graphics, gradients, shadows, or rasterized UI are used. The final direction intentionally changes the reference's heavier rules, all-caps headings, and square buttons.

Typography: Arial/sans-serif. On phones and portrait tablets, body text and form inputs are 16px, secondary labels and metadata are at least 14px, record titles are 18px, and main headings are 32–34px. Primary controls have at least 44px touch targets. Desktop typography retains the existing 42–46px headings and denser table layout. MUI supplies accessible controls and focus behavior; Lucide icons match the restrained navigation. The current review stage and required criteria appear first, with the full sequence and history disclosed on demand.

Component structure: `MvpApp` composes Shell and page components; `model` owns types, seed data, lifecycle rules, and reducer; `useWorkspace` owns local persistence and simulated execution; reusable UI primitives enforce status and stepper consistency. At widths up to 900px, list tables retain their native table roles and data but present as labelled cards, so record actions and status stay visible. Tablet cards use two columns; phone cards use one. Navigation becomes a mobile drawer, review columns stack, and output samples also use readable cards. Wide CSV import previews retain local scrolling.

The original catalog reference used the following primary copy; task-specific actions now adapt to the acting role: Zero Trust, Research workspace, Overview, Datasets, Pipelines, Runs & results, Approvals, Activity log, Clinical Research, MVP prototype, Workspace, Demo mode, Researcher, Pipelines, From research code to approved, reproducible workflows., View approvals, New pipeline, Total pipelines, Approved, In review, All pipelines, All categories, Search pipelines..., Pipeline, Version, Category, Review progress, Updated, Actions, Run, Review, Every pipeline follows a clear path, Explore the review process, Your work is saved in this browser.

Intentional extensions: dialogs, dataset/run/output pages, responsive mobile navigation, reset/help controls, review-role guidance, and required-comment validation implement the requested interactive workflow in the same visual system. Review checklist items start unchecked to demonstrate explicit reviewer acknowledgment. Counters derive from actual demo state. Status dots reflect completed stages correctly even where the generated concept's dots are inconsistent. Publication remains a separate author action after all four approvals.


## Approval rules in this MVP

Every new submission, new version, and resubmitted revision demonstrates all four stages. Revisions restart at Ethical review and retain previous history. An approved previous version remains available while its new version is reviewed. This is a deliberate MVP demonstration rule; the original full app's updates normally begin at Technical review. Stage-specific decisions and final publication are guarded in the local state model, but there is no backend permission enforcement.

## Verification

Run `npm run lint`, `npm run build`, and `npm run test:mvp`. The automated browser suite uses local Chromium (`/usr/bin/chromium` by default; override with `CHROMIUM_PATH`) and port 3000. Model checks cover stage order, reviewer restrictions, author publication, revision history, support, cancellation, and artifact validation. Browser tests cover the complete submission-to-download journey, feedback/resubmission, mobile import/reset, new versions with evidence preview, and failure recovery. Role switching, execution, and external integrations remain simulated.

The expanded audit suite also covers invalid CSV replacement, quoted multiline records, mismatched columns, missing requirements, reserved version numbers, saved-data corruption, CSV export contents, evidence limits and reattachment, keyboard dialog dismissal, run recovery after reload, storage warning recovery, and all six screens on narrow phone/tablet widths. Pipeline and version context is retained in decision history; exports use a standard CSV header with provenance columns.

## Walkthrough shortcuts and task-focused UX

A discreet **Simulation controls** link sits below the sidebar guide. **Demo mode** in the desktop/tablet header opens the same panel. On phones use **Workspace options → Simulation controls**, or the discreet link inside the navigation drawer. Run and artifact dialogs provide the link too. This lets a single person demonstrate events that normally require another participant or a system:

- Simulate the current stage approval, or every remaining required review. Each stage receives its own history entry marked as simulated.
- Simulate author publication as a separate event after all four approvals.
- Complete waiting simulated runs; their outputs still await validation.
- Simulate Privacy reviewer acceptance of a pending output to demonstrate sample download.

The controls change local demo state only. Normal review actions still require the assigned role and all three evidence confirmations. Draft/revision completeness rules are enforced at submission. Reviewer queues default to **My tasks**, with **All submissions** available for oversight. The Approvals badge counts current pipeline tasks for the acting role.

Authors see a tracking receipt, named next owner and expected next step. Reviewers see a compact current-stage summary and a single criteria/comment/decision sequence. Source metadata, the full path and history are disclosed on demand. Rejection asks for confirmation with the affected pipeline/version and reason.

Named working drafts can omit submission fields. Revision drafts persist separately from the reviewed version; saving one keeps its status, version, approvals and requested changes. Explicit resubmission advances the version, restarts all four stages and retains history. Requested changes remain visible throughout the revision wizard. The final summary includes branch, category, evidence names, destination reviewer and section-specific Edit actions.

Import switches to a compact selected-file row, with Replace/Remove and an expandable column/sample preview. Only column names and metadata persist; sample rows are discarded on close. Run setup shows dataset columns and checks format compatibility, explicitly identifying that schema mapping is not verified. Failed-run retry is labelled **Retry demo with example mapping** and does not claim to edit source data.

Completed runs distinguish execution status from output validation and offer a direct output action. Artifact decisions start without a preselected outcome. Synthetic fixtures follow recognized output contracts; unsupported contracts get an explicit generic-preview notice. Accepted/rejected outputs display a reviewer/time/comment receipt. Activity supports search, entity/event/date filtering, entity navigation, and export of the filtered events.

Additional regression coverage verifies incomplete draft persistence, working revisions, role-aware queues, first-viewport mobile criteria, neutral artifact decisions, disclaimer contrast, output-contract snapshots, all simulation shortcuts, and filtered activity exports. Browser evidence is captured separately during verification; it does not establish full WCAG compliance or real backend authorization.

Mobile readability is always active at the responsive breakpoint and needs no feature toggle. Phone dialogs use the available width, primary footer actions take a full row, and transient notifications appear near the top so they do not cover download or submission controls. Regression tests cover readable type sizes, touch targets, card/action visibility at 320px, 390px and 768px, and the complete mobile submission-to-download simulation.

Current UI previews: [pipeline catalog](screenshots/pipelines.png) and [review screen](screenshots/approval.png). These are rendered prototype screenshots rather than the earlier design concept.
