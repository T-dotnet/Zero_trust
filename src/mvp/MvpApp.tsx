import { useLayoutEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  CssBaseline,
  Dialog,
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
import { ActivityView } from "./ActivityView";
import { SimulationControls } from "./SimulationControls";
import { DemoToolsProvider } from "./DemoTools";
import {
  now,
  pipelineRevision,
  pipelineNeedsAction,
  type Event,
  uid,
  type Dataset,
  type Page,
  type Pipeline,
  type Role,
} from "./model";
import { useWorkspace } from "./useWorkspace";
import { theme } from "./theme";
import { DialogActionBar } from "./DialogActionBar";
import { downloadText } from "./files";
import { useWorkspaceNavigation, WorkspaceNavigation } from "./navigation";
import { clearSessionDrafts } from "./useSessionDraft";
import "./mvp.css";
import "./ux.css";
import "./mobile.css";

export default function MvpApp() {
  const {
    state,
    dispatch,
    storageAvailable,
    recoveryData,
    recoveryReason,
    loadSavedWorkspace,
  } = useWorkspace();
  const navigation = useWorkspaceNavigation();
  const { route, navigate: go } = navigation;
  const { page, role } = route;
  const setRole = (role: Role) => go((previous) => ({ ...previous, role }));
  const selectedPipelineId = route.pipeline || null;
  const setSelectedPipelineId = (id: string | null) =>
    go((previous) => ({ ...previous, pipeline: id || undefined }));
  const artifactId = route.output || null;
  const setArtifactId = (id: string | null) =>
    go((previous) => ({ ...previous, output: id || undefined }));
  const [dialog, setDialog] = useState<
    "pipeline" | "import" | "run" | "help" | null
  >(null);
  const datasetContextId = route.dataset;
  const [demoOpen, setDemoOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [versionSourceId, setVersionSourceId] = useState<string | null>(null);
  const [reviseId, setReviseId] = useState<string | null>(null);
  const [runContext, setRunContext] = useState<{
    pipelineId?: string;
    datasetId?: string;
    retryOf?: string;
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
  const orientation = `${page}:${role}:${selectedPipelineId || ""}:${selectedPipeline?.stage ?? ""}:${selectedPipeline?.status || ""}`;
  const previousOrientation = useRef(orientation);
  useLayoutEffect(() => {
    const identity =
      selectedPipeline?.name ||
      (route.run && state.runs.find((r) => r.id === route.run)?.id) ||
      (artifactId && state.artifacts.find((a) => a.id === artifactId)?.name) ||
      (datasetContextId &&
        state.datasets.find((d) => d.id === datasetContextId)?.name) ||
      page;
    document.title = `${identity} · Zero Trust`;
    if (previousOrientation.current === orientation) return;
    previousOrientation.current = orientation;
    if (route.run || route.dataset || artifactId || dialog || demoOpen) return;
    window.scrollTo(0, 0);
    const heading = document.querySelector<HTMLElement>("main h1");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }, [
    page,
    role,
    selectedPipelineId,
    selectedPipeline?.stage,
    selectedPipeline?.status,
    route.run,
    route.dataset,
    artifactId,
  ]);
  const artifact = state.artifacts.find((a) => a.id === artifactId);
  const navigate = (page: Page) =>
    go((previous) => ({ page, role: previous.role }));
  const openPipeline = (p: Pipeline) => {
    go((previous) => ({
      ...previous,
      page: "Approvals",
      pipeline: p.id,
      run: undefined,
      output: undefined,
      dataset: undefined,
    }));
  };
  const openEvent = (event: Event) => {
    const pipeline = state.pipelines.find((p) => p.id === event.entityId);
    if (pipeline) {
      openPipeline(pipeline);
      return;
    }
    const run = state.runs.find((r) => r.id === event.entityId);
    if (run) {
      go({ page: "Runs & results", role, run: run.id });
      return;
    }
    const artifact = state.artifacts.find((a) => a.id === event.entityId);
    if (artifact) {
      go({ page: "Runs & results", role, tab: "results", output: artifact.id });
      return;
    }
    const dataset = state.datasets.find((d) => d.id === event.entityId);
    if (dataset) {
      go({ page: "Datasets", role, dataset: dataset.id });
    }
  };
  const openRun = (p?: Pipeline, d?: Dataset, retryOf?: string) => {
    if (role !== "Researcher") {
      setToast("Switch to Researcher to configure a run.", "info");
      return;
    }
    setRunContext({ pipelineId: p?.id, datasetId: d?.id, retryOf });
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
    role,
    onOutputs: () =>
      go({ page: "Runs & results", role, tab: "results", status: "pending" }),
    onDatasets: () => navigate("Datasets"),
    onRuns: () =>
      go({ page: "Runs & results", role, tab: "runs", status: "running" }),
    onOpen: openPipeline,
    onNew: createPipeline,
    onRun: (p: Pipeline) => openRun(p),
    onApprovals: (scope?: string) => go({ page: "Approvals", role, scope }),
  };
  const missingRecord =
    (route.pipeline && !selectedPipeline) ||
    (route.run && !state.runs.some((r) => r.id === route.run)) ||
    (route.dataset && !state.datasets.some((d) => d.id === route.dataset)) ||
    (route.output && !state.artifacts.some((a) => a.id === route.output));
  return (
    <WorkspaceNavigation value={navigation}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DemoToolsProvider open={demoOpen} onOpen={() => setDemoOpen(true)}>
          <Shell
            page={page}
            setPage={navigate}
            role={role}
            approvalCount={
              state.pipelines.filter((p) => pipelineNeedsAction(p, role)).length
            }
            storageAvailable={storageAvailable}
          >
            {recoveryData !== null ? (
              <section className="plain-panel" role="alert">
                <h1>Your saved workspace needs recovery</h1>
                {recoveryReason === "conflict" ? (
                  <>
                    <p>
                      Another tab saved changes while this tab had unsaved work.
                      Your local changes are still available below. Editing is
                      paused so neither copy is overwritten.
                    </p>
                    <p>
                      Download your local recovery copy, then load the saved
                      workspace. We will keep a browser backup of your local
                      copy first.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      We could not read your saved workspace. The original data
                      has been kept, and editing is paused to protect it.
                    </p>
                    <p>
                      Download a recovery copy before resetting. Reset creates a
                      fresh demo and keeps a backup in this browser.
                    </p>
                  </>
                )}
                {!storageAvailable && (
                  <p>
                    Browser storage is unavailable. Download your recovery copy
                    before trying again.
                  </p>
                )}
                <div className="review-actions">
                  <Button
                    variant="contained"
                    onClick={() =>
                      downloadText(
                        "zero-trust-workspace-recovery.json",
                        recoveryData,
                        "application/json",
                      )
                    }
                  >
                    Download recovery copy
                  </Button>
                  {recoveryReason === "conflict" ? (
                    <Button
                      variant="outlined"
                      onClick={async () => {
                        if (await loadSavedWorkspace()) navigate("Pipelines");
                      }}
                    >
                      Load saved workspace
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setResetOpen(true)}
                    >
                      Reset workspace
                    </Button>
                  )}
                </div>
              </section>
            ) : missingRecord ? (
              <section className="plain-panel" role="alert">
                <h1>Record unavailable</h1>
                <p>
                  This record is not in the current browser workspace. It may
                  have been reset, or the link may belong to another browser.
                </p>
                <Button variant="contained" onClick={() => navigate(page)}>
                  View {page.toLowerCase()}
                </Button>
              </section>
            ) : (
              <>
                {page === "Pipelines" && <PipelineCatalog {...catalogProps} />}
                {page === "Overview" && <Overview {...catalogProps} />}
                {page === "Datasets" && (
                  <Datasets
                    initialDatasetId={datasetContextId}
                    onSelect={(id) =>
                      go((previous) => ({ ...previous, dataset: id }))
                    }
                    state={state}
                    onImport={openImport}
                    onRun={(d) => openRun(undefined, d)}
                    researcher={role === "Researcher"}
                  />
                )}
                {page === "Approvals" &&
                  (selectedPipeline ? (
                    <ReviewView
                      key={`${selectedPipeline.id}-${pipelineRevision(selectedPipeline)}-${role}`}
                      pipeline={selectedPipeline}
                      role={role}
                      onBack={() => setSelectedPipelineId(null)}
                      onReview={async (decision, note) => {
                        const accepted = await dispatch({
                          type: "REVIEW",
                          id: selectedPipeline.id,
                          role,
                          decision,
                          note,
                        });
                        if (!accepted) return false;
                        setToast(
                          decision === "approve"
                            ? `${["Ethical", "Technical", "Privacy", "Security"][selectedPipeline.stage]} review approved.`
                            : decision === "changes"
                              ? "Changes requested. The author can revise and resubmit."
                              : "Submission rejected. The decision and reason are recorded.",
                        );
                        return true;
                      }}
                      onPublish={() => {
                        dispatch({
                          type: "PUBLISH",
                          id: selectedPipeline.id,
                          role,
                        });
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
                    <Approvals
                      state={state}
                      onOpen={openPipeline}
                      role={role}
                    />
                  ))}
                {page === "Runs & results" && (
                  <RunsAndResults
                    initialTab={route.tab}
                    initialRunId={route.run}
                    onViewChange={(view) =>
                      go((previous) => ({
                        ...previous,
                        tab: view.tab,
                        run: view.runId,
                        status:
                          (previous.tab || "runs") === view.tab
                            ? previous.status
                            : undefined,
                        search:
                          (previous.tab || "runs") === view.tab
                            ? previous.search
                            : undefined,
                      }))
                    }
                    state={state}
                    onNewRun={() => openRun()}
                    onArtifact={(a) => setArtifactId(a.id)}
                    onRetry={(r) => {
                      go((previous) => ({ ...previous, run: undefined }));
                      openRun(
                        state.pipelines.find((p) => p.id === r.pipelineId),
                        state.datasets.find((d) => d.id === r.datasetId),
                        r.id,
                      );
                    }}
                    researcher={role === "Researcher"}
                    role={role}
                    onCancel={(r) => dispatch({ type: "CANCEL_RUN", id: r.id })}
                    onReport={(id, message) =>
                      dispatch({ type: "REPORT_ISSUE", id, role, message })
                    }
                    onResolve={(id, resolution) =>
                      dispatch({ type: "RESOLVE_ISSUE", id, role, resolution })
                    }
                  />
                )}
                {page === "Activity log" && (
                  <ActivityView state={state} onOpen={openEvent} />
                )}
              </>
            )}
          </Shell>
          {recoveryData === null && dialog === "pipeline" && (
            <PipelineForm
              pipelines={state.pipelines}
              pipeline={state.pipelines.find((p) => p.id === reviseId)}
              versionSource={state.pipelines.find(
                (p) => p.id === versionSourceId,
              )}
              onClose={() => setDialog(null)}
              onCreate={async (pipeline, draft) => {
                const accepted = await dispatch({
                  type: "SUBMIT",
                  pipeline,
                  draft,
                });
                if (!accepted) return false;
                setDialog(null);
                openPipeline(pipeline);
                setToast(
                  draft ? "Draft saved." : "Submitted for Ethical review.",
                );
                return true;
              }}
              onRevise={async (fields, draft, expectedRevision) => {
                if (!reviseId) return false;
                const accepted = await dispatch({
                  type: draft ? "SAVE_DRAFT" : "REVISE",
                  id: reviseId,
                  fields,
                  expectedRevision,
                });
                if (!accepted) return false;
                setDialog(null);
                setToast(
                  draft
                    ? "Working draft saved. The previous submission and decisions are retained."
                    : "Revision submitted. All four reviews are required.",
                );
                return true;
              }}
            />
          )}
          {recoveryData === null && dialog === "import" && (
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
          {recoveryData === null && dialog === "run" && (
            <RunDialog
              state={state}
              initialPipelineId={runContext.pipelineId}
              initialDatasetId={runContext.datasetId}
              retryRun={state.runs.find((run) => run.id === runContext.retryOf)}
              onClose={() => setDialog(null)}
              onStart={async (pipeline, dataset) => {
                const accepted = await dispatch({
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
                    retryOf: runContext.retryOf,
                  },
                });
                if (!accepted) return false;
                setDialog(null);
                navigate("Runs & results");
                setToast(
                  "Demo run started. Output will be ready in a few seconds.",
                );
                return true;
              }}
            />
          )}
          {recoveryData === null && artifact && (
            <ArtifactDialog
              key={artifact.id}
              artifact={artifact}
              role={role}
              onClose={() => setArtifactId(null)}
              onReview={async (accept, comment) => {
                const accepted = await dispatch({
                  type: "REVIEW_ARTIFACT",
                  id: artifact.id,
                  role,
                  accept,
                  comment,
                });
                if (!accepted) return false;
                setToast(
                  accept
                    ? "Artifact validated. Sample download is now available."
                    : "Artifact marked not acceptable. Download remains unavailable.",
                );
                return true;
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
            open={resetOpen}
            onClose={() => setResetOpen(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Reset demo workspace?</DialogTitle>
            <DialogContent>
              {recoveryData !== null ? (
                "This starts a fresh demo workspace and keeps the unreadable original as a recovery copy in this browser. Download your copy first for safekeeping."
              ) : (
                <>
                  This removes your local demo changes and restores the original
                  synthetic records. No external data is affected.
                </>
              )}
            </DialogContent>
            <DialogActionBar
              primary={
                <Button
                  variant="contained"
                  color="error"
                  onClick={async () => {
                    const accepted = await dispatch({ type: "RESET" });
                    if (!accepted) {
                      setToast(
                        "Reset could not be saved. Your original data is still available. Download a recovery copy and check browser storage.",
                        "error",
                      );
                      return;
                    }
                    setDialog(null);
                    setResetOpen(false);
                    clearSessionDrafts();
                    setArtifactId(null);
                    go({ page: "Pipelines", role: "Researcher" });
                    setToast("Demo workspace reset.");
                  }}
                >
                  Reset demo
                </Button>
              }
            >
              <Button onClick={() => setResetOpen(false)}>Cancel</Button>
            </DialogActionBar>
          </Dialog>
          {demoOpen && (
            <SimulationControls
              state={state}
              pipelineId={
                selectedPipelineId ||
                state.runs.find((r) => r.id === route.run)?.pipelineId
              }
              artifactId={artifactId}
              dispatch={dispatch}
              role={role}
              onRoleChange={setRole}
              page={page}
              onNavigate={(next) => {
                setDemoOpen(false);
                navigate(next);
              }}
              taskOpen={Boolean(
                dialog || resetOpen || artifactId || route.run || route.dataset,
              )}
              recoveryPending={recoveryData !== null}
              onHelp={() => {
                setDemoOpen(false);
                setDialog("help");
              }}
              onReset={() => {
                setDemoOpen(false);
                setResetOpen(true);
              }}
              onClose={() => setDemoOpen(false)}
            />
          )}
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
        </DemoToolsProvider>
      </ThemeProvider>
    </WorkspaceNavigation>
  );
}
