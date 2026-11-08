import { useState, type Dispatch } from "react";
import { Button, Drawer, IconButton, MenuItem, TextField } from "@mui/material";
import {
  STAGES,
  type Action,
  type Workspace,
  type Role,
  type Page,
} from "./model";
import { X, FileText, RotateCcw, ArrowUpRight } from "lucide-react";
import { useDemoActions } from "./DemoTools";
import { DialogActionBar } from "./DialogActionBar";

export function SimulationControls({
  state,
  pipelineId,
  artifactId,
  dispatch,
  onClose,
  role,
  onRoleChange,
  page,
  onNavigate,
  taskOpen,
  recoveryPending,
  onHelp,
  onReset,
}: {
  state: Workspace;
  pipelineId?: string | null;
  artifactId?: string | null;
  dispatch: Dispatch<Action>;
  onClose: () => void;
  role: Role;
  onRoleChange: (role: Role) => void;
  page: Page;
  onNavigate: (page: Page) => void;
  taskOpen: boolean;
  recoveryPending: boolean;
  onHelp: () => void;
  onReset: () => void;
}) {
  const actions = useDemoActions();
  const [selectedPipeline, setSelectedPipeline] = useState(
    pipelineId ||
      state.pipelines.find((p) => p.status === "In review")?.id ||
      "",
  );
  const [selectedArtifact, setSelectedArtifact] = useState(
    artifactId ||
      state.artifacts.find((a) => a.status === "Pending review")?.id ||
      "",
  );
  const [message, setMessage] = useState("");
  const pipeline = state.pipelines.find((p) => p.id === selectedPipeline);
  const artifact = state.artifacts.find((a) => a.id === selectedArtifact);
  const running = state.runs.filter((r) => r.status === "Running").length;
  const approve = (all: boolean) => {
    if (!pipeline || pipeline.status !== "In review") return;
    const last = all ? 4 : pipeline.stage + 1;
    for (let stage = pipeline.stage; stage < last; stage++)
      dispatch({
        type: "REVIEW",
        id: pipeline.id,
        role: `${STAGES[stage]} reviewer`,
        decision: "approve",
        note: "Simulated in prototype controls. Illustrative evidence confirmed for this walkthrough.",
      });
    setMessage(
      all
        ? "All remaining reviewer decisions simulated. Author publication is now available."
        : `${STAGES[pipeline.stage]} approval simulated and recorded in history.`,
    );
  };
  return (
    <Drawer
      open
      anchor="right"
      onClose={onClose}
      className="demo-controls-panel"
      sx={{ zIndex: 1302 }}
      slotProps={{
        paper: {
          role: "dialog",
          "aria-modal": true,
          "aria-labelledby": "demo-controls-title",
          id: "demo-controls-panel",
        },
      }}
    >
      <div className="demo-controls-header">
        <h2 id="demo-controls-title">Demo controls</h2>
        <IconButton aria-label="Close demo controls" onClick={onClose}>
          <X size={22} />
        </IconButton>
      </div>
      <div className="demo-controls-content">
        <p className="muted">
          Walkthrough shortcuts for steps that would normally require another
          person or a system event. These affect local demo data only.
        </p>
        <section className="demo-tools-section">
          <h3>Preview the workspace</h3>
          <div className="demo-tools-fields">
            <TextField
              select
              fullWidth
              label="Acting role"
              value={role}
              disabled={recoveryPending}
              slotProps={{
                select: {
                  MenuProps: { transitionDuration: 0, sx: { zIndex: 1303 } },
                },
              }}
              onChange={(event) => onRoleChange(event.target.value as Role)}
            >
              {[
                "Researcher",
                ...STAGES.map((stage) => `${stage} reviewer`),
              ].map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Jump to screen"
              value={page}
              disabled={taskOpen || recoveryPending}
              helperText={
                taskOpen
                  ? "Close the current task before jumping to another screen."
                  : "Open a screen with the selected acting role."
              }
              slotProps={{
                select: {
                  MenuProps: { transitionDuration: 0, sx: { zIndex: 1303 } },
                },
              }}
              onChange={(event) => onNavigate(event.target.value as Page)}
            >
              {[
                "Overview",
                "Datasets",
                "Pipelines",
                "Runs & results",
                "Approvals",
                "Activity log",
              ].map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          </div>
          {actions.length > 0 && (
            <div className="demo-tools-actions">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant="outlined"
                  onClick={() => {
                    action.run();
                    onClose();
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </section>
        {recoveryPending ? (
          <p role="status">
            Recover the saved workspace before using walkthrough shortcuts.
            Reset remains available below.
          </p>
        ) : (
          <>
            <div className="simulation-section">
              <h3>Reviewer handoffs</h3>
              <TextField
                select
                fullWidth
                label="Demo submission"
                slotProps={{
                  select: {
                    MenuProps: { transitionDuration: 0, sx: { zIndex: 1303 } },
                  },
                }}
                value={selectedPipeline}
                onChange={(event) => {
                  setSelectedPipeline(event.target.value);
                  setMessage("");
                }}
              >
                <MenuItem value="">Choose a submission</MenuItem>
                {state.pipelines.map((p) => (
                  <MenuItem value={p.id} key={p.id}>
                    {p.name} · {p.version}
                  </MenuItem>
                ))}
              </TextField>
              {pipeline?.status === "In review" ? (
                <>
                  <p>
                    Waiting for {STAGES[pipeline.stage]} review. Simulated
                    decisions are recorded separately for every required stage.
                  </p>
                  <div className="simulation-actions">
                    <Button variant="outlined" onClick={() => approve(false)}>
                      Approve stage
                    </Button>
                    <Button onClick={() => approve(true)}>
                      Approve remaining
                    </Button>
                  </div>
                </>
              ) : pipeline?.status === "Ready to publish" ? (
                <>
                  <p>
                    All four reviews are complete. Publication remains a
                    separate author event.
                  </p>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      dispatch({
                        type: "PUBLISH",
                        id: pipeline.id,
                        role: "Researcher",
                      });
                      setMessage(
                        "Author publication simulated. This version is available to run.",
                      );
                    }}
                  >
                    Publish pipeline
                  </Button>
                </>
              ) : (
                <p className="micro-copy">
                  {pipeline?.status === "Approved"
                    ? "This version is already published."
                    : "Complete and submit the draft or revision to begin its review sequence."}
                </p>
              )}
            </div>
            <details className="disclosure">
              <summary>Execution events · {running} waiting runs</summary>
              <p>
                Finish simulated execution without waiting for the demo timer.
                Outputs will still need privacy validation.
              </p>
              <Button
                disabled={!running}
                variant="outlined"
                onClick={() => {
                  for (let i = 0; i < 9; i++) dispatch({ type: "TICK" });
                  setMessage(
                    "Waiting demo runs completed. Their outputs are awaiting validation.",
                  );
                }}
              >
                Complete runs
              </Button>
            </details>
            <details className="disclosure">
              <summary>Output validation</summary>
              <div className="disclosure-content">
                <TextField
                  select
                  fullWidth
                  label="Demo output"
                  slotProps={{
                    select: {
                      MenuProps: {
                        transitionDuration: 0,
                        sx: { zIndex: 1303 },
                      },
                    },
                  }}
                  value={selectedArtifact}
                  onChange={(event) => {
                    setSelectedArtifact(event.target.value);
                    setMessage("");
                  }}
                >
                  <MenuItem value="">Choose an output</MenuItem>
                  {state.artifacts.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name} · {a.runId}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              <p>
                Simulate the privacy reviewer's acceptance to demonstrate the
                download step.
              </p>
              <Button
                disabled={!artifact || artifact.status !== "Pending review"}
                variant="outlined"
                onClick={() => {
                  if (!artifact) return;
                  dispatch({
                    type: "REVIEW_ARTIFACT",
                    id: artifact.id,
                    role: "Privacy reviewer",
                    accept: true,
                    comment:
                      "Acceptance simulated in prototype controls for the walkthrough. Synthetic sample only.",
                  });
                  setMessage(
                    "Output acceptance simulated and recorded. Sample download is available.",
                  );
                }}
              >
                Accept output
              </Button>
            </details>
            {message && (
              <p role="status" className="simulation-feedback">
                {message}
              </p>
            )}
          </>
        )}
        <section className="demo-tools-section">
          <h3>Walkthrough & workspace</h3>
          <div className="demo-tools-actions">
            <Button
              startIcon={<FileText size={18} />}
              disabled={taskOpen || recoveryPending}
              onClick={onHelp}
            >
              Walkthrough guide
            </Button>
            <Button
              component="a"
              href="/?view=full"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<ArrowUpRight size={18} />}
            >
              Open original workspace
            </Button>
            <Button
              color="error"
              startIcon={<RotateCcw size={18} />}
              onClick={onReset}
            >
              Reset demo data
            </Button>
          </div>
        </section>
      </div>
      <DialogActionBar
        primary={
          <Button variant="contained" onClick={onClose}>
            Done
          </Button>
        }
      />
    </Drawer>
  );
}
