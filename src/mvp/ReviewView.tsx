import { useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import {
  ArrowLeft,
  Check,
  FileCheck,
  FileText,
  GitBranch,
  ShieldCheck,
} from "lucide-react";
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
  const [tab, setTab] = useState("overview");
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const stage = STAGES[Math.min(p.stage, 3)];
  const expectedRole = `${stage} reviewer` as Role;
  const activeReview = p.status === "In review";
  const decide = (decision: "approve" | "changes" | "reject") => {
    if (role !== expectedRole) {
      setError(`Switch to ${expectedRole} to make this decision.`);
      return;
    }
    if (decision === "approve" && !checks.every(Boolean)) {
      setError("Confirm all three review evidence items before approving.");
      return;
    }
    if (decision !== "approve" && !comments.trim()) {
      setError("Add a comment explaining what needs to change.");
      return;
    }
    onReview(decision, comments.trim());
    setComments("");
    setError("");
    setChecks([false, false, false]);
  };
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
      <div className="review-stage-panel">
        <StagePath pipeline={p} />
      </div>
      <div className="review-columns">
        <section className="plain-panel submission-panel">
          <h2>Submission details</h2>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            aria-label="Submission details"
          >
            <Tab label="Overview" value="overview" />
            <Tab label="Evidence" value="evidence" />
            <Tab label="History" value="history" />
          </Tabs>
          {tab === "overview" && (
            <>
              <dl className="metadata-list">
                {[
                  ["Author", p.author],
                  [
                    "Submitted",
                    formatTime(
                      p.history[p.history.length - 1]?.date || p.updated,
                    ),
                  ],
                  ["Repository", p.repo],
                  ["Branch", p.branch],
                  ["Input", p.input],
                  ["Output", p.output],
                  ["Description", p.description],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd
                      className={
                        label === "Repository" || label === "Branch"
                          ? "mono"
                          : ""
                      }
                    >
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="evidence-section">
                <h3>Review evidence</h3>
                {activeReview ? (
                  CHECKS[stage].map((label, i) => (
                    <FormControlLabel
                      key={label}
                      control={
                        <Checkbox
                          checked={checks[i]}
                          onChange={(e) =>
                            setChecks((values) =>
                              values.map((v, index) =>
                                index === i ? e.target.checked : v,
                              ),
                            )
                          }
                          size="small"
                          disabled={role !== expectedRole}
                        />
                      }
                      label={label}
                    />
                  ))
                ) : (
                  <p className="muted">
                    The submission history records the evidence and decisions
                    for each completed stage.
                  </p>
                )}
              </div>
            </>
          )}
          {tab === "evidence" && (
            <div className="evidence-content">
              <h3>Submission package</h3>
              <EvidenceAttachments attachments={p.attachments || []} />
              <p className="muted">
                Illustrative evidence provided with this prototype submission.
              </p>
              {(
                [
                  [
                    FileText,
                    "Pipeline specification",
                    "Purpose, requirements, input schema, and expected output.",
                  ],
                  [
                    GitBranch,
                    "Version reference",
                    `${p.version} / ${p.branch}`,
                  ],
                  [
                    FileCheck,
                    "Sample execution",
                    "Synthetic sample records and expected output schema.",
                  ],
                  [
                    ShieldCheck,
                    "Data handling statement",
                    "Restricted research access; output requires privacy validation.",
                  ],
                ] as const
              ).map(([Icon, label, desc]) => (
                <div className="evidence-file" key={label}>
                  <Icon size={21} />
                  <div>
                    <strong>{label}</strong>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
              <Alert severity="info">
                Evidence is illustrative. No repository or container scan is
                performed.
              </Alert>
            </div>
          )}
          {tab === "history" && <HistoryList events={p.history} />}
        </section>
        <aside className="plain-panel decision-panel">
          {activeReview ? (
            <>
              <h2>{stage} review</h2>
              <p className="assigned">Assigned to {REVIEWERS[stage]}</p>
              <p className="review-purpose">{REASONS[stage]}</p>
              {role !== expectedRole && (
                <Alert
                  severity="info"
                  action={
                    <Button size="small" onClick={() => setRole(expectedRole)}>
                      Switch role
                    </Button>
                  }
                >
                  Use the {expectedRole} demo role to review.
                </Alert>
              )}
              <TextField
                label="Review comments"
                placeholder="Add context for the author or next reviewer..."
                multiline
                minRows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                fullWidth
                error={Boolean(error && !comments.trim())}
              />
              {error && (
                <p role="alert" className="field-error">
                  {error}
                </p>
              )}
              <Button
                variant="contained"
                startIcon={<Check size={17} />}
                onClick={() => decide("approve")}
                disabled={role !== expectedRole}
              >
                Approve {stage.toLowerCase()} review
              </Button>
              <Button
                variant="outlined"
                onClick={() => decide("changes")}
                disabled={role !== expectedRole}
              >
                Request changes
              </Button>
              <Button
                color="error"
                onClick={() => decide("reject")}
                disabled={role !== expectedRole}
              >
                Reject submission
              </Button>
              <div className="decision-note">
                {p.stage === 3
                  ? "Approval returns this submission to the author for final publication."
                  : `Approval advances this submission to ${STAGES[p.stage + 1]} review.`}
              </div>
            </>
          ) : p.status === "Ready to publish" ? (
            <>
              <Status kind="success">All four reviews approved</Status>
              <h2>Ready to publish</h2>
              <p className="muted">
                Publish this version to make it available for research runs.
              </p>
              {role !== "Researcher" ? (
                <Button
                  variant="outlined"
                  onClick={() => setRole("Researcher")}
                >
                  Switch to researcher
                </Button>
              ) : (
                <Button variant="contained" onClick={onPublish}>
                  Publish pipeline
                </Button>
              )}
              <p className="decision-note">
                Publication is a separate author action. Review approval alone
                does not publish a pipeline.
              </p>
            </>
          ) : p.status === "Approved" ? (
            <>
              <Status kind="success">Approved</Status>
              <h2>Ready for research</h2>
              <p className="muted">
                This version has completed the review and publication workflow.
              </p>
              <Button variant="contained" onClick={onRun}>
                Configure run
              </Button>
              {role === "Researcher" && (
                <Button variant="outlined" onClick={onNewVersion}>
                  Submit new version
                </Button>
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
              <p className="muted">
                {p.history[0]?.note ||
                  "Review the submission before sending it for approval."}
              </p>
              {role !== "Researcher" ? (
                <Button
                  variant="outlined"
                  onClick={() => setRole("Researcher")}
                >
                  Switch to researcher
                </Button>
              ) : (
                <Button variant="contained" onClick={onRevise}>
                  {p.status === "Draft"
                    ? "Edit & submit draft"
                    : "Revise & resubmit"}
                </Button>
              )}
              <div className="decision-note">
                A revision restarts all four review stages and retains the
                previous decision history.
              </div>
            </>
          )}
        </aside>
      </div>
      <section className="plain-panel activity-section">
        <h2>Activity timeline</h2>
        <HistoryList events={p.history} />
      </section>
    </>
  );
}
