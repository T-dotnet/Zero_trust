# MVP prototype checkpoint

The `mvp` Git branch contains an interactive frontend prototype. The default entry is the MVP; `/?view=full` opens the original application. Run `npm run dev` and open port 3000.

The prototype demonstrates dataset import, pipeline submission, mandatory Ethical → Technical → Privacy → Security review, feedback/rejection and revision, author publication, new pipeline versions, local evidence attachments/previews, simulated runs/retries/cancellation, support requests/resolution, log export, artifact validation/download, and a persisted/exportable activity history. All included MVP capabilities are enabled. The full-product feature list remains separate from this MVP's narrower scope.

Use the header role selector to switch between Researcher and the four stage reviewers. This is a demonstration of role-specific interfaces, not backend authorization. Demo records and decisions are stored locally. No authentication, real repository analysis, execution service, PHI scanning, or security enforcement is claimed. Imports stay in this browser; use synthetic data.

## Design specification

The current visual reference is [Stripe](https://stripe.com/). The MVP adapts that direction to the existing research workspace: a white canvas, cool neutral sidebar, navy text, violet primary actions, lighter dividers, and restrained rounding. This is a styling reference, not a clone of Stripe's marketing layout. The [earlier design concept](design-concept.png) established the workspace structure; its heavier rules, all-caps headings and square controls are historical. The 224px sidebar, 60px desktop utility header, navigation, table layouts and workflow remain in place. Subtle menu/dialog shadows clarify floating surfaces; no decorative imagery or marketing sections are added.

Typography: self-hosted variable Inter with system sans-serif fallbacks; its SIL Open Font License is included in `public/fonts`. Mobile type uses rem units: at the default browser size, body text and form inputs are 16px, secondary labels and metadata are at least 14px, record titles are 18px, and main headings are 32–34px. Primary controls have at least 48px touch targets. Larger browser text preferences increase the type and cause controls and grids to reflow. Desktop headings are 40–42px, with readable table titles, descriptions, and controls. MUI and workspace CSS share color/font tokens from `src/mvp/designTokens.ts`, including portal dialogs and menus. Success, warning and error colors remain distinct from the violet action color. MUI supplies accessible controls and focus behavior; Lucide icons match the restrained navigation. The current review stage and required criteria appear first, with the full sequence and history disclosed on demand. The visual refinement is always on and has no feature or settings toggle.

Reference access: Stripe's homepage and [app styling documentation](https://docs.stripe.com/stripe-apps/style) were readable through the web reader. A live rendered capture of Stripe was blocked by the environment's network policy, so this update does not claim pixel fidelity or verified Stripe mobile behavior. The local MVP is independently checked in desktop and mobile Chromium.

Component structure: `MvpApp` composes Shell and page components; `model` owns types, seed data, lifecycle rules, and reducer; `useWorkspace` owns local persistence and simulated execution; reusable UI primitives enforce status and stepper consistency. At widths up to 900px, list tables retain their native table roles and data but present as labelled cards, so record actions and status stay visible. Tablet grids add a second column only when each card has at least 20rem of space; phone cards use one column. Fields within cards also collapse when their minimum readable width no longer fits. Navigation becomes a 280px drawer, bounded by the screen width, with an explicit close control. Review columns stack, and output samples also use readable cards. Wide CSV import previews retain local scrolling.

### Mobile spacing and reflow

The layout adapts [Android's 4/8dp spacing grid](https://developer.android.com/design/ui/mobile/guides/layout-and-content/grids-and-units), [compact-screen margins](https://developer.android.com/design/ui/mobile/guides/layout-and-content/content-structure), [48dp touch target guidance](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-touch-target-sizes), and [Apple's layout guidance](https://developer.apple.com/design/human-interface-guidelines/layout). Apple also recommends [44pt minimum hit targets](https://developer.apple.com/design/tips/). These are native design references; this web prototype implements its dimensions in CSS px and rem.

- Related controls use 8–16px gaps, with 24px between major sections and at least 16px phone gutters. Header, main content, drawer and task dialogs respect safe-area insets.
- Header and record actions fill the available columns, stacking when their readable minimum width no longer fits. Overview metrics use two columns on phones. Role labels wrap as needed, and notifications remain below the measured header height.
- Below 600px, the pipeline status selector replaces the horizontally clipped tab strip. Category choices are behind **Filters**, with a visible removable category label when active. Status, category and search remain selected when resizing. Two-option queues keep both tabs visible.
- `WorkspaceDialog` uses a full-screen task view below 600px and in mobile windows shorter than 480px. Forms, imports, run setup, output review, evidence previews and simulation controls share this treatment. Confirmation prompts remain compact.
- Task titles and footer actions stay separate from the scrolling content. All labelled CTAs fill their available container width at the mobile breakpoint, including page/card actions, dialog footers, attachments, filters and support. They remain stacked in landscape. Long pipeline and dataset selections wrap so their names remain readable. The pipeline form shows the current step in one compact line, and changing steps returns the content to the top. Opening a record or navigating to another page also starts at its heading, rather than retaining a long list's scroll position.

`DialogActionBar` gives task and confirmation footers an explicit primary action. On mobile every action has its own full-width row: primary first, followed by secondary actions and then quiet dismissal/simulation controls. The DOM follows the same priority, so keyboard and screen-reader order match the visible stack. This also applies to short landscape windows. Examples: Continue/Submit → Save draft → Back/Cancel; Import → Cancel; Start run → Cancel; Retry/Inspect output → Export log → Close. Explicit rejection/reset confirmations keep their destructive primary action first and use the error color. Navigation, dialog close, and attachment removal icons retain their compact 48px touch targets.

Output review promotes the next available action to the first footer row: continue as Privacy reviewer, choose/confirm a decision, then download the validated sample. Simulation controls stay secondary. Attachment actions wrap below their heading when needed, filenames wrap without pushing Remove off-screen, and support forms put Create support request above Cancel. These layout and action-hierarchy rules are always on.

Verification covers 320px phones, 600/768px tablet layouts, 844×390 landscape windows, larger browser text, filter persistence across resizing, and the complete solo workflow. Short viewport checks exercise the layout under reduced height; they do not substitute for testing an actual iOS or Android keyboard and browser.

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

Mobile readability and adaptive layout are always active at the responsive breakpoints and need no feature toggle. Phone task dialogs use the full available screen, primary footer actions take a full row, and transient notifications appear below the header so they do not cover download or submission controls. Regression tests cover readable type sizes, 48px touch targets, card/action visibility, responsive status/category filtering, larger reading text, short windows, and the complete mobile submission-to-download simulation.

Current UI previews: [pipeline catalog](screenshots/pipelines.png) and [review screen](screenshots/approval.png). These are rendered prototype screenshots rather than the earlier design concept.
