import { useState } from "react";
import {
  Button,
  Alert,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
} from "@mui/material";
import { ArrowLeft, Check } from "lucide-react";
import {
  STAGES,
  REVIEWERS,
  formatTime,
  pipelineRevision,
  reviewEvidenceSources,
  requiredInputColumns,
  type Pipeline,
  type Role,
} from "./model";
import { HistoryList, PageHeader, StagePath, Status } from "./ui";
import { EvidenceAttachments } from "./Evidence";
import { DialogActionBar } from "./DialogActionBar";
import { useSessionDraft } from "./useSessionDraft";

const CHECKS = {
  Ethical: [
    "Research purpose and intended use are documented",
    "Consent and data-use boundaries are appropriate",
    "Potential harms and limitations are acknowledged",
  ],
  Technical: [
    "Dependencies and runtime are documented",
    "Inputs and outputs are defined",
    "Sample execution results are reviewed",
  ],
  Privacy: [
    "Sensitive fields and data access are documented",
    "Redaction and minimization approach is appropriate",
    "Output disclosure risks are reviewed",
  ],
  Security: [
    "Container and dependency risks are reviewed",
    "Secrets and network access are documented",
    "Execution permissions follow least privilege",
  ],
};
const REASONS = {
  Ethical: "Confirm the research purpose and use of data are appropriate.",
  Technical:
    "Confirm the pipeline can run reliably in the research environment.",
  Privacy: "Confirm sensitive data and outputs are handled appropriately.",
  Security: "Confirm the pipeline can operate within the security boundaries.",
};
interface Props {
  pipeline: Pipeline;
  role: Role;
  setRole: (role: Role) => void;
  onBack: () => void;
  onReview: (
    decision: "approve" | "changes" | "reject",
    note: string,
  ) => Promise<boolean>;
  onPublish: () => void;
  onRevise: () => void;
  onRun: () => void;
  onNewVersion: () => void;
}
export function ReviewView({
  pipeline: p,
  role,
  setRole,
  onBack,
  onReview,
  onPublish,
  onRevise,
  onRun,
  onNewVersion,
}: Props) {
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);
  const [comments, setComments, clearDraft, draftStored] = useSessionDraft(
    `review:${p.id}:${p.version}:${pipelineRevision(p)}:${role}`,
    "",
    (value): value is string => typeof value === "string",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmReject, setConfirmReject] = useState(false);
  const [evidenceIndex, setEvidenceIndex] = useState<number | null>(null);
  const stage = STAGES[Math.min(p.stage, 3)];
  const expectedRole = `${stage} reviewer` as Role;
  const activeReview = p.status === "In review";
  const assigned = activeReview && role === expectedRole;
  const checked = checks.filter(Boolean).length;
  const sources = reviewEvidenceSources(p, stage);
  const needsBasis = sources.some((source) => !source.available);
  const feedback = p.history.find((event) =>
    /changes requested|rejected/.test(event.title),
  );
  const submitDecision = async (decision: "approve" | "changes" | "reject") => {
    if (saving) return;
    setSaving(true);
    try {
      const basis = sources
        .map(
          (source, i) =>
            `${CHECKS[stage][i]}: ${source.available ? `${source.label} — ${source.detail}` : `Demo exception — ${comments.trim()}`}`,
        )
        .join("\n");
      const note =
        decision === "approve"
          ? `${comments.trim()}\nEvidence basis · ${p.version}\n${basis}`.trim()
          : comments.trim();
      if (await onReview(decision, note)) clearDraft();
      else
        setError(
          "The decision was not saved. Your notes are kept; check the latest submission before trying again.",
        );
    } finally {
      setSaving(false);
    }
  };
  const decide = (decision: "approve" | "changes" | "reject") => {
    if (!assigned) return;
    if (decision === "approve" && checked !== 3) {
      setError("Confirm all three review evidence items before approving.");
      return;
    }
    if (decision === "approve" && needsBasis && !comments.trim()) {
      setError(
        "Explain the basis for this demo approval where supporting evidence is missing.",
      );
      return;
    }
    if (decision !== "approve" && !comments.trim()) {
      setError("Add a comment explaining what needs to change.");
      return;
    }
    if (decision === "reject") {
      setConfirmReject(true);
      return;
    }
    void submitDecision(decision);
  };
  const switchRole = (nextRole: Role) => (
    <div className="demo-handoff">
      <span className="eyebrow">Demo controls</span>
      <p>
        Continue as <strong>{nextRole}</strong> for the next task.
      </p>
      <Button variant="outlined" size="small" onClick={() => setRole(nextRole)}>
        Switch role
      </Button>
    </div>
  );
  return (
    <>
      <Button
        className="back-link"
        onClick={onBack}
        startIcon={<ArrowLeft size={16} />}
      >
        Back to approvals
      </Button>
      <PageHeader
        title={p.status === "Approved" ? "Pipeline details" : "Pipeline review"}
        description={`${p.name} · ${p.version}`}
      />
      <div
        data-status={p.status}
        className={`compact-review-status ${activeReview || p.status === "Ready to publish" ? "review-current" : p.status === "Rejected" || p.status === "Changes requested" ? "review-blocked" : p.status === "Approved" ? "review-complete" : "review-pending"}`}
      >
        <div>
          <span className="eyebrow">
            {activeReview ? "Current stage" : "Submission status"}
          </span>
          <strong>
            {activeReview
              ? `${stage} review · ${p.stage + 1} of 4`
              : p.status === "Approved"
                ? "Published"
                : p.status}
          </strong>
        </div>
        <span>{p.stage} of 4 reviews completed</span>
      </div>
      <details className="disclosure review-path-disclosure">
        <summary>View all stages</summary>
        <StagePath pipeline={p} />
        <p className="micro-copy">
          All four reviews are required. Publication is a separate author
          action.
        </p>
      </details>
      <div className="review-workspace">
        <section className="review-task plain-panel" aria-label="Current task">
          {assigned ? (
            <>
              <div className="section-title">
                <h2>{stage} review</h2>
                <Status kind="warning">Action required</Status>
              </div>
              <p className="assigned">Assigned to {REVIEWERS[stage]}</p>
              <p className="review-purpose">{REASONS[stage]}</p>
              <details className="disclosure evidence-disclosure">
                <summary>
                  Submission evidence · {p.attachments?.length || 0} attached
                  files
                </summary>
                <EvidenceAttachments attachments={p.attachments || []} />
                <p className="micro-copy">
                  The declared input, output and source appear in Submission
                  details. Standard evidence is illustrative; no repository or
                  container scan is performed.
                </p>
              </details>
              <div className="review-criteria">
                <div className="section-title">
                  <h3>Required evidence checks</h3>
                  <span className="criteria-count" role="status">
                    {checked}/3 confirmed
                  </span>
                </div>
                {CHECKS[stage].map((label, i) => (
                  <div className="criterion" key={label}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checks[i]}
                          onChange={(event) =>
                            setChecks((values) =>
                              values.map((v, index) =>
                                index === i ? event.target.checked : v,
                              ),
                            )
                          }
                          size="small"
                        />
                      }
                      label={label}
                    />
                    <button
                      className="criterion-source"
                      onClick={() => setEvidenceIndex(i)}
                      aria-label={`View evidence for ${label}`}
                    >
                      {sources[i].label} ·{" "}
                      {sources[i].available ? p.version : "not supplied"}
                    </button>
                  </div>
                ))}
              </div>
              {needsBasis && (
                <Alert severity="warning">
                  Some criteria have no supporting evidence. Inspect each source
                  and record the basis in Review comments to approve a demo
                  exception. This does not establish production readiness.
                </Alert>
              )}
              <TextField
                label="Review comments"
                placeholder={
                  needsBasis
                    ? "Explain the basis for any missing-evidence demo exception."
                    : "Required when requesting changes or rejecting"
                }
                slotProps={{ htmlInput: { "aria-required": needsBasis } }}
                multiline
                minRows={2}
                fullWidth
                value={comments}
                onChange={(event) => {
                  setComments(event.target.value);
                  setError("");
                }}
                error={Boolean(error && !comments.trim())}
              />
              {error && (
                <p role="alert" className="field-error">
                  {error}
                </p>
              )}
              <div className="review-actions">
                <Button
                  variant="contained"
                  startIcon={<Check size={17} />}
                  disabled={
                    saving || checked !== 3 || (needsBasis && !comments.trim())
                  }
                  onClick={() => decide("approve")}
                >
                  Approve review
                </Button>
                <Button
                  variant="outlined"
                  disabled={saving}
                  onClick={() => decide("changes")}
                >
                  Request changes
                </Button>
                <Button
                  color="error"
                  disabled={saving}
                  onClick={() => decide("reject")}
                >
                  Reject
                </Button>
              </div>
              {comments && (
                <p className="draft-saved-note" role="status">
                  {draftStored
                    ? "Review notes saved in this tab. Evidence checks must be confirmed again when you return."
                    : "Notes kept in memory. Keep this tab open or copy your notes before leaving."}
                </p>
              )}
              <p className="decision-note">
                {checked < 3
                  ? needsBasis
                    ? "Confirm all three evidence items and record a rationale for missing evidence to enable approval. "
                    : "Confirm all three evidence items to enable approval. "
                  : ""}
                {p.stage === 3
                  ? "Approval returns this submission to the author for publication."
                  : `Approval advances this submission to ${STAGES[p.stage + 1]} review.`}
              </p>
            </>
          ) : activeReview ? (
            <>
              <Status kind="warning">
                Awaiting {stage.toLowerCase()} review
              </Status>
              <h2>
                {role === "Researcher"
                  ? "Submitted for review"
                  : "Awaiting the assigned reviewer"}
              </h2>
              <p>
                Your submission is with <strong>{REVIEWERS[stage]}</strong> for{" "}
                {stage.toLowerCase()} review.
              </p>
              <dl className="metadata-list compact-metadata">
                <div>
                  <dt>Version</dt>
                  <dd>{p.version}</dd>
                </div>
                <div>
                  <dt>Next owner</dt>
                  <dd>
                    {REVIEWERS[stage]} · {expectedRole}
                  </dd>
                </div>
                <div>
                  <dt>What happens next</dt>
                  <dd>
                    {p.stage === 3
                      ? "Security approval returns the version to its author for publication."
                      : `Approval moves the version to ${STAGES[p.stage + 1]} review. Requested changes return it to the author.`}
                  </dd>
                </div>
              </dl>
              <p className="muted">
                {role === "Researcher"
                  ? "No author action is needed while this review is pending."
                  : "Only the assigned review role can make this decision."}
              </p>
              {switchRole(expectedRole)}
            </>
          ) : p.status === "Ready to publish" ? (
            <>
              <Status kind="success">All four reviews approved</Status>
              <h2>Ready to publish</h2>
              <p>
                Publish this version to make it available for research runs.
              </p>
              {role === "Researcher" ? (
                <Button variant="contained" onClick={onPublish}>
                  Publish pipeline
                </Button>
              ) : (
                switchRole("Researcher")
              )}
              <p className="decision-note">
                Publication is a separate author action. Review approval alone
                does not publish a pipeline.
              </p>
            </>
          ) : p.status === "Approved" ? (
            <>
              <Status kind="success">Published</Status>
              <h2>Ready for research</h2>
              <p>
                This version has completed all four reviews and author
                publication.
              </p>
              {role === "Researcher" ? (
                <div className="review-actions">
                  <Button variant="contained" onClick={onRun}>
                    Configure run
                  </Button>
                  <Button variant="outlined" onClick={onNewVersion}>
                    New version
                  </Button>
                </div>
              ) : (
                switchRole("Researcher")
              )}
            </>
          ) : (
            <>
              <Status
                kind={
                  p.status === "Draft"
                    ? "neutral"
                    : p.status === "Changes requested"
                      ? "warning"
                      : "error"
                }
              >
                {p.status}
              </Status>
              <h2>
                {p.status === "Draft"
                  ? "Complete your draft"
                  : "Author action required"}
              </h2>
              <p>
                {p.status === "Draft"
                  ? "Your working draft is saved. Complete the required fields before submitting."
                  : feedback?.note ||
                    "Review the submission before sending it for approval."}
              </p>
              {p.revisionDraft && (
                <p className="draft-saved-note">
                  A working revision is saved. Your previous submission and
                  decision history are retained.
                </p>
              )}
              {role === "Researcher" ? (
                <Button variant="contained" onClick={onRevise}>
                  {p.status === "Draft" ? "Edit draft" : "Revise & resubmit"}
                </Button>
              ) : (
                switchRole("Researcher")
              )}
              <p className="decision-note">
                {p.status === "Draft"
                  ? "All four stages are required after submission."
                  : "A revision restarts all four review stages and retains the previous decision history."}
              </p>
            </>
          )}
        </section>
        <aside className="plain-panel review-details">
          <h2>Submission details</h2>
          <dl className="metadata-list">
            {[
              ["Author", p.author],
              ["Input", p.input || "Not defined yet"],
              [
                "Required columns",
                requiredInputColumns(p).join(", ") || "Not specified",
              ],
              ["Output", p.output || "Not defined yet"],
              ["Purpose", p.description || "Not defined yet"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <details className="disclosure">
            <summary>Source and version</summary>
            <dl className="metadata-list">
              {[
                ["Repository", p.repo || "Not added yet"],
                ["Branch", p.branch],
                ["Version", p.version],
                ["Updated", formatTime(p.updated)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </details>
          {!assigned && (
            <details className="disclosure">
              <summary>
                Submission evidence · {p.attachments?.length || 0} attached
                files
              </summary>
              <EvidenceAttachments attachments={p.attachments || []} />
              <p className="micro-copy">
                Illustrative evidence. No repository or container scan is
                performed.
              </p>
            </details>
          )}
        </aside>
      </div>
      <details className="disclosure review-history">
        <summary>Activity timeline · {p.history.length} events</summary>
        <HistoryList events={p.history} />
      </details>
      <Dialog
        open={evidenceIndex !== null}
        onClose={() => setEvidenceIndex(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Evidence for {stage} review</DialogTitle>
        <DialogContent>
          {evidenceIndex !== null && (
            <>
              <h3>{CHECKS[stage][evidenceIndex]}</h3>
              <p className="micro-copy">
                {p.name} · {p.version} · {sources[evidenceIndex].label}
              </p>
              <Status
                kind={sources[evidenceIndex].available ? "success" : "warning"}
              >
                {sources[evidenceIndex].available
                  ? "Source available"
                  : "Evidence not supplied"}
              </Status>
              <p className="evidence-source-text">
                {sources[evidenceIndex].detail}
              </p>
              {sources[evidenceIndex].target === "attachments" && (
                <EvidenceAttachments attachments={p.attachments || []} />
              )}
              {!sources[evidenceIndex].available && (
                <p>
                  Request changes for real missing evidence, or record an
                  explicit rationale for a demo-only exception in Review
                  comments. No automated check is claimed.
                </p>
              )}
            </>
          )}
        </DialogContent>
        <DialogActionBar
          primary={
            <Button variant="contained" onClick={() => setEvidenceIndex(null)}>
              Return to review
            </Button>
          }
        />
      </Dialog>
      <Dialog
        open={confirmReject}
        onClose={() => setConfirmReject(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Reject {p.name} · {p.version}?
        </DialogTitle>
        <DialogContent>
          <p>
            This stops the current review. The author can revise and resubmit
            through all four stages.
          </p>
          <p>
            <strong>Reason:</strong> {comments}
          </p>
        </DialogContent>
        <DialogActionBar
          primary={
            <Button
              color="error"
              variant="contained"
              disabled={saving}
              onClick={() => {
                setConfirmReject(false);
                void submitDecision("reject");
              }}
            >
              Confirm rejection
            </Button>
          }
        >
          <Button onClick={() => setConfirmReject(false)}>
            Keep reviewing
          </Button>
        </DialogActionBar>
      </Dialog>
    </>
  );
}
