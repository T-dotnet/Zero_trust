import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { ArrowRight, Check, Download, FileText, Upload, X } from "lucide-react";
import {
  now,
  nextVersion,
  uid,
  type Attachment,
  type PipelineFields,
  type Artifact,
  type Dataset,
  type Pipeline,
  type Role,
  type Workspace,
} from "./model";
import { PREVIEW_ROWS, downloadArtifact } from "./DataAndRuns";
import { StagePath, Status } from "./ui";
import { AttachmentPicker } from "./Evidence";

export function PipelineForm({
  pipeline,
  versionSource,
  onClose,
  onCreate,
  onRevise,
}: {
  pipeline?: Pipeline;
  versionSource?: Pipeline;
  onClose: () => void;
  onCreate: (p: Pipeline, draft: boolean) => void;
  onRevise: (fields: PipelineFields) => void;
}) {
  const source = pipeline || versionSource;
  const [attachments, setAttachments] = useState<Attachment[]>(
    source?.attachments || [],
  );
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: source?.name || "",
    description: source?.description || "",
    repo: source?.repo || "",
    branch: source?.branch || "main",
    category: source?.category || "Data processing",
    input: source?.input || "Structured clinical data (CSV)",
    output: source?.output || "Processed dataset (CSV)",
  });
  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const valid = () => {
    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !/^https?:\/\/\S+$/i.test(form.repo) ||
      !form.branch.trim()
    ) {
      setError(
        "Add a name, purpose, valid HTTP(S) repository URL, and branch.",
      );
      return false;
    }
    setError("");
    return true;
  };
  const submit = (draft: boolean) => {
    if (!valid()) {
      setStep(0);
      return;
    }
    if (pipeline) onRevise({ ...form, attachments });
    else
      onCreate(
        {
          ...form,
          name: form.name.trim(),
          description: form.description.trim(),
          repo: form.repo.trim(),
          id: uid("pipe"),
          version: versionSource
            ? nextVersion(versionSource.version, "minor")
            : "v1.0.0",
          basedOn: versionSource?.id,
          attachments,
          author: "Dr. Sarah Chen",
          status: "Draft",
          stage: 0,
          updated: now(),
          history: [],
        },
        draft,
      );
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {pipeline
          ? "Revise pipeline"
          : versionSource
            ? "New pipeline version"
            : "New pipeline"}
        <button
          className="dialog-close"
          aria-label="Close pipeline form"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </DialogTitle>
      <DialogContent>
        <p className="muted">
          {pipeline
            ? "Update your submission. All four approval stages will restart."
            : "Bring a research workflow into the approved catalog."}
        </p>
        <Stepper activeStep={step} className="form-stepper">
          {["Source & purpose", "Requirements", "Review & submit"].map((s) => (
            <Step key={s}>
              <StepLabel>{s}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {step === 0 && (
          <div className="form-stack">
            <div className="form-section-heading">
              <h3>What does this pipeline do?</h3>
              {!source && (
                <Button
                  size="small"
                  onClick={() =>
                    setForm({
                      name: "Longitudinal outcome classifier",
                      description:
                        "Classifies longitudinal outcomes from synthetic clinical records.",
                      repo: "https://github.com/research/outcome-classifier",
                      branch: "main",
                      category: "ML model",
                      input: "Structured clinical data (CSV)",
                      output: "Outcome classification (CSV)",
                    })
                  }
                >
                  Use example
                </Button>
              )}
            </div>
            <TextField
              autoFocus
              label="Pipeline name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              fullWidth
              required
              disabled={Boolean(source)}
            />
            <TextField
              label="Research purpose"
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              fullWidth
              required
            />
            <div className="form-two-col">
              <TextField
                label="Repository URL"
                placeholder="https://github.com/research/my-pipeline"
                value={form.repo}
                onChange={(e) => update("repo", e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Branch or tag"
                value={form.branch}
                onChange={(e) => update("branch", e.target.value)}
                fullWidth
                required
              />
            </div>
            <TextField
              select
              label="Category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              fullWidth
            >
              {["Data processing", "ML model", "Privacy", "Audio"].map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <p className="micro-copy">
              Repository details are recorded for this demo. No source code is
              fetched.
            </p>
          </div>
        )}
        {step === 1 && (
          <div className="form-stack">
            <h3>Define the processing contract</h3>
            <TextField
              label="Input specification"
              value={form.input}
              onChange={(e) => update("input", e.target.value)}
              fullWidth
            />
            <TextField
              label="Expected output"
              value={form.output}
              onChange={(e) => update("output", e.target.value)}
              fullWidth
            />
            <div className="requirements-block">
              <FileText size={22} />
              <div>
                <strong>Standard research submission package</strong>
                <p>
                  Purpose statement, runtime requirements, input/output schema,
                  and synthetic sample evidence will be included in the
                  demonstration.
                </p>
              </div>
              <Check size={18} />
            </div>
            <Alert severity="info">
              Evidence files can be previewed locally. Repository checks and
              backend execution are outside this prototype.
            </Alert>
            <AttachmentPicker
              attachments={attachments}
              onChange={setAttachments}
            />
          </div>
        )}
        {step === 2 && (
          <div className="form-stack">
            <h3>{form.name}</h3>
            <p className="muted">{form.description}</p>
            <dl className="metadata-list">
              {[
                [
                  "Version",
                  pipeline
                    ? pipeline.status === "Draft"
                      ? pipeline.version
                      : nextVersion(pipeline.version, "patch")
                    : versionSource
                      ? nextVersion(versionSource.version, "minor")
                      : "v1.0.0",
                ],
                ["Repository", form.repo],
                ["Input", form.input],
                ["Output", form.output],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <h3>Required approval path</h3>
            <StagePath illustrative />
            <p className="muted">
              Submission starts with Ethical review. Your pipeline becomes
              runnable only after all four reviews and author publication.
            </p>
          </div>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={step === 0 ? onClose : () => setStep(step - 1)}>
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        <div className="dialog-action-spacer" />
        {!pipeline && <Button onClick={() => submit(true)}>Save draft</Button>}
        {step < 2 ? (
          <Button
            variant="contained"
            endIcon={<ArrowRight size={16} />}
            onClick={() => {
              if (step > 0 || valid()) setStep(step + 1);
            }}
          >
            Continue
          </Button>
        ) : (
          <Button variant="contained" onClick={() => submit(false)}>
            {pipeline ? "Resubmit for review" : "Submit for review"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export function ImportDialog({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (d: Dataset) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<{
    name: string;
    rows: number;
    size: string;
  } | null>(null);
  const [error, setError] = useState("");
  const sample = () => {
    setName("Clinical research · Demo cohort");
    setDescription(
      "Synthetic records for demonstrating the processing workflow.",
    );
    setFile({
      name: "synthetic-clinical-records.csv",
      rows: 120,
      size: "24 KB",
    });
    setError("");
  };
  const readFile = async (f?: File) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv") || f.size > 5 * 1024 * 1024) {
      setError(
        "Choose a CSV file smaller than 5 MB, or use the synthetic example.",
      );
      return;
    }
    try {
      const text = await f.text();
      const lines = text.split(/\r?\n/).filter((s) => s.trim());
      if (lines.length < 2) {
        setError("The CSV needs a header and at least one data row.");
        return;
      }
      setFile({
        name: f.name,
        rows: lines.length - 1,
        size: `${Math.max(1, Math.round(f.size / 1024))} KB`,
      });
      if (!name) setName(f.name.replace(/\.csv$/i, ""));
      setError("");
    } catch {
      setError("This file could not be read. Try the synthetic example.");
    }
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Import dataset</DialogTitle>
      <DialogContent>
        <p className="muted">
          Register a source dataset for the demonstration. Use synthetic data
          only.
        </p>
        <div
          className="upload-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void readFile(e.dataTransfer.files[0]);
          }}
        >
          <Upload size={28} strokeWidth={1.4} />
          <strong>{file ? file.name : "Drop a CSV file here"}</strong>
          <span>
            {file
              ? `${file.rows.toLocaleString()} records / ${file.size}`
              : "CSV, up to 5 MB. File contents are not uploaded."}
          </span>
          <Button component="label" variant="outlined" size="small">
            Choose file
            <input
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(e) => void readFile(e.target.files?.[0])}
            />
          </Button>
        </div>
        <div className="sample-divider">
          <span>or</span>
          <Button onClick={sample} size="small">
            Use synthetic example
          </Button>
        </div>
        <div className="form-stack">
          <TextField
            label="Dataset name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <div className="requirements-block">
            <Status>Restricted</Status>
            <span>Research use / Output requires validation</span>
          </div>
        </div>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!file || !name.trim()}
          onClick={() => {
            if (file)
              onImport({
                id: uid("data"),
                name: name.trim(),
                description:
                  description.trim() ||
                  "Imported dataset for research processing.",
                rows: file.rows,
                size: file.size,
                format: "CSV",
                date: now(),
              });
          }}
        >
          Import dataset
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function RunDialog({
  state,
  initialPipelineId,
  initialDatasetId,
  onClose,
  onStart,
}: {
  state: Workspace;
  initialPipelineId?: string;
  initialDatasetId?: string;
  onClose: () => void;
  onStart: (pipeline: Pipeline, dataset: Dataset) => void;
}) {
  const [pipelineId, setPipelineId] = useState(initialPipelineId || "");
  const [datasetId, setDatasetId] = useState(initialDatasetId || "");
  const pipeline = state.pipelines.find(
    (p) => p.id === pipelineId && p.status === "Approved",
  );
  const dataset = state.datasets.find((d) => d.id === datasetId);
  const compatible = Boolean(
    pipeline &&
      dataset &&
      pipeline.input.toUpperCase().includes(dataset.format),
  );
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Configure run</DialogTitle>
      <DialogContent>
        <p className="muted">Choose an approved method and source dataset.</p>
        <div className="form-stack">
          <TextField
            select
            label="Approved pipeline"
            value={pipelineId}
            onChange={(e) => setPipelineId(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Select pipeline</MenuItem>
            {state.pipelines
              .filter((p) => p.status === "Approved")
              .map((p) => (
                <MenuItem value={p.id} key={p.id}>
                  {p.name} / {p.version}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            select
            label="Source dataset"
            value={datasetId}
            onChange={(e) => setDatasetId(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Select dataset</MenuItem>
            {state.datasets.map((d) => (
              <MenuItem value={d.id} key={d.id}>
                {d.name} ({d.format})
              </MenuItem>
            ))}
          </TextField>
          {pipeline && (
            <dl className="metadata-list">
              <div>
                <dt>Expected input</dt>
                <dd>{pipeline.input}</dd>
              </div>
              <div>
                <dt>Output</dt>
                <dd>{pipeline.output}</dd>
              </div>
            </dl>
          )}
          {pipeline && dataset && !compatible && (
            <Alert severity="warning">
              This dataset format does not match the pipeline input. Choose a
              compatible dataset.
            </Alert>
          )}
          <Alert severity="info">
            Demo mode simulates execution and produces synthetic sample output.
            No code or research data is sent to a backend.
          </Alert>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!compatible}
          onClick={() => {
            if (pipeline && dataset) onStart(pipeline, dataset);
          }}
        >
          Start demo run
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function ArtifactDialog({
  artifact: a,
  role,
  setRole,
  onClose,
  onReview,
  notify,
}: {
  artifact: Artifact;
  role: Role;
  setRole: (r: Role) => void;
  onClose: () => void;
  onReview: (accept: boolean, comment: string) => void;
  notify: (s: string) => void;
}) {
  const [outcome, setOutcome] = useState("acceptable");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Artifact review</DialogTitle>
      <DialogContent>
        <div className="detail-identity">
          <h3>{a.name}</h3>
          <Status
            kind={
              a.status === "Validated"
                ? "success"
                : a.status === "Not acceptable"
                  ? "error"
                  : "warning"
            }
          >
            {a.status}
          </Status>
        </div>
        <dl className="metadata-list">
          <div>
            <dt>Source dataset</dt>
            <dd>{a.datasetName}</dd>
          </div>
          <div>
            <dt>Provenance</dt>
            <dd className="mono">
              {a.runId} / {a.version}
            </dd>
          </div>
          <div>
            <dt>Output records</dt>
            <dd>
              {a.rows.toLocaleString()} declared records / 4 synthetic sample
              rows shown
            </dd>
          </div>
        </dl>
        <h3>Output preview</h3>
        <TableContainer className="artifact-preview">
          <Table size="small" aria-label="Synthetic output preview">
            <TableHead>
              <TableRow>
                <TableCell>Record</TableCell>
                <TableCell>Processed text</TableCell>
                <TableCell>Risk</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {PREVIEW_ROWS.map((row) => (
                <TableRow key={row[0]}>
                  {row.map((cell, i) => (
                    <TableCell key={i}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <p className="micro-copy">
          Synthetic sample only. This prototype does not perform PHI detection
          or certify de-identification.
        </p>
        {a.status === "Pending review" ? (
          <div className="artifact-review-form">
            <h3>Validation decision</h3>
            {role !== "Privacy reviewer" ? (
              <Alert
                severity="info"
                action={
                  <Button
                    size="small"
                    onClick={() => setRole("Privacy reviewer")}
                  >
                    Switch role
                  </Button>
                }
              >
                A privacy reviewer validates outputs before download.
              </Alert>
            ) : (
              <>
                <RadioGroup
                  row
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  aria-label="Artifact review outcome"
                >
                  <FormControlLabel
                    value="acceptable"
                    control={<Radio size="small" />}
                    label="Acceptable"
                  />
                  <FormControlLabel
                    value="unacceptable"
                    control={<Radio size="small" />}
                    label="Not acceptable"
                  />
                </RadioGroup>
                <TextField
                  label="Validation comments"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                  placeholder="Record your assessment..."
                />
                {error && (
                  <p className="field-error" role="alert">
                    {error}
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="decision-note">
            {a.comment ||
              (a.status === "Validated"
                ? "This demonstration output was accepted for use."
                : "This output was not accepted. Investigate and rerun before creating a new output.")}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {a.status === "Pending review" && role === "Privacy reviewer" && (
          <Button
            variant="contained"
            onClick={() => {
              if (outcome === "unacceptable" && !comment.trim()) {
                setError("Explain why this output is not acceptable.");
                return;
              }
              onReview(outcome === "acceptable", comment.trim());
            }}
          >
            Submit validation
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<Download size={16} />}
          disabled={a.status !== "Validated"}
          onClick={() => {
            downloadArtifact(a);
            notify("Synthetic sample CSV downloaded.");
          }}
        >
          Download sample CSV
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function HelpDialog({
  onClose,
  onStart,
  onImport,
  onApprovals,
}: {
  onClose: () => void;
  onStart: () => void;
  onImport: () => void;
  onApprovals: () => void;
}) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Explore the MVP</DialogTitle>
      <DialogContent>
        <p className="muted">
          A complete research workflow, demonstrated with local data.
        </p>
        <ol className="walkthrough-list">
          <li>
            <strong>Bring in data</strong>
            <p>Import a small CSV or use the synthetic example.</p>
          </li>
          <li>
            <strong>Submit a pipeline</strong>
            <p>
              Use New pipeline to describe its purpose, source, inputs, and
              outputs.
            </p>
          </li>
          <li>
            <strong>Complete all four reviews</strong>
            <p>
              Switch roles in the header. Confirm stage evidence, then approve
              Ethical, Technical, Privacy, and Security reviews. Try feedback or
              rejection too.
            </p>
          </li>
          <li>
            <strong>Publish, run, and validate</strong>
            <p>
              Return to Researcher to publish and start a demo run. Switch to
              Privacy reviewer to validate its output, then download the
              synthetic sample.
            </p>
          </li>
        </ol>
        <Alert severity="info">
          Role switching and execution are simulated. Changes persist in this
          browser. Reset the demo from the profile menu.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={onImport}>Import data</Button>
        <Button variant="contained" onClick={onStart}>
          Create a pipeline
        </Button>
      </DialogActions>
    </Dialog>
  );
}
