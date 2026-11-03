import { useRef, useState } from "react";
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
import { ArrowRight, Download, FileText, Upload, X } from "lucide-react";
import {
  now,
  formatTime,
  nextAvailableVersion,
  supportsDataset,
  uid,
  type Attachment,
  type PipelineFields,
  type Artifact,
  type Dataset,
  type Pipeline,
  type Role,
  type Workspace,
} from "./model";
import { downloadArtifact } from "./DataAndRuns";
import { artifactPreview } from "./artifactPreview";
import { StagePath, Status } from "./ui";
import { AttachmentPicker } from "./Evidence";
import { parseDatasetCsv } from "./csv";

export function PipelineForm({
  pipeline,
  versionSource,
  pipelines,
  onClose,
  onCreate,
  onRevise,
}: {
  pipeline?: Pipeline;
  versionSource?: Pipeline;
  pipelines: Pipeline[];
  onClose: () => void;
  onCreate: (p: Pipeline, draft: boolean) => void;
  onRevise: (fields: PipelineFields, draft: boolean) => void;
}) {
  const source = pipeline || versionSource;
  const working = pipeline?.revisionDraft
    ? { ...source, ...pipeline.revisionDraft }
    : source;
  const [attachments, setAttachments] = useState<Attachment[]>(
    working?.attachments || [],
  );
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sourceOpen, setSourceOpen] = useState(false);
  const [evidenceBusy, setEvidenceBusy] = useState(false);
  const fields = useRef<Record<string, HTMLInputElement | null>>({});
  const proposedVersion = pipeline
    ? pipeline.status === "Draft"
      ? pipeline.version
      : nextAvailableVersion(pipeline, pipelines, "patch")
    : versionSource
      ? nextAvailableVersion(versionSource, pipelines, "minor")
      : "v1.0.0";
  const feedback = pipeline?.history.find((event) =>
    /changes requested|rejected/.test(event.title),
  );
  const [form, setForm] = useState({
    name: source?.name || "",
    description: working?.description || "",
    repo: working?.repo || "",
    branch: working?.branch ?? "main",
    category: working?.category || "Data processing",
    input: working?.input ?? "Structured clinical data (CSV)",
    output: working?.output ?? "Processed dataset (CSV)",
  });
  const update = (key: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => ({ ...previous, [key]: "" }));
    setError("");
  };
  const showErrors = (
    errors: Record<string, string>,
    target: number,
    message: string,
  ) => {
    setFieldErrors(errors);
    setError(message);
    setStep(target);
    if (errors.branch) setSourceOpen(true);
    const key = Object.keys(errors)[0];
    setTimeout(() => fields.current[key]?.focus(), 0);
    return false;
  };
  const validName = () => {
    if (!form.name.trim())
      return showErrors(
        { name: "Name this working draft before saving." },
        0,
        "Add a pipeline name.",
      );
    if (
      !source &&
      pipelines.some(
        (p) => p.name.trim().toLowerCase() === form.name.trim().toLowerCase(),
      )
    )
      return showErrors(
        {
          name: "This name already exists. Open its published version to submit an update.",
        },
        0,
        "Choose a unique pipeline name.",
      );
    return true;
  };
  const valid = () => {
    if (!validName()) return false;
    const errors: Record<string, string> = {};
    if (!form.description.trim())
      errors.description = "Describe the research purpose.";
    try {
      const url = new URL(form.repo.trim());
      if (!["http:", "https:"].includes(url.protocol) || !url.hostname)
        throw new Error();
    } catch {
      errors.repo = "Enter a valid HTTP(S) repository URL.";
    }
    if (!form.branch.trim()) errors.branch = "Choose a branch or tag.";
    if (Object.keys(errors).length)
      return showErrors(
        errors,
        0,
        "Complete the highlighted source fields before continuing.",
      );
    setError("");
    setFieldErrors({});
    return true;
  };
  const validRequirements = () => {
    const errors: Record<string, string> = {};
    if (!form.input.trim())
      errors.input = "Define the required input format and fields.";
    if (!form.output.trim()) errors.output = "Define the expected output.";
    if (Object.keys(errors).length)
      return showErrors(
        errors,
        1,
        "Define both the input specification and expected output.",
      );
    setError("");
    setFieldErrors({});
    return true;
  };
  const submit = (draft: boolean) => {
    if (evidenceBusy || !(draft ? validName() : valid())) return;
    if (!draft && !validRequirements()) return;
    if (pipeline) onRevise({ ...form, attachments }, draft);
    else
      onCreate(
        {
          ...form,
          name: form.name.trim(),
          description: form.description.trim(),
          repo: form.repo.trim(),
          id: uid("pipe"),
          version: proposedVersion,
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
  const field = (
    key: keyof typeof form,
    label: string,
    extra: Record<string, unknown> = {},
  ) => (
    <TextField
      label={label}
      value={form[key]}
      onChange={(event) => update(key, event.target.value)}
      fullWidth
      inputRef={(node: HTMLInputElement | null) => {
        fields.current[key] = node;
      }}
      error={Boolean(fieldErrors[key])}
      helperText={fieldErrors[key]}
      {...extra}
    />
  );
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {pipeline
          ? pipeline.status === "Draft"
            ? "Edit pipeline draft"
            : "Revise pipeline"
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
          {pipeline && pipeline.status !== "Draft"
            ? "Save your working revision at any time. Resubmission restarts all four approval stages."
            : "Start with a name. Save a draft at any time; complete the required fields before submission."}
        </p>
        {feedback && (
          <div className="revision-context" role="note">
            <strong>Requested changes · {feedback.actor}</strong>
            <p>{feedback.note}</p>
          </div>
        )}
        <Stepper activeStep={step} className="form-stepper">
          {["Source & purpose", "Requirements", "Review & submit"].map(
            (label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ),
          )}
        </Stepper>
        {step === 0 && (
          <div className="form-stack">
            <div className="form-section-heading">
              <h3>What does this pipeline do?</h3>
              {!source && (
                <Button
                  size="small"
                  onClick={() => {
                    setForm({
                      name: "Longitudinal outcome classifier",
                      description:
                        "Classifies longitudinal outcomes from synthetic clinical records.",
                      repo: "https://github.com/research/outcome-classifier",
                      branch: "main",
                      category: "ML model",
                      input: "Structured clinical data (CSV)",
                      output: "Outcome classification (CSV)",
                    });
                    setFieldErrors({});
                    setError("");
                  }}
                >
                  Use example
                </Button>
              )}
            </div>
            {field("name", "Pipeline name", {
              autoFocus: true,
              required: true,
              disabled: Boolean(source),
            })}
            {field("description", "Research purpose", {
              multiline: true,
              minRows: 2,
              required: true,
            })}
            {field("repo", "Repository URL", {
              placeholder: "https://github.com/research/my-pipeline",
              required: true,
            })}
            <details
              className="disclosure"
              open={sourceOpen}
              onToggle={(event) => setSourceOpen(event.currentTarget.open)}
            >
              <summary>
                Source settings · {form.branch || "branch required"} ·{" "}
                {form.category}
              </summary>
              <div className="form-two-col disclosure-content">
                {field("branch", "Branch or tag", { required: true })}
                <TextField
                  select
                  label="Category"
                  fullWidth
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                >
                  {["Data processing", "ML model", "Privacy", "Audio"].map(
                    (category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ),
                  )}
                </TextField>
              </div>
            </details>
            <p className="micro-copy">
              Repository details are recorded for this demo. No source code is
              fetched.
            </p>
          </div>
        )}
        {step === 1 && (
          <div className="form-stack">
            <h3>Define the processing contract</h3>
            {field("input", "Input specification", {
              required: true,
              helperText:
                fieldErrors.input ||
                "Include the format and required fields, for example CSV with record_id and clinical_note.",
            })}
            {field("output", "Expected output", {
              required: true,
              helperText:
                fieldErrors.output ||
                "Describe the output format and fields reviewers should expect.",
            })}
            <div>
              <h3>Review evidence · {attachments.length} attached files</h3>
              <p className="muted">
                Add specifications, handling statements or synthetic examples
                for the reviewers.
              </p>
            </div>
            <AttachmentPicker
              attachments={attachments}
              onChange={setAttachments}
              onBusyChange={setEvidenceBusy}
            />
            <details className="disclosure">
              <summary>Evidence guidance by review stage</summary>
              <ul className="guidance-list">
                <li>
                  <strong>Ethical:</strong> purpose, consent boundaries and
                  potential harms.
                </li>
                <li>
                  <strong>Technical:</strong> dependencies, input/output schema
                  and sample execution.
                </li>
                <li>
                  <strong>Privacy:</strong> sensitive fields, minimization and
                  output disclosure risks.
                </li>
                <li>
                  <strong>Security:</strong> dependencies, secrets, network
                  access and execution permissions.
                </li>
              </ul>
              <p className="micro-copy">
                Evidence is previewed locally. No repository scan or backend
                execution is performed.
              </p>
            </details>
          </div>
        )}
        {step === 2 && (
          <div className="form-stack submission-summary">
            <div className="section-title">
              <h3>
                {form.name} · {proposedVersion}
              </h3>
              <Button size="small" onClick={() => setStep(0)}>
                Edit source
              </Button>
            </div>
            <p className="muted">{form.description}</p>
            <dl className="metadata-list">
              {[
                ["Version", proposedVersion],
                ["Repository", form.repo],
                ["Branch / tag", form.branch],
                ["Category", form.category],
              ].map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="section-title">
              <h3>Requirements and evidence</h3>
              <Button size="small" onClick={() => setStep(1)}>
                Edit requirements
              </Button>
            </div>
            <dl className="metadata-list">
              <div>
                <dt>Input</dt>
                <dd>{form.input}</dd>
              </div>
              <div>
                <dt>Output</dt>
                <dd>{form.output}</dd>
              </div>
              <div>
                <dt>Evidence</dt>
                <dd>
                  {attachments.length
                    ? attachments.map((a) => a.name).join(", ")
                    : "No files attached · standard demo evidence is illustrative"}
                </dd>
              </div>
            </dl>
            <div className="next-owner">
              <strong>Next: Ethical review</strong>
              <span>Dr. Maya Patel · {proposedVersion}</span>
            </div>
            <details className="disclosure">
              <summary>Required approval path</summary>
              <StagePath illustrative />
              <p className="muted">
                All four reviews and separate author publication are required
                before this version can run.
              </p>
            </details>
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
        <Button disabled={evidenceBusy} onClick={() => submit(true)}>
          {pipeline && pipeline.status !== "Draft"
            ? "Save revision draft"
            : "Save draft"}
        </Button>
        {step < 2 ? (
          <Button
            variant="contained"
            disabled={evidenceBusy}
            endIcon={<ArrowRight size={16} />}
            onClick={() => {
              if (
                (step === 0 && valid()) ||
                (step === 1 && validRequirements())
              )
                setStep(step + 1);
            }}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={evidenceBusy}
            onClick={() => submit(false)}
          >
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
  onImport: (dataset: Dataset) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<{
    name: string;
    rows: number;
    size: string;
    columns: string[];
    preview: string[][];
  } | null>(null);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const readSequence = useRef(0);
  const sample = () => {
    readSequence.current += 1;
    setReading(false);
    setName("Clinical research · Demo cohort");
    setDescription(
      "Synthetic records for demonstrating the processing workflow.",
    );
    setFile({
      name: "synthetic-clinical-records.csv",
      rows: 120,
      size: "24 KB",
      columns: ["record_id", "clinical_note", "visit_date"],
      preview: [
        ["REC-001", "Synthetic follow-up note", "2026-11-01"],
        ["REC-002", "Synthetic consultation note", "2026-11-02"],
        ["REC-003", "Synthetic progress note", "2026-11-03"],
      ],
    });
    setError("");
  };
  const readFile = async (file?: File) => {
    if (!file) return;
    const sequence = ++readSequence.current;
    setFile(null);
    setReading(true);
    setError("");
    if (
      !file.name.toLowerCase().endsWith(".csv") ||
      file.size > 5 * 1024 * 1024
    ) {
      setError(
        "Choose a CSV file smaller than 5 MB, or use the synthetic example.",
      );
      setReading(false);
      return;
    }
    try {
      const text = await file.text();
      if (sequence !== readSequence.current) return;
      const parsed = parseDatasetCsv(text);
      setFile({
        name: file.name,
        ...parsed,
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      });
      setName((current) => current || file.name.replace(/\.csv$/i, ""));
    } catch (error) {
      if (sequence === readSequence.current)
        setError(
          error instanceof Error
            ? error.message
            : "This file could not be read. Try the synthetic example.",
        );
    } finally {
      if (sequence === readSequence.current) setReading(false);
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
        <input
          ref={input}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(event) => {
            void readFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        {file ? (
          <>
            <div className="selected-file">
              <FileText size={24} />
              <div>
                <strong>{file.name}</strong>
                <span>
                  {file.rows.toLocaleString()} records / {file.size}
                </span>
              </div>
              <div className="file-actions">
                <Button size="small" onClick={() => input.current?.click()}>
                  Replace
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    readSequence.current += 1;
                    setFile(null);
                    setReading(false);
                    setError("");
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
            <details className="disclosure import-preview">
              <summary>
                Preview columns and sample rows · {file.columns.length} columns
              </summary>
              <TableContainer>
                <Table size="small" aria-label="Dataset sample preview">
                  <TableHead>
                    <TableRow>
                      {file.columns.map((column) => (
                        <TableCell key={column}>{column}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {file.preview.map((row, index) => (
                      <TableRow key={index}>
                        {row.map((value, column) => (
                          <TableCell key={column}>{value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <p className="micro-copy">
                Only metadata and column names are saved. These preview rows are
                discarded when you close this dialog.
              </p>
            </details>
          </>
        ) : (
          <>
            <div
              className="upload-zone"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void readFile(event.dataTransfer.files[0]);
              }}
            >
              <Upload size={28} strokeWidth={1.4} />
              <strong>Drop a CSV file here</strong>
              <span>CSV, up to 5 MB. File contents are not uploaded.</span>
              <Button
                variant="outlined"
                size="small"
                onClick={() => input.current?.click()}
              >
                Choose file
              </Button>
            </div>
            <div className="sample-divider">
              <span>or</span>
              <Button onClick={sample} size="small">
                Use synthetic example
              </Button>
            </div>
          </>
        )}
        {reading && <p role="status">Reading and validating CSV…</p>}
        <div className="form-stack">
          <TextField
            label="Dataset name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <p className="micro-copy">
            Restricted research use. Outputs require privacy validation before
            download.
          </p>
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
          disabled={!file || !name.trim() || reading || Boolean(error)}
          onClick={() => {
            if (file && !reading && !error)
              onImport({
                id: uid("data"),
                name: name.trim(),
                description:
                  description.trim() ||
                  "Imported dataset for research processing.",
                rows: file.rows,
                size: file.size,
                columns: file.columns,
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
    pipeline && dataset && supportsDataset(pipeline, dataset),
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
          {dataset && (
            <div className="dataset-contract">
              <strong>
                {dataset.rows.toLocaleString()} records · {dataset.format}
              </strong>
              {compatible && <Status kind="success">Format matches</Status>}
              <details className="disclosure">
                <summary>Inspect dataset columns</summary>
                <p>
                  {dataset.columns?.join(", ") ||
                    "Column metadata is not available for this dataset."}
                </p>
                <p className="micro-copy">
                  The prototype checks file format only. Inspect required fields
                  against the input specification; schema mapping is not
                  verified.
                </p>
              </details>
            </div>
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
  onSimulation,
}: {
  artifact: Artifact;
  role: Role;
  setRole: (role: Role) => void;
  onClose: () => void;
  onReview: (accept: boolean, comment: string) => void;
  notify: (message: string) => void;
  onSimulation: () => void;
}) {
  const [outcome, setOutcome] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const preview = artifactPreview(a);
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
        <dl className="metadata-list compact-metadata">
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
          {a.output && (
            <div>
              <dt>Declared output</dt>
              <dd>{a.output}</dd>
            </div>
          )}
          <div>
            <dt>Output records</dt>
            <dd>
              {a.rows.toLocaleString()} declared records / {preview.rows.length}{" "}
              synthetic sample rows shown
            </dd>
          </div>
        </dl>
        <h3>Output preview</h3>
        <TableContainer className="artifact-preview">
          <Table size="small" aria-label="Synthetic output preview">
            <TableHead>
              <TableRow>
                {preview.labels.map((label) => (
                  <TableCell key={label}>{label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {preview.rows.map((row) => (
                <TableRow key={row[0]}>
                  {row.map((cell, index) => (
                    <TableCell key={index}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <p className="micro-copy">Synthetic sample only. {preview.note}</p>
        {a.status === "Pending review" ? (
          <div className="artifact-review-form">
            <h3>Validation decision</h3>
            <p className="review-purpose">{preview.criteria}</p>
            {role !== "Privacy reviewer" ? (
              <>
                <p>
                  A privacy reviewer validates outputs before download. This
                  output is awaiting their decision.
                </p>
                <div className="demo-handoff">
                  <span className="eyebrow">Demo controls</span>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setRole("Privacy reviewer")}
                  >
                    Continue as Privacy reviewer
                  </Button>
                </div>
              </>
            ) : (
              <>
                <RadioGroup
                  row
                  value={outcome}
                  onChange={(event) => {
                    setOutcome(event.target.value);
                    setError("");
                  }}
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
                  onChange={(event) => {
                    setComment(event.target.value);
                    setError("");
                  }}
                  multiline
                  minRows={2}
                  fullWidth
                  placeholder="Explain your assessment; a reason is required when rejecting."
                  error={Boolean(error)}
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
          <div className="validation-receipt">
            <strong>
              {a.status === "Validated" ? "Output accepted" : "Output rejected"}
            </strong>
            <p>
              {a.reviewedBy || "Privacy reviewer"}
              {a.reviewedAt
                ? ` · ${formatTime(a.reviewedAt)}`
                : " · See activity history for the recorded decision"}
            </p>
            {a.comment && (
              <>
                <strong>Comment</strong>
                <p>{a.comment}</p>
              </>
            )}
            {a.status === "Not acceptable" && (
              <p>
                Download remains blocked. Investigate and rerun to create a new
                output for review.
              </p>
            )}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <button className="simulation-link" onClick={onSimulation}>
          Simulation controls
        </button>
        {a.status === "Pending review" && role === "Privacy reviewer" && (
          <Button
            variant="contained"
            disabled={!outcome}
            onClick={() => {
              if (!outcome) return;
              if (outcome === "unacceptable" && !comment.trim()) {
                setError("Explain why this output is not acceptable.");
                return;
              }
              onReview(outcome === "acceptable", comment.trim());
            }}
          >
            {!outcome
              ? "Choose a decision"
              : outcome === "acceptable"
                ? "Accept output"
                : "Reject output"}
          </Button>
        )}
        <Button
          variant={a.status === "Validated" ? "contained" : "outlined"}
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
