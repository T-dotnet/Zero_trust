import { useState, type Dispatch } from "react";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { STAGES, type Action, type Workspace } from "./model";
import { WorkspaceDialog } from "./WorkspaceDialog";

export function SimulationControls({
  state,
  pipelineId,
  artifactId,
  dispatch,
  onClose,
}: {
  state: Workspace;
  pipelineId?: string | null;
  artifactId?: string | null;
  dispatch: Dispatch<Action>;
  onClose: () => void;
}) {
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
    <WorkspaceDialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Simulation controls</DialogTitle>
      <DialogContent>
        <p className="muted">
          Walkthrough shortcuts for steps that would normally require another
          person or a system event. These affect local demo data only.
        </p>
        <div className="simulation-section">
          <h3>Reviewer handoffs</h3>
          <TextField
            select
            fullWidth
            label="Demo submission"
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
                Waiting for {STAGES[pipeline.stage]} review. Simulated decisions
                are recorded separately for every required stage.
              </p>
              <div className="simulation-actions">
                <Button variant="outlined" onClick={() => approve(false)}>
                  Simulate {STAGES[pipeline.stage]} approval
                </Button>
                <Button onClick={() => approve(true)}>
                  Simulate remaining reviews
                </Button>
              </div>
            </>
          ) : pipeline?.status === "Ready to publish" ? (
            <>
              <p>
                All four reviews are complete. Publication remains a separate
                author event.
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
                Simulate author publication
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
            Complete waiting runs
          </Button>
        </details>
        <details className="disclosure">
          <summary>Output validation</summary>
          <div className="disclosure-content">
            <TextField
              select
              fullWidth
              label="Demo output"
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
            Simulate output acceptance
          </Button>
        </details>
        {message && (
          <p role="status" className="simulation-feedback">
            {message}
          </p>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Return to prototype
        </Button>
      </DialogActions>
    </WorkspaceDialog>
  );
}
