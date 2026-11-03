# MVP scope and rationale

[Documentation home](README.md) · [Personas](personas.md) · [Review flow and diagram](user-flows.md#j4-review-revise-and-publish-a-pipeline)

Updated 2026-11-03. This is a scope recommendation and acceptance target, not a claim that the current prototype satisfies these requirements. **Multistage approval is a mandatory MVP requirement**, as specified by the product owner. It must not be collapsed into a single approval or deferred to a later release.

## MVP outcome

A researcher can run an approved pipeline on permitted data, understand failures, and obtain a reviewed, usable output. Pipeline authors and internal reviewers must also be able to complete the required multistage submission and publication lifecycle.

Start with a narrow research use case, one supported data format, and a small pipeline catalog. Preserve the required approval stages while limiting the variety of workloads and integrations.

## Required capabilities

| Include in MVP | Why |
| --- | --- |
| Sign-in and enforced researcher/reviewer permissions | Sensitive data access and review decisions require actual authorization; a view switch is insufficient. |
| Working dataset ingestion and registration | Users need to bring real data into processing and understand its readiness. |
| Small approved pipeline catalog | Researchers can select a suitable method with visible version, supported inputs, and expected outputs. |
| Pipeline submission and version context | Reviewers need an identifiable submission and enough evidence to assess its processing logic and requirements. |
| **Mandatory multistage approval** | Ethical, technical, privacy, and security decisions address distinct concerns. Stage ownership, evidence, feedback, and publication eligibility must be clear. |
| Real job execution and monitoring | Queue state, useful errors, logs, and controlled retries must lead to actual processing. |
| Artifact preview, review, and working download | Job completion alone does not establish that an output is acceptable or usable. |
| Persisted provenance and decision history | Users need to trace dataset, pipeline version, execution, review decisions, and resulting output across reloads and handoffs. |

## Mandatory approval lifecycle

For **new pipelines**, preserve the repository's lifecycle:

**Draft → Ethical Review → Technical Review → Privacy Review → Security Review → Ready for final publication → Author publishes → Approved.**

“Ready for final publication” is progress within Security Review in the current code, not a separate `submissionStatus`. Security acceptance must not be presented as automatic publication.

The current **Update / Bug Fix** submission path starts at Technical Review and continues through Privacy and Security Review. That existing distinction is documented behavior, not a general exemption from ethical assessment. Restart and re-review rules must be explicit for the supported MVP submission types.

See the existing [review diagram](diagrams/j4.svg) and [J4 steps](user-flows.md#j4-review-revise-and-publish-a-pipeline).

### Minimum acceptance requirements for approval

1. Each applicable stage has an accountable reviewer and visible pending action.
2. Reviewers can inspect the submitted version, requirements, and relevant evidence.
3. Accepting a stage advances only to its permitted next step; required stages cannot be bypassed through UI state or direct writes.
4. Feedback identifies what the author needs to change and provides a working author-response/re-review path.
5. Rejection requires a reason and supports revision and resubmission with traceable version and review history.
6. Decisions, reviewer identity, timestamps, comments, and stage transitions persist across reloads.
7. Final publication is available only after all required approvals for that submitted version. Readiness acknowledgment or a successful dry run does not replace approval.
8. Users can see the current stage, blocker, and next actor without internal support intervention.

These are MVP acceptance targets. The current prototype's local state transitions, incomplete author-response protocol, and UI-only Internal View do not fulfill all of them.

## Features that can follow the MVP

Defer AI readiness scoring and automated fixes, advanced architecture comparison, extensive registry dashboards, Jira integration, support analytics, advanced error clustering, and broad customization until the core processing and approval journeys work reliably. Basic technical evidence and build/execution requirements still need to support the MVP's actual workloads.

**Multistage approval is not part of this deferred list.** Simplify supporting screens and integrations while retaining the mandatory review lifecycle.

The [all-features-enabled documentation](feature-list.md) remains the description of the full product scenario. This scope recommendation does not change that configuration assumption, application feature defaults, or saved settings. Actor view changes remain distinct from capability switches; required approval must be enforced independently of view toggles.

## Success measures

Measure successful runs without engineering help, time to a usable output, failure recovery, turnaround at each review stage, submissions awaiting an actor, and revision cycles. Assess review completeness alongside speed: faster progression is not success if a required decision was skipped.
