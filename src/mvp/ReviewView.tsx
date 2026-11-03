import { useState } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { ArrowLeft, Check } from "lucide-react";
import {
  STAGES,
  REVIEWERS,
  formatTime,
  type Pipeline,
  type Role,
} from "./model";
import { HistoryList, PageHeader, StagePath, Status } from "./ui";
import { EvidenceAttachments } from "./Evidence";

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
  onReview: (decision: "approve" | "changes" | "reject", note: string) => void;
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
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [confirmReject, setConfirmReject] = useState(false);
  const stage = STAGES[Math.min(p.stage, 3)];
  const expectedRole = `${stage} reviewer` as Role;
  const activeReview = p.status === "In review";
  const assigned = activeReview && role === expectedRole;
  const checked = checks.filter(Boolean).length;
  const feedback = p.history.find((event) =>
    /changes requested|rejected/.test(event.title),
  );
  const decide = (decision: "approve" | "changes" | "reject") => {
    if (!assigned) return;
    if (decision === "approve" && checked !== 3) {
      setError("Confirm all three review evidence items before approving.");
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
    onReview(decision, comments.trim());
  };
  const switchRole = (nextRole: Role) => (
    <div className="demo-handoff">
      <span className="eyebrow">Demo controls</span>
      <p>Continue the walkthrough as the next participant.</p>
      <Button variant="outlined" size="small" onClick={() => setRole(nextRole)}>
        Continue as {nextRole}
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
      <div className="compact-review-status">
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
                <Status>Action required</Status>
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
                  <FormControlLabel
                    key={label}
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
                ))}
              </div>
              <TextField
                label="Review comments"
                placeholder="Required when requesting changes or rejecting"
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
                  disabled={checked !== 3}
                  onClick={() => decide("approve")}
                >
                  Approve {stage.toLowerCase()} review
                </Button>
                <Button variant="outlined" onClick={() => decide("changes")}>
                  Request changes
                </Button>
                <Button color="error" onClick={() => decide("reject")}>
                  Reject submission
                </Button>
              </div>
              <p className="decision-note">
                {checked < 3
                  ? "Confirm all three evidence items to enable approval. "
                  : ""}
                {p.stage === 3
                  ? "Approval returns this submission to the author for publication."
                  : `Approval advances this submission to ${STAGES[p.stage + 1]} review.`}
              </p>
            </>
          ) : activeReview ? (
            <>
              <Status>Awaiting {stage.toLowerCase()} review</Status>
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
                    Submit new version
                  </Button>
                </div>
              ) : (
                switchRole("Researcher")
              )}
            </>
          ) : (
            <>
              <Status kind={p.status === "Rejected" ? "error" : "warning"}>
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
                  {p.status === "Draft"
                    ? "Edit & submit draft"
                    : "Revise & resubmit"}
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
        <DialogActions>
          <Button onClick={() => setConfirmReject(false)}>
            Keep reviewing
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setConfirmReject(false);
              onReview("reject", comments.trim());
            }}
          >
            Confirm rejection
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
