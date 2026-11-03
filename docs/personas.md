# Personas, objectives, pains, and gains

[Documentation home](README.md) · [Settings reference](settings-and-feature-toggles.md) · [User flows](user-flows.md)

All persona flows use [E1: all exposed capability settings ON](feature-list.md#e1--canonical-all-features-enabled-configuration); the settings called out per persona are the most relevant subset. Internal View changes with the actor.

These personas are reverse engineered from the source and requirements. Role names are grounded in repository evidence; pains, gains, and proposed success measures are hypotheses to validate. One person may perform several roles. No fictional demographics, interview quotations, or proven business outcomes are assumed.

## Product objective

Help research teams register data, introduce or reuse processing pipelines, coordinate review, understand execution problems, and inspect outputs. The central coordination problem is: **what can I do next, what is blocking progress, and who needs to act?**

## Persona overview

| ID and persona | Objective / job to be done | Pains the design addresses | Intended gains | Main flows |
| --- | --- | --- | --- | --- |
| **P1 Researcher / clinical data user** | Use a suitable approved pipeline on a dataset and judge the resulting output | Reliance on specialists; unclear dataset-to-job-to-output relationships; uncertainty about status and next steps | More self-service; understandable progress; inspectable outputs | [J1](user-flows.md#j1-import-data-and-queue-an-approved-pipeline), [J5](user-flows.md#j5-inspect-validate-or-review-an-artifact), [J6](user-flows.md#j6-diagnose-a-failure-and-coordinate-support) |
| **P2 Data scientist / pipeline developer** | Make a custom algorithm available in the platform and maintain versions | Environment mismatch; dependencies discovered late; unclear rejection feedback; repeated review work | Earlier feedback; actionable fixes; version traceability; predictable handoffs | [J2](user-flows.md#j2-create-a-custom-pipeline-and-confirm-a-build), [J3](user-flows.md#j3-dry-run-and-submit-a-draft), [J4](user-flows.md#j4-review-revise-and-publish-a-pipeline), [J8](user-flows.md#j8-submit-an-update-or-bug-fix) |
| **P3 Technical reviewer / platform engineer** | Assess whether a submitted pipeline is technically suitable | Incomplete requirements; difficult version comparison; ambiguity over whose action is pending | Reviewable context; explicit feedback; visible review progression | [J4](user-flows.md#j4-review-revise-and-publish-a-pipeline), [J8](user-flows.md#j8-submit-an-update-or-bug-fix) |
| **P4 Privacy / compliance reviewer** | Assess privacy concerns in processing and outputs | Residual sensitive information; unclear reasons for output flags; pressure to accept results prematurely | Visible PHI concerns; explicit acceptable/unacceptable decisions; clearer revision requests | [J4](user-flows.md#j4-review-revise-and-publish-a-pipeline), [J5](user-flows.md#j5-inspect-validate-or-review-an-artifact) |
| **P5 Security / DevSecOps engineer** | Understand container risk and which pipelines depend on an image | Vulnerable versions; scattered image metadata; unclear usage; unused images | Risk prioritization; tag comparison; image-to-pipeline visibility | [J7](user-flows.md#j7-inspect-container-risk-and-usage), [J4](user-flows.md#j4-review-revise-and-publish-a-pipeline) |
| **P6 Support / infrastructure operator** | Diagnose execution failures and coordinate recovery | Poor failure context; duplicate requests; infrastructure incidents appearing as isolated failures | Faster triage; categorized requests; explicit resolution; informed retries | [J6](user-flows.md#j6-diagnose-a-failure-and-coordinate-support) |
| **P7 Data lead / review coordinator** | Keep submissions moving and make exceptions explicit | Stalled handoffs; unclear reviewer/author responsibility; unexplained exceptions | Visible next owner; recorded rationale; better queue oversight | [J2](user-flows.md#j2-create-a-custom-pipeline-and-confirm-a-build), [J4](user-flows.md#j4-review-revise-and-publish-a-pipeline) |

## P1 — Researcher / clinical data user

**Context and objective.** Has research data and wants processing results without authoring or managing the underlying runtime. The survey explicitly includes researchers and clinical data managers with different technical proficiency levels.

**Trigger and work.** A new dataset arrives or an experiment needs an approved processing method. Import metadata, choose a pipeline, queue work, monitor jobs, and inspect artifacts.

**Pain → feature → gain.** An approved catalog reduces the burden of finding processing logic; dataset and job links help explain progress; previews and status badges help users decide whether an output needs attention. These are intended usability gains, not proof of scientific validity.

**Selected configuration.** J1 uses **Internal View OFF**, `isReviewerView=false`, **IA Layout = Current Layout**. Basic import/run views have no extra feature switch; E1 still keeps all capability settings ON. J5 adds an explicit internal/external handoff for output issues. J6 selects **Support Tickets ON** when escalation is included.

**Evidence.** [Survey audience and proficiency](../jj_user_validation_survey.md#section-1-user-profile), dataset and artifact stories in [USER_STORIES.md](../USER_STORIES.md).

## P2 — Data scientist / pipeline developer

**Context and objective.** Owns custom processing code and needs to adapt it to platform expectations, get it reviewed, and maintain it after publication.

**Trigger and work.** A new algorithm, model, feature update, or code failure requires a pipeline submission. Connect Git, inspect readiness findings, record requirements, confirm a build, optionally dry-run, submit, and respond to reviewers.

**Pain → feature → gain.** Readiness findings aim to move compatibility feedback earlier; guided actions reduce searching for fixes; draft and version workflows reduce the cost of iteration. The current findings and dry-run results are simulated.

**Selected configuration.** J2 selects **Readiness Analysis & Score ON**, **Quality Gates ON**, **Container-based Pipelines ON**, **Pipeline Sidebar Details ON**, **Pipeline Type Dropdown ON**, and **Draft Status for Updates ON**. J3 uses the already-enabled **Dry Run Simulations** and **Dry Run Log Feature**. **Internal View OFF** exposes the author draft actions. J2 documents the current stopping point with strict gates enabled.

**Evidence.** [Pipeline stories](../USER_STORIES.md#epic-1-pipeline-management), [readiness stories](../USER_STORIES.md#epic-7-readiness-analysis--guided-solutions), actual `handleCreatePipeline`, `handleSubmitNewVersion`, and `handleDryRun` in [App.tsx](../src/App.tsx).

## P3 — Technical reviewer / platform engineer

**Context and objective.** Reviews submitted versions and decides whether to advance, request feedback, or reject.

**Trigger and work.** A submission enters the relevant queue. Inspect repository/version context, input/output requirements, architecture, history, and any test evidence; submit a review decision.

**Pain → feature → gain.** Centralized submission details and author/reviewer progress messages aim to reduce clarification loops. Version grouping and change views support review context, but do not establish a real Git fetch or verified diff.

**Selected configuration.** J4 selects **Internal View ON** during review and OFF for author revision/publication. **Architecture Diff Tool ON**, **Advanced Architecture ON**, **Automated Change Log ON**, and **Pipeline Sidebar Details ON** are chosen for the richer review view. These extra switches do not grant review authority. **Reviewer Dashboard ON** alone does not activate reviewer navigation.

**Evidence.** Reviewer user stories and `handleReviewSubmit` in [App.tsx](../src/App.tsx#L5394).

## P4 — Privacy / compliance reviewer

**Context and objective.** Reviews privacy implications of a pipeline and artifacts with output concerns. Technical suitability and privacy acceptance are separate decisions.

**Trigger and work.** A pipeline reaches Privacy Review, or an artifact has `Pending` / `Output Issue` status. Inspect the available evidence and decide whether the output is acceptable.

**Pain → feature → gain.** PHI proportion highlighting makes a specific concern visible. Artifact review distinguishes `Validated` from `Not Acceptable`, helping users avoid treating every completed job as a usable output.

**Selected configuration.** J5 uses **Internal View ON** for **Submit Review** on an `Output Issue`. PHI Highlighting (feature F28) has **no associated feature toggle**. A `Pending` artifact's **Validate Artifact** action is not gated by Internal View in the current UI.

**Evidence.** [Compliance story US3.5](../USER_STORIES.md#us35-phi-proportion-highlighting-for-output-issues), `handleValidateArtifact` and `handleSubmitArtifactReview` in [App.tsx](../src/App.tsx#L5682).

## P5 — Security / DevSecOps engineer

**Context and objective.** Inspects container versions, displayed vulnerability counts, and associated pipeline usage; may also participate in Security Review.

**Trigger and work.** An image appears risky, an update needs comparison, or unused images need investigation. Open the registry, compare tags, inspect details, and identify dependencies.

**Pain → feature → gain.** Heatmaps and tag comparison aim to speed prioritization; associated pipelines show the potential scope of a change; orphan badges support cleanup investigation. An orphan badge does not itself perform cleanup.

**Selected configuration.** J7 uses **Internal View ON**, `isReviewerView=false`, **Container Registry ON**, **Vulnerability Heatmap ON**, **Vulnerability Scan ON**, and **Orphaned Image Detection ON**. The scan switch is initially OFF and controls displayed detail, not a verified scanner.

**Evidence.** [Container registry stories](../USER_STORIES.md#epic-6-container-registry-container-registry), seeded `mockContainers` and registry rendering in [App.tsx](../src/App.tsx).

## P6 — Support / infrastructure operator

**Context and objective.** Coordinates investigation and recovery for reported job or output failures.

**Trigger and work.** A user requests human support or several jobs show similar failures. Inspect item context, move a ticket to In Progress, add a resolution, and coordinate a retry or pipeline fix.

**Pain → feature → gain.** Error categorization and clustering aim to separate code, data, and infrastructure problems. Ticket status and resolution comments aim to make handoffs explicit.

**Selected configuration.** J6 selects **Support Tickets ON**, **Error Clustering ON**, and **Support Performance ON**. The requester uses **Internal View OFF**; the operator uses ON for **Mark as In Progress**. **Jira Integration ON** adds internal Jira UI, but Jira creation/sync are simulated. The current **Mark as Resolved** row action is not restricted by Internal View.

**Evidence.** `handleSupportRequest`, `handleResolveTicket`, job detail actions, and support table handlers in [App.tsx](../src/App.tsx#L4773).

## P7 — Data lead / review coordinator

**Context and objective.** An interpretation of the explicit “Data lead” override story and review coordination features. This is not an implemented, distinct permission role.

**Trigger and work.** A pipeline is blocked, a reviewer requests action, or a non-code exception needs explanation. Inspect issues, identify the next actor, and record a justification where acknowledgment is offered.

**Pain → feature → gain.** Progress messages aim to clarify ownership; acknowledgment comments aim to make exceptions explainable. Acknowledging an issue is not equivalent to fixing it or obtaining approval.

**Selected configuration.** Use J2's readiness configuration and J4's review configuration at the corresponding handoff. **Acknowledge & Override ON** is the intended setting, but currently does not control the details resolution component; it receives no such prop. Acknowledged critical issues still count as blocking in that component.

**Evidence.** [US7.3](../USER_STORIES.md#us73-acknowledge--override-workflow), readiness `handleAcknowledge` and `status` in [ReadinessResolutionSystem.tsx](../src/components/ReadinessResolutionSystem.tsx#L300).

## Measures to validate the intended gains

These are proposed research measures, not existing analytics or measured outcomes.

| Persona | Candidate success measure | Countermeasure / question |
| --- | --- | --- |
| P1 | Time to queue the correct pipeline without help | Did the user choose the correct data and understand output status? |
| P2 | Time and revision count to reach review-ready status | Were issues actually fixed rather than merely acknowledged? |
| P3 | Review turnaround and clarification cycles | Was the decision supported by sufficient evidence? |
| P4 | Time to resolve an output concern | Were unsafe outputs incorrectly accepted? |
| P5 | Time to identify a risky image and affected pipelines | Are the displayed counts current and sourced from a real scan? |
| P6 | Time to triage and resolve a request | Did the retry or fix resolve the original problem? |
| P7 | Time submissions spend awaiting the next actor | Are exceptions justified and revisited? |

The repository does not establish an economic buyer, procurement owner, budget, or purchasing process. Those require separate discovery.
