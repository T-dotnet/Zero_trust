# MVP prototype checkpoint

The current working revision includes the UX audit fixes: protected imports, per-tab review/assessment drafts, record URLs and filter restoration, navigation focus and page titles, role-specific task queues, compact phone summaries, required-column checks, criterion-to-evidence links and recorded demo exceptions, distinct retry attempts, date-range validation, stronger neutral input boundaries, and consistent synthetic sample counts. Authentication, real execution and shared enforcement remain pilot work. The exported walkthroughs and screenshots below represent the earlier checkpoint until recaptured.

[High-level customer journey](customer-journey.md) · [Screenshot walkthrough](https://zero-trust-git-mvp-t-dotnets-projects.vercel.app/mvp-customer-journey.html) · [PDF](https://zero-trust-git-mvp-t-dotnets-projects.vercel.app/mvp-customer-journey.pdf)

The customer journey presents eight customer-level stages with 16 fresh MVP screenshots, customer goals, role handoffs, success signals, hypothesized pains/gains, recovery paths and linked user stories. It distinguishes the four method reviews, author publication, and the later output Privacy decision. The screenshot run used normal review controls; the existing simulation shortcuts remain available.

[Screen-by-screen flow reference](screen-flows.md) · [Clickable wireframes and attached user stories](https://zero-trust-git-mvp-t-dotnets-projects.vercel.app/mvp-flows.html)

The flow atlas covers 41 screen states, 12 journeys and a user story attached to every state. Its action tables include conditions, destination, side effects, role handoffs and recovery. It documents this MVP checkpoint; the full-workspace flows elsewhere in `docs` describe the archived app. All included MVP features are always on.

The `mvp` Git branch contains an interactive frontend prototype. The default entry is the MVP; `/?view=full` opens the original application. Run `npm run dev` and open port 3000.

The prototype demonstrates dataset import, pipeline submission, mandatory Ethical → Technical → Privacy → Security review, feedback/rejection and revision, author publication, new pipeline versions, local evidence attachments/previews, simulated runs/retries/cancellation, support requests/resolution, log export, artifact validation/download, and a persisted/exportable activity history. All included MVP capabilities are enabled. The full-product feature list remains separate from this MVP's narrower scope.

Use the header role selector to switch between Researcher and the four stage reviewers. This is a demonstration of role-specific interfaces, not backend authorization. Demo records and decisions are stored locally. No authentication, real repository analysis, execution service, PHI scanning, or security enforcement is claimed. Imports stay in this browser; use synthetic data.

## Design specification

ReadyAI's reference swatches remain available: **mint `#2BE1B0`**, **slate `#8C91A4`**, **amber `#FEAB3D`**, and **coral `#F8506D`**. Their use in the current workspace is deliberately restrained. Mint with dark ink `#18212F` identifies the main page or task action. Repeated table/card actions are outlined. Navigation, avatars, selected tabs and form controls use neutral surfaces and dark labels. Focus outlines remain visible.

Normal review and execution progress is neutral, rather than a traffic-light display: completed steps use slate and checkmarks, the current step is darker and larger, and pending steps have dashed outlines. Counts and explicit labels remain visible. Compact status labels retain semantic colour: green for approved/ready/completed, amber for waiting/in review/changes requested, coral for errors/rejections, and grey for neutral states. Colour stays concentrated in those labels rather than repeated in the progress graphics, navigation and panels. Alert bodies and review headers stay neutral, with small warning/error accents where attention is required. Routine review and execution progress graphics remain neutral.

The earlier [Stripe reference](https://stripe.com/) informed spacing and typography; the [early design concept](design-concept.png) remains historical. The sidebar, navigation, task hierarchy and mobile CTA ordering retain their established structure. Earlier screenshots and exported flow/journey documents record the previous checkpoint and have not been recaptured for this local colour revision.

CTA labels use short verbs and nouns, such as **Configure retry**, **Approve review** and **Switch role**. **Start demo run** makes the execution boundary explicit. The active reviewer and input-check limitations stay in adjacent copy. Desktop action groups wrap whole buttons; phone task actions remain full width and wrap only between words. The review workspace becomes one column below 1100px. These refinements are always on.

Pipeline and approval lists also show visible approved-review counts, such as **1/4**, beside their markers. Pending stage circles have dashed slate outlines. Blocked stages explicitly say **Changes requested** or **Rejected**. Later steps in failed or cancelled runs say **Not run**; steps awaiting execution in an active run remain **Pending**. These refinements are always on.

Progress examples: [review stages](screenshots/review-progress.png), [mobile pipeline form](screenshots/pipeline-form-mobile.png), and [active execution](screenshots/execution-progress.png).

Typography: self-hosted variable Inter with system sans-serif fallbacks; its SIL Open Font License is included in `public/fonts`. Mobile type uses rem units: at the default browser size, body text and form inputs are 16px, secondary labels and metadata are at least 14px, record titles are 18px, and main headings are 32–34px. Primary controls have at least 48px touch targets. Larger browser text preferences increase the type and cause controls and grids to reflow. Desktop headings are 40–42px, with readable table titles, descriptions, and controls. MUI, workspace CSS, documentation and diagrams share the semantic palette in `src/mvp/palette.mjs`; `src/mvp/designTokens.ts` exposes the CSS/font tokens, including portal dialogs and menus. Explicit status labels use semantic text, tinted backgrounds and matching borders; surrounding panels and progress graphics stay neutral. MUI supplies accessible controls and focus behavior; Lucide icons match the restrained navigation. The current review stage and required criteria appear first, with the full sequence and history disclosed on demand. The visual refinement is always on and has no feature or settings toggle.

Earlier reference access: Stripe's homepage and [app styling documentation](https://docs.stripe.com/stripe-apps/style) were readable through the web reader. A live rendered capture of Stripe was blocked by the environment's network policy, so this update does not claim pixel fidelity or verified Stripe mobile behavior. The local MVP is independently checked in desktop and mobile Chromium.

Component structure: `MvpApp` composes Shell and page components; `model` owns types, seed data, lifecycle rules, and reducer; `useWorkspace` owns local persistence and simulated execution; reusable UI primitives enforce status and stepper consistency. At widths up to 900px, list tables retain their native table roles and data but present as labelled cards, so record actions and status stay visible. Tablet grids add a second column only when each card has at least 20rem of space; phone cards use one column. Fields within cards also collapse when their minimum readable width no longer fits. Navigation becomes a 280px drawer, bounded by the screen width, with an explicit close control. Review columns stack, and output samples also use readable cards. Wide CSV import previews retain local scrolling.

### Mobile spacing and reflow

The layout adapts [Android's 4/8dp spacing grid](https://developer.android.com/design/ui/mobile/guides/layout-and-content/grids-and-units), [compact-screen margins](https://developer.android.com/design/ui/mobile/guides/layout-and-content/content-structure), [48dp touch target guidance](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-touch-target-sizes), and [Apple's layout guidance](https://developer.apple.com/design/human-interface-guidelines/layout). Apple also recommends [44pt minimum hit targets](https://developer.apple.com/design/tips/). These are native design references; this web prototype implements its dimensions in CSS px and rem.

- Related controls use 8–16px gaps, with 24px between major sections and at least 16px phone gutters. Header, main content, drawer and task dialogs respect safe-area insets.
- Header and record actions fill the available columns, stacking when their readable minimum width no longer fits. Overview metrics use two columns on phones. Role labels wrap as needed, and notifications remain below the measured header height.
- Below 600px, the pipeline status selector replaces the horizontally clipped tab strip. Category choices are behind **Filters**, with a visible removable category label when active. Status, category and search remain selected when resizing. Two-option queues keep both tabs visible.
- `WorkspaceDialog` uses a full-screen task view below 600px and in mobile windows shorter than 480px. Forms, imports, run setup, output review, evidence previews and simulation controls share this treatment. Confirmation prompts remain compact.
- Task titles and footer actions stay separate from the scrolling content. All labelled CTAs fill their available container width at the mobile breakpoint, including page/card actions, dialog footers, attachments, filters and support. They remain stacked in landscape. Long pipeline and dataset selections wrap so their names remain readable. The pipeline form shows the current step in one compact line, and changing steps returns the content to the top. Opening a record or navigating to another page also starts at its heading, rather than retaining a long list's scroll position.

`DialogActionBar` gives task and confirmation footers an explicit primary action. On mobile every action has its own full-width row: primary first, followed by secondary actions and then quiet dismissal/simulation controls. The DOM follows the same priority, so keyboard and screen-reader order match the visible stack. This also applies to short landscape windows. Examples: Continue/Submit → Save draft → Back/Cancel; Import → Cancel; Start demo run → Cancel; Configure retry/Inspect output → Export log → Close. Explicit rejection/reset confirmations keep their destructive primary action first and use the error color. Navigation, dialog close, and attachment removal icons retain their compact 48px touch targets.

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

The controls change local demo state only. Normal review actions still require the assigned role and all three evidence confirmations. Each criterion opens its evidence source for the current version; missing readable evidence requires a recorded demo-exception rationale. Draft/revision completeness rules are enforced at submission. Reviewer queues default to **My tasks**, with **Waiting on others** and **All submissions** available for tracking. The Approvals badge counts current pipeline tasks for the acting role.

Authors see a tracking receipt, named next owner and expected next step. Reviewers see a compact current-stage summary and a single criteria/comment/decision sequence. Source metadata, the full path and history are disclosed on demand. Rejection asks for confirmation with the affected pipeline/version and reason.

Named working drafts can omit submission fields. Revision drafts persist separately from the reviewed version; saving one keeps its status, version, approvals and requested changes. Explicit resubmission advances the version, restarts all four stages and retains history. Requested changes remain visible throughout the revision wizard. The final summary includes branch, category, evidence names, destination reviewer and section-specific Edit actions.

Import switches to a compact selected-file row, with Replace/Remove and an expandable column/sample preview. Closing an unfinished import asks before discarding selected data or metadata. Only column names and metadata persist after import; sample rows are discarded. Run setup checks format and declared required columns, while explaining that types, values and schema mapping are not verified. Missing declared columns block starting; unspecified requirements need an explicit demo-only acknowledgment. **Configure retry** opens input selection and creates a separate attempt, retaining the original error, log and history.

Completed runs distinguish execution status from output validation and offer a direct output action. Artifact decisions start without a preselected outcome. Synthetic fixtures follow recognized output contracts; unsupported contracts get an explicit generic-preview notice. Accepted/rejected outputs display a reviewer/time/comment receipt. Activity supports search, entity/event/date filtering, entity navigation, and export of the filtered events.

Additional regression coverage verifies incomplete draft persistence, working revisions, role-aware queues, first-viewport mobile criteria, neutral artifact decisions, disclaimer contrast, output-contract snapshots, all simulation shortcuts, and filtered activity exports. Browser evidence is captured separately during verification; it does not establish full WCAG compliance or real backend authorization.

Mobile readability and adaptive layout are always active at the responsive breakpoints and need no feature toggle. Phone task dialogs use the full available screen, primary footer actions take a full row, and transient notifications appear below the header so they do not cover download or submission controls. Regression tests cover readable type sizes, 48px touch targets, card/action visibility, responsive status/category filtering, larger reading text, short windows, and the complete mobile submission-to-download simulation.

Earlier checkpoint previews: [pipeline catalog](screenshots/pipelines.png) and [review screen](screenshots/approval.png). These rendered prototype screenshots predate the current colour and UX fixes.

## Post MVP roadmap

The [product roadmap](../post-mvp-roadmap.md) is linked to both the [screen flows](screen-flows.md#post-mvp-roadmap) and [customer journey](customer-journey.md#post-mvp-roadmap). Open the [published roadmap](https://zero-trust-git-mvp-t-dotnets-projects.vercel.app/post-mvp-roadmap.html) for priorities, dependencies, release groups and acceptance criteria. No delivery dates are assigned. Planned additions are labelled separately from current MVP screens and captured behavior.

The atlas now includes the implemented save/discard confirmation and protected workspace recovery path, alongside the original workflows. Regenerate the published HTML and journey PDF with the existing documentation scripts after changing source content.
