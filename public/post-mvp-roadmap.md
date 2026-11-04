# Zero Trust post MVP product roadmap

Draft for product planning

Help research teams get from an approved method and permitted data to a reviewed, usable output with fewer failed setups and fewer manual handoffs. The next investment should make the existing workflow dependable, then improve review coordination and reproducibility. Expand integrations and automation after a controlled pilot demonstrates repeat use.

The roadmap separates **completion of the real MVP** from **post-MVP enhancements**. Authentication, working ingestion and execution, enforced approval, and durable provenance are already required by the [MVP scope](mvp-scope.md); they are prerequisites, not optional future features.

## Current product baseline

| Capability | Current state | Roadmap implication |
| --- | --- | --- |
| Pipeline creation | Three-step wizard for source and purpose, requirements and evidence, then review and submission | Improve this wizard; do not schedule its initial creation again |
| Governance | Local Ethical → Technical → Privacy → Security review, author publication, revisions and artifact decisions | Enforce the same lifecycle through authenticated backend operations |
| Data and execution | CSV parsing and metadata registration, format compatibility checks, simulated runs and synthetic outputs | Real ingestion, schema validation, isolated execution and actual outputs belong in the pilot baseline |
| History and support | Browser-persisted events, local support requests and downloadable logs | Establish durable shared records before adding analytics or external support integrations |
| Usability and resilience | Responsive layouts, drafts and role-aware queues; local audit fixes add safe tab saves, recovery, correct attribution and save/discard prompts | Publish and verify the audit fixes before treating them as released |
| Original full workspace | Broader feature demonstrations, including readiness, registry, architecture and Jira views | A visible control or simulated result is not a delivered production capability |

The current MVP requires all four reviews again for every new version and revision. This roadmap preserves that rule and separate author publication. The original full prototype's shorter update path is not the policy for future releases.

## Planning assumptions

Progress through the releases according to priority, dependencies and acceptance criteria. Confirm the hosting boundary, supported workloads and staffing before starting the pilot-readiness work.

The capacity assumption is one dedicated pod with two product engineers, one platform engineer, shared design and QA support, and named privacy and security decision owners. Confirm roles and capacity before starting delivery. Limit delivery to two active epics and reserve roughly 20% of capacity for reliability, accessibility, support and validation; reduce scope if capacity is lower.

Start with one research use case, one CSV contract and one approved pipeline. Add workloads only after their data handling and execution requirements are understood. Use synthetic data until the responsible owners authorize the intended data class and deployment environment. The survey identifies an intended research audience, but does not establish a contracted pilot, adoption or a buyer.

## Roadmap overview

| Release | User outcome | Proposed scope | Exit decision |
| --- | --- | --- | --- |
| G0 Pilot readiness | An authorized user completes one real, traceable workflow | Release the audit fixes; real identity, ingestion, approvals, execution, artifact access and recovery | Complete the pilot release gates below |
| R1 Review coordination | Authors and reviewers know who acts next and what needs to change | Assigned tasks and notifications; structured feedback and revision comparison | Review completeness is maintained and waiting/clarification measures improve against baseline |
| R2 Reproducible self-service | Researchers configure compatible inputs and repeat work without engineering help | Wizard templates and reusable mappings; run attempts, reproducibility packages and lineage navigation | A second researcher can reproduce a supported workflow and diagnose a failed attempt |
| R3 Institutional adoption | Teams can operate the product within their institution's access, support and resource policies | Choose up to two validated expansion needs from identity/connectors, operational controls and output-review assistance | The selected capabilities pass institution-specific acceptance and demonstrate repeat use |
| Later | Broader workloads become economical to support | Additional formats, scheduling, richer registry tools and evaluated AI assistance | A named customer problem, accountable owner and measurable benefit justify each addition |

Select the R3 scope from demonstrated institutional needs and pilot evidence. Institutional SSO, residency or retention requirements that block the first pilot move into G0 and must be funded there.

The product lead owns prioritization and release outcomes. A product engineering lead owns R1 with the review coordinator, the pipeline engineering lead owns R2 with a data steward, and the platform lead owns selected R3 integrations with security/privacy owners. These are proposed accountabilities; assign named people before starting an epic.

## G0 Pilot release gates

These close gaps between the interactive prototype and the already-defined MVP outcome.

| Gate | Minimum deliverable | Acceptance evidence | Accountable function |
| --- | --- | --- | --- |
| Reliable release | Publish the reviewed audit fixes, verify the deployed wizard and recovery flows, and provide rollback and environment separation | Release checks identify the exact deployed version; storage recovery and conflicting saves retain work | Engineering and QA |
| Identity and permissions | Real sign-in, workspace membership, researcher/reviewer permissions and an agreed separation-of-duties policy | API/direct-write tests block unauthorized access, self-approval where prohibited and cross-workspace access; demo role switching grants no authority | Platform and security |
| Dataset ingestion | Authorized upload to managed storage, file limits, dataset version/checksum, schema validation and approved retention/deletion behavior | A supported file is actually stored; malformed or incompatible input is rejected with an actionable error; access and deletion are tested | Platform and data governance |
| Pipeline and approval integrity | Immutable source reference, versioned requirements/evidence, scoped dependency/secret checks and transactional decisions tied to the exact submission | All four reviews persist, cannot be skipped through an API, and are invalidated by a new submission; author publication remains separate | Engineering and review owners |
| Real execution | One supported pipeline running in a controlled environment with restricted credentials/network access, resource limits, durable job/attempt state and cancellation | Failure logs survive retry; worker restart and duplicate requests do not create conflicting runs or releases | Platform and security |
| Output release and provenance | Actual previews/files, durable reviewer decisions, authorized download and a trace capturing dataset checksum, source/image digest, parameters and environment for each output | Pending/rejected outputs cannot be downloaded through UI or direct access; changing an output invalidates its release eligibility | Engineering and privacy |
| Operability and usability | Service monitoring, recoverable backups, incident ownership, keyboard/screen-reader checks and usable phone layouts | Restore rehearsal, incident walkthrough and observed core-task tests pass for the pilot environment | Platform, QA and design |

Keep the checked-in denial of browser writes to shared workflow collections until a trusted backend enforces the required permissions and transitions. A client-side view toggle, readiness score or successful dry run cannot substitute for approval.

## Prioritized post MVP features

Priority reflects dependency and expected user value, not measured demand. Sizes are relative to an existing G0 backend: **S** is a contained change, **M** crosses a few product/service boundaries, and **L** needs substantial integration or operational work. They are not delivery estimates.

| Rank and feature | Why add it | First useful release slice | Dependency and size | Release group |
| --- | --- | --- | --- | --- |
| 1 Assigned work and notifications | Fixed demo reviewers and manual role handoffs do not coordinate a real team | Assign/reassign a qualified reviewer, a personal inbox, visible next owner, stage aging and opt-in reminders; notifications contain no research content | Real membership, permissions and durable events; M | R1 |
| 2 Structured feedback and revision comparison | A comment and status alone leave authors uncertain about what resolves a request | Reviewer issues with author responses, linked evidence and a comparison of changed code references, contracts and attachments; require explicit reviewer resolution | Immutable submission snapshots; M | R1 |
| 3 Guided pipeline and dataset setup | The wizard exists, but free-text contracts and format-only checks do not help users map new datasets | Templates for approved workload types, reusable column mappings, preflight examples and field-level errors before a run; require users to review proposed mappings | G0 schema validation and typed pipeline contracts; M | R2 |
| 4 Reproducible runs and lineage | Local logs and synthetic fixtures cannot establish how an output was produced | Compare retained execution attempts; turn captured input, code, parameters and environment into a reproducibility package; navigate dataset → run → output | G0 durable execution and provenance; M | R2 |
| 5 Operational and resource controls | Operators need to manage queue pressure and recurring failures before usage grows | Queue health, actionable failure categories, resource/cost estimates with uncertainty, quotas and budget alerts; connect support context without exporting sensitive payloads | Real telemetry and agreed service ownership; M | R3 candidate |
| 6 Institutional identity and a first data connector | Repeated manual transfers and account administration can block adoption | Select one institution-required identity integration or read-only storage connector; add access revocation, connection status and source-version checks | Buyer/pilot discovery, identity boundary and data contracts; L | R3 candidate; move blockers to G0 |
| 7 Output quality and disclosure review tools | Four sample rows are insufficient for larger real artifacts | Reviewable sampling, quality summaries, configurable disclosure checks, reviewer annotations and explicit limitations; retain human release decisions | Actual artifact storage, task-specific evaluation and privacy acceptance; L | R3 candidate |
| 8 Catalog discovery and personal views | Search by name/category is insufficient once multiple teams publish methods | Filter by compatible schema, permission, version and evidence; save views and favorites; show ownership and deprecation notices | Stable catalog metadata and usage evidence; S–M | R2 stretch or R3; do not displace ranks 3–4 |
| 9 Scheduled and batch processing | Repeated manual runs may become expensive for recurring studies | One constrained schedule or batch template, with deduplication, pause/cancel, approval-expiry checks and resource limits | Proven idempotency, retry semantics, quotas and supported-workload demand; L | Later |
| 10 Readiness automation and AI assistance | Authors may benefit from earlier feedback and explanations | Start with explainable deterministic compatibility/dependency checks; evaluate suggested fixes against known cases before offering an assistant | Real build/scan evidence, evaluation set and human review; L | Later; validate demand first |

The registry heatmap, architecture comparison, Jira UI and guided AI chat in the original prototype are inputs to future discovery. Do not count them as completed integrations. Choose a real Jira/support integration only if the pilot's existing support process needs it; do not build a parallel ticketing system by default.

## Release criteria for the enhancements

| Release | Acceptance criteria |
| --- | --- |
| R1 | Assignment changes are authorized and audited. A reviewer acts from their own queue without switching identities. Notification retries do not duplicate messages. Authors can answer each requested change. Reviewers see the exact revision and evidence under consideration. Faster turnaround never skips a stage or publishes automatically. |
| R2 | Invalid mappings are caught before execution. A researcher can save and reuse a supported mapping. Another authorized researcher can repeat a run from its captured configuration. Failed attempts retain their own errors, timestamps and logs after retry. Changed inputs or environments are visible rather than described as an identical reproduction. |
| R3 | Each selected integration has access-revocation, failure and recovery tests. Resource limits are enforced rather than merely displayed. Output checks report their evaluated coverage and limitations. Human reviewers retain release authority; automation cannot accept an output based on a score alone. |

Every release includes keyboard and screen-reader task checks, phone/short-window testing, clear empty/error states, safe draft behavior and plain explanations of the next action. Avoid exposing execution or integration details unless they help the user make a decision.

## Measurement plan

Instrument the G0 pilot before setting improvement commitments. The following are proposed decision rules, not current results. Use counts alongside percentages for small pilot samples and report median and 90th percentile for elapsed times.

| Measure | Definition | How it guides the roadmap |
| --- | --- | --- |
| Time to usable output | Time from submitting a valid run configuration to the first authorized download of its validated output; report completion rate, pending-case age and failed/cancelled work alongside completed-case times | Primary outcome; separate queue, execution and output-review time to identify the actual bottleneck |
| Self-service completion | Completed supported workflows without engineering intervention divided by all started supported workflows | R2 should improve completion without hiding failed attempts or unsupported-input cases |
| Review waiting and rework | Waiting time at each stage, author-response time, clarification count and revision count per submission | R1 should reduce avoidable handoffs; compare like workloads and monitor evidence completeness |
| Setup quality | First-attempt setup success, mapping errors caught before execution and recurring input-error categories | Decide which templates and mapping improvements have value |
| Recovery effectiveness | Successful intended reruns after a recoverable failure divided by initiated recovery attempts; record support assistance separately | Distinguish a working fix from a retry button that merely starts another attempt |
| Workflow integrity | Missing required decisions, unauthorized data access, or downloads of pending/rejected artifacts | Any confirmed bypass blocks release and triggers investigation; zero observed incidents is not proof of universal safety |
| Sustained use and resource burden | Teams repeating an eligible workflow during the agreed pilot observation period, plus actual resource use and support effort per completed workflow | Determine whether to fund integrations, quotas, scheduling or additional workload support |

Set numerical improvement targets after the baseline and workload mix are known. Do not optimize review speed at the expense of completeness, or execution success at the expense of scientific validity and privacy assessment.

## Discovery and delivery plan

During the next planning cycle, validate the order with a researcher, a pipeline author, each required review role, and a support/operator representative. Roles may overlap, but record which perspective each participant represents. Use synthetic tasks: create a pipeline, respond to requested changes, map an incompatible dataset, recover a failed run and review an output. Observe completion and misunderstanding, not only stated preferences.

Confirm who owns the pilot, budget, procurement, hosting and ongoing operation. The current persona documents do not establish an economic buyer. Identify whether SSO, a particular connector, residency, retention or export controls are conditions of participation. A blocking institutional requirement changes G0 scope rather than becoming an unspoken assumption.

For each selected epic, create a short brief with a named owner, primary user, observed problem, narrow release slice, dependency, acceptance test and measurement event. Review pilot evidence before selecting each release's scope. Keep the overall approval and output-release rules stable while reprioritizing supporting features.

The immediate sequence is: publish and verify the audited prototype fixes; confirm the G0 pilot plan; recruit the pilot roles and establish baseline measures; then start the two R1 coordination epics. Do not start enterprise connectors and AI assistance concurrently with the pilot foundation.

## Deferred scope and decision triggers

- **Additional formats and larger workloads:** add the next format only when a named study needs it and its ingestion, execution, review and export path can be validated end to end.
- **Expanded container registry and architecture dashboards:** add them when operators cannot answer a recurring risk, dependency or maintenance question through the core workflow.
- **Workspace expansion and institutional lifecycle management:** expand after per-workspace isolation and access revocation are demonstrated; never defer basic isolation to an enterprise tier.
- **Marketplace, broad customization and monetization features:** require a validated buyer, repeated use and a support model first.
- **Autonomous repairs, approvals or privacy certification claims:** not part of this roadmap. Assistance may suggest or explain; required accountable decisions remain explicit.

## Source references

- [Current MVP behavior and boundaries](mvp/README.md) and [working-tree reliability changes](../README.md#saving-and-recovery).
- [MVP scope and mandatory approval acceptance](mvp-scope.md).
- [Personas and the measures awaiting validation](personas.md).
- [Full prototype feature inventory](feature-list.md) and [detailed user journeys](user-flows.md).
- [Validation survey](../jj_user_validation_survey.md), an intended research instrument rather than interview results.
- [Pipeline wizard](../src/mvp/Dialogs.tsx), [workflow model](../src/mvp/model.ts), [persistence](../src/mvp/useWorkspace.ts), and [current Firestore policy](../firestore.rules).
