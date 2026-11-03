import { useState } from "react";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  ArrowRight,
  Database,
  Download,
  FileText,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  formatDate,
  formatTime,
  executionStepStatus,
  type Artifact,
  type Dataset,
  type Run,
  type Role,
  type Workspace,
} from "./model";
import { EmptyState, PageHeader, SearchField, Status } from "./ui";
import { WorkspaceDialog } from "./WorkspaceDialog";
import { RunSupport } from "./RunSupport";
import { downloadRunLog, downloadText } from "./files";
import { encodeCsv } from "./csv";
import { artifactPreview } from "./artifactPreview";

export function Datasets({
  state,
  onImport,
  onRun,
  researcher,
  initialDatasetId,
}: {
  state: Workspace;
  onImport: () => void;
  onRun: (d: Dataset) => void;
  researcher: boolean;
  initialDatasetId?: string;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Dataset | null>(
    () => state.datasets.find((d) => d.id === initialDatasetId) || null,
  );
  const rows = state.datasets.filter((d) =>
    `${d.name} ${d.description}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Datasets"
        description="The source material for your research workflows."
      >
        <Button
          variant="contained"
          onClick={onImport}
          startIcon={<Plus size={17} />}
          disabled={!researcher}
        >
          Import dataset
        </Button>
      </PageHeader>
      <div className="section-note">
        Demo workspace / All seeded records are synthetic. Imported files stay
        in your browser.
      </div>
      <section className="table-panel">
        <div className="filter-bar">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search datasets..."
          />
        </div>
        <TableContainer>
          <Table
            aria-label="Datasets"
            role="table"
            className="mobile-card-table"
          >
            <TableHead>
              <TableRow>
                {[
                  "Dataset",
                  "Format",
                  "Records",
                  "Size",
                  "Access",
                  "Imported",
                  "Action",
                ].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody role="rowgroup">
              {rows.map((d) => (
                <TableRow role="row" hover key={d.id}>
                  <TableCell
                    className="name-cell"
                    role="cell"
                    data-label="Dataset"
                  >
                    <button
                      className="entity-name"
                      onClick={() => setSelected(d)}
                    >
                      {d.name}
                    </button>
                    <p>{d.description}</p>
                  </TableCell>
                  <TableCell className="mono" role="cell" data-label="Format">
                    {d.format}
                  </TableCell>
                  <TableCell role="cell" data-label="Records">
                    {d.rows.toLocaleString()}
                  </TableCell>
                  <TableCell className="nowrap" role="cell" data-label="Size">
                    {d.size}
                  </TableCell>
                  <TableCell role="cell" data-label="Access">
                    <Status>Restricted</Status>
                  </TableCell>
                  <TableCell
                    className="nowrap"
                    role="cell"
                    data-label="Imported"
                  >
                    {formatDate(d.date)}
                  </TableCell>
                  <TableCell
                    role="cell"
                    data-label="Action"
                    className="mobile-card-actions"
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onRun(d)}
                      disabled={!researcher}
                    >
                      Run pipeline
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {!rows.length && (
          <EmptyState
            title="No datasets found"
            description="Import a dataset or try a different search."
          />
        )}
        <div className="table-footer">
          {rows.length} datasets / Restricted research access
        </div>
      </section>
      <WorkspaceDialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{selected?.name}</DialogTitle>
        <DialogContent>
          <p>{selected?.description}</p>
          <dl className="metadata-list">
            {selected &&
              [
                ["Format", selected.format],
                ["Records", selected.rows.toLocaleString()],
                ["Size", selected.size],
                ["Imported", formatTime(selected.date)],
                ["Access", "Restricted / research use"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
          <p className="muted">
            The prototype stores file metadata locally. It does not upload
            research data or enforce access permissions.
          </p>
          {selected?.columns && (
            <details className="disclosure">
              <summary>Dataset columns · {selected.columns.length}</summary>
              <p>{selected.columns.join(", ")}</p>
            </details>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
          <Button
            variant="contained"
            disabled={!researcher}
            onClick={() => {
              if (selected) onRun(selected);
              setSelected(null);
            }}
          >
            Run pipeline
          </Button>
        </DialogActions>
      </WorkspaceDialog>
    </>
  );
}

interface RunsProps {
  state: Workspace;
  onNewRun: () => void;
  onArtifact: (a: Artifact) => void;
  onRetry: (r: Run) => void;
  onSimulation: () => void;
  researcher: boolean;
  initialTab?: string;
  initialRunId?: string;
  role: Role;
  setRole: (role: Role) => void;
  onCancel: (run: Run) => void;
  onReport: (id: string, message: string) => void;
  onResolve: (id: string, resolution: string) => void;
}
export function RunsAndResults({
  state,
  onNewRun,
  onArtifact,
  onRetry,
  onSimulation,
  researcher,
  initialTab = "runs",
  initialRunId,
  role,
  setRole,
  onCancel,
  onReport,
  onResolve,
}: RunsProps) {
  const [tab, setTab] = useState(initialTab);
  const [search, setSearch] = useState("");
  const [selectedRun, setSelectedRun] = useState<string | null>(
    initialRunId || null,
  );
  const run = state.runs.find((r) => r.id === selectedRun);
  const runs = state.runs.filter((r) =>
    `${r.id} ${r.pipelineName} ${r.datasetName}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const artifacts = state.artifacts.filter((a) =>
    `${a.name} ${a.datasetName}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Runs & results"
        description="Follow execution. Inspect outputs. Know what is ready to use."
      >
        <Button
          variant="contained"
          onClick={onNewRun}
          startIcon={<Plus size={17} />}
          disabled={!researcher}
        >
          New run
        </Button>
      </PageHeader>
      <section className="table-panel">
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          aria-label="Runs and results"
        >
          <Tab value="runs" label={`Runs ${state.runs.length}`} />
          <Tab value="results" label={`Results ${state.artifacts.length}`} />
        </Tabs>
        <div className="filter-bar">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder={
              tab === "runs" ? "Search runs..." : "Search results..."
            }
          />
        </div>
        <TableContainer>
          {tab === "runs" ? (
            <Table aria-label="Runs" role="table" className="mobile-card-table">
              <TableHead>
                <TableRow>
                  {[
                    "Run / pipeline",
                    "Dataset",
                    "Progress",
                    "Status",
                    "Started",
                    "Action",
                  ].map((h) => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody role="rowgroup">
                {runs.map((r) => (
                  <TableRow role="row" hover key={r.id}>
                    <TableCell
                      className="name-cell"
                      role="cell"
                      data-label="Run / pipeline"
                    >
                      <button
                        className="entity-name"
                        onClick={() => setSelectedRun(r.id)}
                      >
                        {r.pipelineName}
                      </button>
                      <p className="mono">
                        {r.id} / {r.version}
                      </p>
                    </TableCell>
                    <TableCell role="cell" data-label="Dataset">
                      {r.datasetName}
                    </TableCell>
                    <TableCell role="cell" data-label="Progress">
                      <div className="run-progress">
                        <LinearProgress
                          variant="determinate"
                          value={r.progress}
                          color={r.status === "Failed" ? "error" : "primary"}
                        />
                        <small>{r.progress}%</small>
                      </div>
                    </TableCell>
                    <TableCell role="cell" data-label="Status">
                      <Status
                        kind={
                          r.status === "Completed"
                            ? "success"
                            : r.status === "Failed"
                              ? "error"
                              : "neutral"
                        }
                      >
                        {r.status}
                      </Status>
                      {r.artifactId && (
                        <span className="output-state">
                          Output:{" "}
                          {state.artifacts.find((a) => a.id === r.artifactId)
                            ?.status === "Validated"
                            ? "Ready to download"
                            : state.artifacts.find((a) => a.id === r.artifactId)
                                  ?.status === "Not acceptable"
                              ? "Rejected"
                              : "Awaiting validation"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className="nowrap"
                      role="cell"
                      data-label="Started"
                    >
                      {formatDate(r.date)}
                    </TableCell>
                    <TableCell
                      role="cell"
                      data-label="Action"
                      className="mobile-card-actions"
                    >
                      {r.artifactId && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            const output = state.artifacts.find(
                              (a) => a.id === r.artifactId,
                            );
                            if (output) onArtifact(output);
                          }}
                        >
                          {role === "Privacy reviewer" &&
                          state.artifacts.find((a) => a.id === r.artifactId)
                            ?.status === "Pending review"
                            ? "Review output"
                            : "View output"}
                        </Button>
                      )}
                      {r.status === "Failed" && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => setSelectedRun(r.id)}
                        >
                          Fix input
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setSelectedRun(r.id)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table
              aria-label="Results"
              role="table"
              className="mobile-card-table"
            >
              <TableHead>
                <TableRow>
                  {[
                    "Artifact",
                    "Source dataset",
                    "Records",
                    "Validation",
                    "Created",
                    "Action",
                  ].map((h) => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody role="rowgroup">
                {artifacts.map((a) => (
                  <TableRow role="row" hover key={a.id}>
                    <TableCell
                      className="name-cell"
                      role="cell"
                      data-label="Artifact"
                    >
                      <button
                        className="entity-name"
                        onClick={() => onArtifact(a)}
                      >
                        {a.name}
                      </button>
                      <p className="mono">
                        {a.runId} / {a.version}
                      </p>
                    </TableCell>
                    <TableCell role="cell" data-label="Source dataset">
                      {a.datasetName}
                    </TableCell>
                    <TableCell role="cell" data-label="Records">
                      {a.rows.toLocaleString()}
                    </TableCell>
                    <TableCell role="cell" data-label="Validation">
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
                    </TableCell>
                    <TableCell
                      className="nowrap"
                      role="cell"
                      data-label="Created"
                    >
                      {formatDate(a.date)}
                    </TableCell>
                    <TableCell
                      role="cell"
                      data-label="Action"
                      className="mobile-card-actions"
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => onArtifact(a)}
                      >
                        {a.status === "Pending review" &&
                        role === "Privacy reviewer"
                          ? "Review output"
                          : "View output"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        {!(tab === "runs" ? runs.length : artifacts.length) && (
          <EmptyState
            title={tab === "runs" ? "No runs found" : "No results yet"}
            description="Start a run with an approved pipeline to generate a demonstration output."
          />
        )}
        <div className="table-footer">
          <span>
            {tab === "runs" ? runs.length : artifacts.length}{" "}
            {tab === "runs" ? "runs" : "results"}
          </span>
          <span>Execution is simulated in demo mode</span>
        </div>
      </section>
      <WorkspaceDialog
        open={Boolean(run)}
        onClose={() => setSelectedRun(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Run details</DialogTitle>
        <DialogContent>
          {run && (
            <>
              <div className="detail-identity">
                <span className="mono">{run.id}</span>
                <Status
                  kind={
                    run.status === "Failed"
                      ? "error"
                      : run.status === "Completed"
                        ? "success"
                        : "neutral"
                  }
                >
                  {run.status}
                </Status>
              </div>
              <h3>{run.pipelineName}</h3>
              <p className="muted">
                {run.datasetName} / {run.version}
              </p>
              {run.error && (
                <div className="error-message">
                  <strong>Data error</strong>
                  <p>{run.error}</p>
                  <p className="micro-copy">
                    Retry uses a synthetic example mapping. Your source dataset
                    is not changed.
                  </p>
                </div>
              )}
              <details
                className="disclosure execution-details"
                open={run.status === "Running" || run.status === "Completed"}
              >
                <summary>Execution steps</summary>
                <div className="execution-timeline">
                  {[
                    "Validate input",
                    "Prepare environment",
                    "Process records",
                    "Write output",
                  ].map((label, i) => {
                    const status = executionStepStatus(run, i);
                    return (
                      <div key={label}>
                        <span className={status === "Complete" ? "done" : ""}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <strong>{label}</strong>
                        <small>{status}</small>
                      </div>
                    );
                  })}
                </div>
              </details>
              {(run.status === "Failed" || run.support) && (
                <RunSupport
                  key={run.id}
                  run={run}
                  role={role}
                  setRole={setRole}
                  onReport={(message) => onReport(run.id, message)}
                  onResolve={(resolution) => onResolve(run.id, resolution)}
                />
              )}
              <p className="muted">
                Demo execution uses synthetic output. No research code runs on a
                server.
              </p>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRun(null)}>Close</Button>
          <button
            className="simulation-link"
            onClick={() => {
              setSelectedRun(null);
              onSimulation();
            }}
          >
            Simulation controls
          </button>
          {run && (
            <Button
              startIcon={<Download size={15} />}
              onClick={() => downloadRunLog(run)}
            >
              Export log
            </Button>
          )}
          {run?.status === "Running" && (
            <Button
              color="error"
              disabled={!researcher}
              onClick={() => onCancel(run)}
            >
              Cancel run
            </Button>
          )}
          {(run?.status === "Failed" || run?.status === "Cancelled") && (
            <Button
              variant="contained"
              disabled={!researcher}
              startIcon={<RotateCcw size={16} />}
              onClick={() => {
                onRetry(run);
              }}
            >
              {run.status === "Failed"
                ? "Retry demo with example mapping"
                : "Restart demo run"}
            </Button>
          )}
          {run?.artifactId && (
            <Button
              variant="contained"
              endIcon={<ArrowRight size={16} />}
              onClick={() => {
                const a = state.artifacts.find((a) => a.id === run.artifactId);
                if (a) onArtifact(a);
                setSelectedRun(null);
              }}
            >
              Inspect output
            </Button>
          )}
        </DialogActions>
      </WorkspaceDialog>
    </>
  );
}

export function downloadArtifact(artifact: Artifact) {
  const preview = artifactPreview(artifact);
  const content = encodeCsv([
    [...preview.headers, "run_id", "pipeline_version"],
    ...preview.rows.map((row) => [...row, artifact.runId, artifact.version]),
  ]);
  downloadText(
    `${artifact.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-sample.csv`,
    content,
    "text/csv;charset=utf-8",
  );
}
