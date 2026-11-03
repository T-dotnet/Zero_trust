import { useState } from "react";
import {
  Alert,
  Button,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  ThemeProvider,
  type AlertColor,
} from "@mui/material";
import { Shell } from "./Shell";
import { PipelineCatalog, Approvals, Overview } from "./PipelineViews";
import { ReviewView } from "./ReviewView";
import { Datasets, RunsAndResults } from "./DataAndRuns";
import {
  ArtifactDialog,
  HelpDialog,
  ImportDialog,
  PipelineForm,
  RunDialog,
} from "./Dialogs";
import { HistoryList, PageHeader } from "./ui";
import {
  now,
  uid,
  type Dataset,
  type Page,
  type Pipeline,
  type Role,
} from "./model";
import { useWorkspace } from "./useWorkspace";
import { downloadText } from "./files";
import { theme } from "./theme";
import "./mvp.css";

export default function MvpApp() {
  const { state, dispatch, storageAvailable } = useWorkspace();
  const [page, setPage] = useState<Page>("Pipelines");
  const [role, setRole] = useState<Role>("Researcher");
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
    null,
  );
  const [artifactId, setArtifactId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<
    "pipeline" | "import" | "run" | "help" | "reset" | null
  >(null);
  const [versionSourceId, setVersionSourceId] = useState<string | null>(null);
  const [reviseId, setReviseId] = useState<string | null>(null);
  const [runContext, setRunContext] = useState<{
    pipelineId?: string;
    datasetId?: string;
  }>({});
  const [toast, setToastState] = useState<{
    message: string;
    severity: AlertColor;
  }>({ message: "", severity: "success" });
  const setToast = (message: string, severity: AlertColor = "success") =>
    setToastState({ message, severity });
  const selectedPipeline = state.pipelines.find(
    (p) => p.id === selectedPipelineId,
  );
  const artifact = state.artifacts.find((a) => a.id === artifactId);
  const navigate = (next: Page) => {
    setPage(next);
    setSelectedPipelineId(null);
  };
  const openPipeline = (p: Pipeline) => {
    setSelectedPipelineId(p.id);
    setPage("Approvals");
  };
  const openRun = (p?: Pipeline, d?: Dataset) => {
    if (role !== "Researcher") {
      setToast("Switch to Researcher to configure a run.", "info");
      return;
    }
    setRunContext({ pipelineId: p?.id, datasetId: d?.id });
    setDialog("run");
  };
  const createPipeline = () => {
    if (role !== "Researcher") {
      setToast("Switch to Researcher to create a pipeline.", "info");
      return;
    }
    setReviseId(null);
    setVersionSourceId(null);
    setDialog("pipeline");
  };
  const openImport = () => {
    setDialog("import");
  };
  const catalogProps = {
    state,
    onOpen: openPipeline,
    onNew: createPipeline,
    onRun: (p: Pipeline) => openRun(p),
    onApprovals: () => navigate("Approvals"),
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Shell
        page={page}
        setPage={navigate}
        role={role}
        setRole={setRole}
        approvalCount={
          state.pipelines.filter((p) => p.status === "In review").length
        }
        onReset={() => setDialog("reset")}
        onHelp={() => setDialog("help")}
        storageAvailable={storageAvailable}
      >
        {page === "Pipelines" && <PipelineCatalog {...catalogProps} />}
        {page === "Overview" && <Overview {...catalogProps} />}
        {page === "Datasets" && (
          <Datasets
            state={state}
            onImport={openImport}
            onRun={(d) => openRun(undefined, d)}
            researcher={role === "Researcher"}
          />
        )}
        {page === "Approvals" &&
          (selectedPipeline ? (
            <ReviewView
              key={`${selectedPipeline.id}-${selectedPipeline.stage}-${selectedPipeline.status}`}
              pipeline={selectedPipeline}
              role={role}
              setRole={setRole}
              onBack={() => setSelectedPipelineId(null)}
              onReview={(decision, note) => {
                dispatch({
                  type: "REVIEW",
                  id: selectedPipeline.id,
                  role,
                  decision,
                  note,
                });
                setToast(
                  decision === "approve"
                    ? `${["Ethical", "Technical", "Privacy", "Security"][selectedPipeline.stage]} review approved.`
                    : decision === "changes"
                      ? "Changes requested. The author can revise and resubmit."
                      : "Submission rejected. The decision and reason are recorded.",
                );
              }}
              onPublish={() => {
                dispatch({ type: "PUBLISH", id: selectedPipeline.id, role });
                setToast("Pipeline published to the approved catalog.");
              }}
              onRevise={() => {
                setReviseId(selectedPipeline.id);
                setDialog("pipeline");
              }}
              onNewVersion={() => {
                setReviseId(null);
                setVersionSourceId(selectedPipeline.id);
                setDialog("pipeline");
              }}
              onRun={() => openRun(selectedPipeline)}
            />
          ) : (
            <Approvals state={state} onOpen={openPipeline} />
          ))}
        {page === "Runs & results" && (
          <RunsAndResults
            state={state}
            onNewRun={() => openRun()}
            onArtifact={(a) => setArtifactId(a.id)}
            onRetry={(r) => {
              dispatch({ type: "RETRY", id: r.id });
              setToast(
                r.status === "Failed"
                  ? "Demo mapping corrected. Run restarted."
                  : "Demo run restarted.",
              );
            }}
            researcher={role === "Researcher"}
            role={role}
            setRole={setRole}
            onCancel={(r) => dispatch({ type: "CANCEL_RUN", id: r.id })}
            onReport={(id, message) =>
              dispatch({ type: "REPORT_ISSUE", id, message })
            }
            onResolve={(id, resolution) =>
              dispatch({ type: "RESOLVE_ISSUE", id, role, resolution })
            }
          />
        )}
        {page === "Activity log" && (
          <>
            <PageHeader
              title="Activity log"
              description="The decisions and actions behind every research output."
            >
              <Button
                variant="outlined"
                onClick={() =>
                  downloadText(
                    "zero-trust-activity.json",
                    JSON.stringify(
                      { generatedAt: now(), events: state.events },
                      null,
                      2,
                    ),
                    "application/json",
                  )
                }
              >
                Export history
              </Button>
            </PageHeader>
            <section className="plain-panel">
              <div className="section-title">
                <h2>Workspace history</h2>
                <span className="mono muted">{state.events.length} events</span>
              </div>
              <HistoryList events={state.events} />
            </section>
          </>
        )}
      </Shell>
      {dialog === "pipeline" && (
        <PipelineForm
          pipelines={state.pipelines}
          pipeline={state.pipelines.find((p) => p.id === reviseId)}
          versionSource={state.pipelines.find((p) => p.id === versionSourceId)}
          onClose={() => setDialog(null)}
          onCreate={(pipeline, draft) => {
            dispatch({ type: "SUBMIT", pipeline, draft });
            setDialog(null);
            openPipeline(pipeline);
            setToast(draft ? "Draft saved." : "Submitted for Ethical review.");
          }}
          onRevise={(fields) => {
            if (reviseId) dispatch({ type: "REVISE", id: reviseId, fields });
            setDialog(null);
            setToast("Revision submitted. All four reviews are required.");
          }}
        />
      )}
      {dialog === "import" && (
        <ImportDialog
          onClose={() => setDialog(null)}
          onImport={(dataset) => {
            dispatch({ type: "ADD_DATASET", dataset });
            setDialog(null);
            navigate("Datasets");
            setToast("Dataset registered in this browser.");
          }}
        />
      )}
      {dialog === "run" && (
        <RunDialog
          state={state}
          initialPipelineId={runContext.pipelineId}
          initialDatasetId={runContext.datasetId}
          onClose={() => setDialog(null)}
          onStart={(pipeline, dataset) => {
            dispatch({
              type: "START_RUN",
              run: {
                id: uid("RUN").toUpperCase(),
                pipelineId: pipeline.id,
                pipelineName: pipeline.name,
                version: pipeline.version,
                datasetId: dataset.id,
                datasetName: dataset.name,
                status: "Running",
                progress: 0,
                date: now(),
              },
            });
            setDialog(null);
            navigate("Runs & results");
            setToast(
              "Demo run started. Output will be ready in a few seconds.",
            );
          }}
        />
      )}
      {artifact && (
        <ArtifactDialog
          artifact={artifact}
          role={role}
          setRole={setRole}
          onClose={() => setArtifactId(null)}
          onReview={(accept, comment) => {
            dispatch({
              type: "REVIEW_ARTIFACT",
              id: artifact.id,
              role,
              accept,
              comment,
            });
            setToast(
              accept
                ? "Artifact validated. Sample download is now available."
                : "Artifact marked not acceptable. Download remains unavailable.",
            );
          }}
          notify={setToast}
        />
      )}
      {dialog === "help" && (
        <HelpDialog
          onClose={() => setDialog(null)}
          onStart={() => {
            setRole("Researcher");
            setVersionSourceId(null);
            setReviseId(null);
            setDialog("pipeline");
          }}
          onImport={() => {
            setRole("Researcher");
            setDialog("import");
          }}
          onApprovals={() => {
            setDialog(null);
            navigate("Approvals");
          }}
        />
      )}
      <Dialog
        open={dialog === "reset"}
        onClose={() => setDialog(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Reset demo workspace?</DialogTitle>
        <DialogContent>
          This removes your local demo changes and restores the original
          synthetic records. No external data is affected.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              dispatch({ type: "RESET" });
              setDialog(null);
              setArtifactId(null);
              setSelectedPipelineId(null);
              setRole("Researcher");
              navigate("Pipelines");
              setToast("Demo workspace reset.");
            }}
          >
            Reset demo
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={Boolean(toast.message)}
        autoHideDuration={4200}
        onClose={() => setToast("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast("")}
          sx={{ maxWidth: 420 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
