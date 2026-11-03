# MVP prototype checkpoint

The `mvp` Git branch contains an interactive frontend prototype. The default entry is the MVP; `/?view=full` opens the original application. Run `npm run dev` and open port 3000.

The prototype demonstrates dataset import, pipeline submission, mandatory Ethical → Technical → Privacy → Security review, feedback/rejection and revision, author publication, new pipeline versions, local evidence attachments/previews, simulated runs/retries/cancellation, support requests/resolution, log export, artifact validation/download, and a persisted/exportable activity history. All included MVP capabilities are enabled. The full-product feature list remains separate from this MVP's narrower scope.

Use the header role selector to switch between Researcher and the four stage reviewers. This is a demonstration of role-specific interfaces, not backend authorization. Demo records and decisions are stored locally. No authentication, real repository analysis, execution service, PHI scanning, or security enforcement is claimed. Imports stay in this browser; use synthetic data.

## Design specification

The [primary design reference](design-concept.png) established the monochrome structure. The final user direction softens it to **modern and clean**: white canvas, 224px sidebar, 60px utility header, lighter structural lines, title-case headings, dark green actions, and modest 4–5px corner rounding. No decorative graphics, gradients, shadows, or rasterized UI are used. The final direction intentionally changes the reference's heavier rules, all-caps headings, and square buttons.

Typography: Arial/sans-serif; main headings 34px on mobile and 42–46px on desktop, section headings 23px, readable 12–14px controls/body text, and 10–11px metadata. MUI supplies accessible controls and focus behavior. Lucide outline icons match the restrained navigation and action icons. Tables retain horizontal scrolling within their own container on mobile; review stages and columns stack.

Component structure: `MvpApp` composes Shell and page components; `model` owns types, seed data, lifecycle rules, and reducer; `useWorkspace` owns local persistence and simulated execution; reusable UI primitives enforce status and stepper consistency. Pipeline tables remain tables at narrow widths with local horizontal scrolling; navigation becomes a mobile drawer and review columns stack.

Allowed primary copy follows the pipeline concept: Zero Trust, Research workspace, Overview, Datasets, Pipelines, Runs & results, Approvals, Activity log, Clinical Research, MVP prototype, Workspace, Demo mode, Researcher, Pipelines, From research code to approved, reproducible workflows., View approvals, New pipeline, Total pipelines, Approved, In review, All pipelines, All categories, Search pipelines..., Pipeline, Version, Category, Review progress, Updated, Actions, Run, Review, Every pipeline follows a clear path, Explore the review process, Your work is saved in this browser.

Intentional extensions: dialogs, dataset/run/output pages, responsive mobile navigation, reset/help controls, review-role guidance, and required-comment validation implement the requested interactive workflow in the same visual system. Review checklist items start unchecked to demonstrate explicit reviewer acknowledgment. Counters derive from actual demo state. Status dots reflect completed stages correctly even where the generated concept's dots are inconsistent. Publication remains a separate author action after all four approvals.


## Approval rules in this MVP

Every new submission, new version, and resubmitted revision demonstrates all four stages. Revisions restart at Ethical review and retain previous history. An approved previous version remains available while its new version is reviewed. This is a deliberate MVP demonstration rule; the original full app's updates normally begin at Technical review. Stage-specific decisions and final publication are guarded in the local state model, but there is no backend permission enforcement.

## Verification

Run `npm run lint`, `npm run build`, and `npm run test:mvp`. The automated browser suite uses local Chromium (`/usr/bin/chromium` by default; override with `CHROMIUM_PATH`) and port 3000. Model checks cover stage order, reviewer restrictions, author publication, revision history, support, cancellation, and artifact validation. Browser tests cover the complete submission-to-download journey, feedback/resubmission, mobile import/reset, new versions with evidence preview, and failure recovery. Role switching, execution, and external integrations remain simulated.
