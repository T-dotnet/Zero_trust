export const STAGES = ["Ethical", "Technical", "Privacy", "Security"] as const;
export type Stage = (typeof STAGES)[number];
export type Role = "Researcher" | `${Stage} reviewer`;
export type Page =
  | "Overview"
  | "Datasets"
  | "Pipelines"
  | "Runs & results"
  | "Approvals"
  | "Activity log";
export type PipelineStatus =
  | "Draft"
  | "In review"
  | "Changes requested"
  | "Rejected"
  | "Ready to publish"
  | "Approved";
export interface Event {
  id: string;
  title: string;
  actor: string;
  date: string;
  note?: string;
  entityId?: string;
  entityName?: string;
  version?: string;
}
export interface Attachment {
  id: string;
  name: string;
  size: number;
  content?: string;
}
export type PipelineFields = Pick<
  Pipeline,
  | "description"
  | "repo"
  | "branch"
  | "category"
  | "input"
  | "output"
  | "attachments"
>;
export interface Pipeline {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  repo: string;
  branch: string;
  input: string;
  output: string;
  author: string;
  status: PipelineStatus;
  stage: number;
  updated: string;
  history: Event[];
  attachments?: Attachment[];
  basedOn?: string;
  revisionDraft?: PipelineFields;
}
export interface Dataset {
  id: string;
  name: string;
  description: string;
  rows: number;
  size: string;
  format: string;
  date: string;
  columns?: string[];
}
export interface Run {
  id: string;
  pipelineId: string;
  pipelineName: string;
  version: string;
  datasetId: string;
  datasetName: string;
  status: "Running" | "Completed" | "Failed" | "Cancelled";
  progress: number;
  date: string;
  error?: string;
  artifactId?: string;
  failedStep?: number;
  output?: string;
  support?: {
    id: string;
    message: string;
    status: "Submitted" | "Resolved";
    date: string;
    resolution?: string;
  };
}
export interface Artifact {
  id: string;
  name: string;
  runId: string;
  pipelineId: string;
  version: string;
  datasetName: string;
  rows: number;
  status: "Pending review" | "Validated" | "Not acceptable";
  date: string;
  comment?: string;
  output?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
export interface Workspace {
  schema: 1;
  pipelines: Pipeline[];
  datasets: Dataset[];
  runs: Run[];
  artifacts: Artifact[];
  events: Event[];
}
export const REVIEWERS: Record<Stage, string> = {
  Ethical: "Dr. Maya Patel",
  Technical: "Alex Morgan",
  Privacy: "Dr. Olivia Reed",
  Security: "James Wilson",
};
export const actorFor = (role: Role) =>
  role === "Researcher"
    ? "Dr. Sarah Chen"
    : REVIEWERS[role.split(" ")[0] as Stage];
export const uid = (prefix: string) =>
  `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
export const now = () => new Date().toISOString();
export const pipelineNeedsAction = (pipeline: Pipeline, role: Role) =>
  role === "Researcher"
    ? ["Draft", "Changes requested", "Rejected", "Ready to publish"].includes(
        pipeline.status,
      )
    : pipeline.status === "In review" &&
      role === `${STAGES[pipeline.stage]} reviewer`;
export const pipelineActionLabel = (pipeline: Pipeline, role: Role) => {
  if (pipeline.status === "Approved")
    return role === "Researcher" ? "Run" : "View pipeline";
  if (!pipelineNeedsAction(pipeline, role)) return "Track submission";
  if (role !== "Researcher") return "Review";
  return pipeline.status === "Ready to publish"
    ? "Publish"
    : pipeline.status === "Draft"
      ? "Edit draft"
      : "Revise";
};
export function submissionComplete(
  pipeline: Pick<
    Pipeline,
    "name" | "description" | "repo" | "branch" | "input" | "output"
  >,
) {
  try {
    const url = new URL(pipeline.repo.trim());
    return (
      ["http:", "https:"].includes(url.protocol) &&
      Boolean(url.hostname) &&
      [
        pipeline.name,
        pipeline.description,
        pipeline.branch,
        pipeline.input,
        pipeline.output,
      ].every((value) => Boolean(value.trim()))
    );
  } catch {
    return false;
  }
}
export function nextVersion(version: string, kind: "minor" | "patch") {
  const [major = 1, minor = 0, patch = 0] = version
    .replace(/^v/, "")
    .split(".")
    .map(Number);
  return kind === "minor"
    ? `v${major}.${minor + 1}.0`
    : `v${major}.${minor}.${patch + 1}`;
}
export function nextAvailableVersion(
  source: Pipeline,
  pipelines: Pipeline[],
  kind: "minor" | "patch",
) {
  const root = (pipeline: Pipeline) => {
    let current = pipeline;
    const seen = new Set<string>();
    while (current.basedOn && !seen.has(current.id)) {
      seen.add(current.id);
      const parent = pipelines.find((p) => p.id === current.basedOn);
      if (!parent) break;
      current = parent;
    }
    return current.id;
  };
  const family = pipelines.filter((p) => root(p) === root(source));
  const latest =
    kind === "minor"
      ? family.reduce((best, p) => {
          const a = best.version.replace(/^v/, "").split(".").map(Number);
          const b = p.version.replace(/^v/, "").split(".").map(Number);
          return b[0] > a[0] ||
            (b[0] === a[0] && (b[1] > a[1] || (b[1] === a[1] && b[2] > a[2])))
            ? p
            : best;
        }, source)
      : source;
  let candidate = nextVersion(latest.version, kind);
  while (family.some((p) => p.version === candidate))
    candidate = nextVersion(candidate, kind);
  return candidate;
}
export function supportsDataset(pipeline: Pipeline, dataset: Dataset) {
  const formats: string[] =
    pipeline.input.toUpperCase().match(/[A-Z0-9]+/g) || [];
  return formats.includes(dataset.format.toUpperCase());
}
export function executionStepStatus(run: Run, index: number) {
  if (run.status === "Completed") return "Complete";
  const current =
    run.status === "Failed"
      ? (run.failedStep ?? Math.min(3, Math.floor(run.progress / 25)))
      : Math.min(3, Math.floor(run.progress / 25));
  if (index < current) return "Complete";
  if (index > current) return "Pending";
  return run.status;
}
export const makeEvent = (
  title: string,
  actor: string,
  entityId?: string,
  note?: string,
): Event => ({ id: uid("evt"), title, actor, entityId, note, date: now() });
export const stageLabel = (p: Pipeline) =>
  p.status === "In review" ? `${STAGES[p.stage]} review` : p.status;
export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
export const formatTime = (date: string) =>
  new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const descriptions = [
  [
    "Clinical note de-identification",
    "De-identifies clinical notes by removing PHI.",
    "v2.1.0",
    "Privacy",
    "Approved",
    4,
    "clinical-notes",
  ],
  [
    "Patient risk stratification",
    "Predicts patient risk using structured clinical data.",
    "v1.0.0",
    "ML model",
    "In review",
    1,
    "patient-risk",
  ],
  [
    "Audio transcription",
    "Transcribes clinical audio to text for analysis.",
    "v1.3.0",
    "Audio",
    "Approved",
    4,
    "audio-transcription",
  ],
  [
    "Cohort normalization",
    "Normalizes cohort data across sites and formats.",
    "v1.0.0",
    "Data processing",
    "In review",
    2,
    "cohort-normalization",
  ],
  [
    "Adverse event classifier",
    "Classifies potential adverse events from clinical records.",
    "v0.2.0",
    "ML model",
    "In review",
    0,
    "adverse-events",
  ],
  [
    "Imaging metadata scrubber",
    "Removes or generalizes sensitive metadata from imaging files.",
    "v1.0.0",
    "Privacy",
    "In review",
    3,
    "imaging-metadata",
  ],
] as const;

export function seedWorkspace(): Workspace {
  const pipelines: Pipeline[] = descriptions.map((d, i) => {
    const id = `pipe-${i + 1}`;
    const date = `2026-11-0${i < 2 ? 3 : i < 4 ? 2 : 1}T10:04:00Z`;
    const history: Event[] = [
      {
        id: `seed-${i}`,
        title: "Submission received",
        actor: "Dr. Sarah Chen",
        date,
        entityId: id,
      },
    ];
    for (let j = 0; j < d[5]; j++)
      history.unshift({
        id: `seed-${i}-${j}`,
        title: `${STAGES[j]} review approved`,
        actor: REVIEWERS[STAGES[j]],
        date,
        entityId: id,
        note: `Required ${STAGES[j].toLowerCase()} evidence reviewed.`,
      });
    if (d[4] === "Approved")
      history.unshift({
        id: `pub-${i}`,
        title: "Pipeline published",
        actor: "Dr. Sarah Chen",
        date,
        entityId: id,
      });
    return {
      id,
      name: d[0],
      description: d[1],
      version: d[2],
      category: d[3],
      status: d[4],
      stage: d[5],
      repo: `https://github.com/research/${d[6]}`,
      branch: "main",
      input: i === 2 ? "Audio files (WAV)" : "Structured clinical data (CSV)",
      output: i === 2 ? "Transcripts (TXT)" : "Processed dataset (CSV)",
      author: "Dr. Sarah Chen",
      updated: date,
      history: history.map((event) => ({
        ...event,
        entityName: d[0],
        version: d[2],
      })),
    };
  });
  return {
    schema: 1,
    pipelines,
    datasets: [
      {
        id: "data-1",
        name: "Clinical notes · November cohort",
        description: "Synthetic outpatient notes for de-identification.",
        rows: 1248,
        size: "2.4 MB",
        format: "CSV",
        columns: ["record_id", "clinical_note", "visit_date"],
        date: "2026-11-03T09:00:00Z",
      },
      {
        id: "data-2",
        name: "Patient outcomes · Site A",
        description: "Synthetic structured records for risk assessment.",
        rows: 864,
        size: "1.6 MB",
        format: "CSV",
        columns: ["record_id", "outcome", "site"],
        date: "2026-11-02T11:00:00Z",
      },
      {
        id: "data-3",
        name: "Consultation audio · Sample set",
        description: "Synthetic audio samples for transcription.",
        rows: 32,
        size: "48 MB",
        format: "WAV",
        date: "2026-11-01T12:00:00Z",
      },
    ],
    runs: [
      {
        id: "RUN-1042",
        pipelineId: "pipe-1",
        pipelineName: pipelines[0].name,
        version: "v2.1.0",
        datasetId: "data-1",
        datasetName: "Clinical notes · November cohort",
        status: "Completed",
        progress: 100,
        date: "2026-11-03T10:21:00Z",
        artifactId: "artifact-1",
      },
      {
        id: "RUN-1041",
        pipelineId: "pipe-1",
        pipelineName: pipelines[0].name,
        version: "v2.1.0",
        datasetId: "data-2",
        datasetName: "Patient outcomes · Site A",
        status: "Failed",
        progress: 12,
        failedStep: 0,
        date: "2026-11-02T15:30:00Z",
        error:
          "Input schema mismatch: the required clinical_note column is missing. Review the dataset mapping, then retry the demonstration.",
      },
    ],
    artifacts: [
      {
        id: "artifact-1",
        name: "De-identified clinical notes",
        runId: "RUN-1042",
        pipelineId: "pipe-1",
        version: "v2.1.0",
        datasetName: "Clinical notes · November cohort",
        rows: 1248,
        status: "Pending review",
        output: "De-identified clinical notes (CSV)",
        date: "2026-11-03T10:22:00Z",
      },
    ],
    events: pipelines
      .flatMap((p) => p.history)
      .sort((a, b) => b.date.localeCompare(a.date)),
  };
}

export type Action =
  | { type: "ADD_DATASET"; dataset: Dataset }
  | { type: "SUBMIT"; pipeline: Pipeline; draft: boolean }
  | {
      type: "REVIEW";
      id: string;
      role: Role;
      decision: "approve" | "changes" | "reject";
      note: string;
    }
  | { type: "REVISE"; id: string; fields: PipelineFields }
  | { type: "SAVE_DRAFT"; id: string; fields: PipelineFields }
  | { type: "PUBLISH"; id: string; role: Role }
  | { type: "START_RUN"; run: Run }
  | { type: "RETRY"; id: string }
  | { type: "CANCEL_RUN"; id: string }
  | { type: "REPORT_ISSUE"; id: string; message: string }
  | { type: "RESOLVE_ISSUE"; id: string; role: Role; resolution: string }
  | { type: "TICK" }
  | {
      type: "REVIEW_ARTIFACT";
      id: string;
      role: Role;
      accept: boolean;
      comment: string;
    }
  | { type: "RESET" };

export function workspaceReducer(state: Workspace, action: Action): Workspace {
  const withEvent = (next: Workspace, event: Event): Workspace => {
    const pipeline = next.pipelines.find((p) => p.id === event.entityId);
    const run = next.runs.find((r) => r.id === event.entityId);
    const artifact = next.artifacts.find((a) => a.id === event.entityId);
    const dataset = next.datasets.find((d) => d.id === event.entityId);
    const contextual = {
      ...event,
      entityName:
        pipeline?.name || run?.pipelineName || artifact?.name || dataset?.name,
      version: pipeline?.version || run?.version || artifact?.version,
    };
    return {
      ...next,
      events: [contextual, ...state.events],
      pipelines: next.pipelines.map((p) =>
        p.history.some((e) => e.id === event.id)
          ? {
              ...p,
              history: p.history.map((e) =>
                e.id === event.id ? contextual : e,
              ),
            }
          : p,
      ),
    };
  };
  if (action.type === "RESET") return seedWorkspace();
  if (action.type === "ADD_DATASET")
    return withEvent(
      { ...state, datasets: [action.dataset, ...state.datasets] },
      makeEvent(
        "Dataset imported",
        "Dr. Sarah Chen",
        action.dataset.id,
        action.dataset.name,
      ),
    );
  if (action.type === "SUBMIT") {
    if (
      !action.pipeline.name.trim() ||
      (!action.draft && !submissionComplete(action.pipeline))
    )
      return state;
    if (
      state.pipelines.some(
        (p) =>
          p.id === action.pipeline.id ||
          (p.name.trim().toLowerCase() ===
            action.pipeline.name.trim().toLowerCase() &&
            (!action.pipeline.basedOn ||
              p.version === action.pipeline.version)),
      )
    )
      return state;
    if (
      action.pipeline.basedOn &&
      !state.pipelines.some(
        (p) => p.id === action.pipeline.basedOn && p.status === "Approved",
      )
    )
      return state;
    const event = makeEvent(
      action.draft ? "Draft saved" : "Submission received",
      "Dr. Sarah Chen",
      action.pipeline.id,
    );
    const pipeline = {
      ...action.pipeline,
      status: (action.draft ? "Draft" : "In review") as PipelineStatus,
      stage: 0,
      history: [event],
      updated: now(),
    };
    return withEvent(
      { ...state, pipelines: [pipeline, ...state.pipelines] },
      event,
    );
  }
  if (action.type === "REVIEW") {
    const p = state.pipelines.find((p) => p.id === action.id);
    if (
      !p ||
      p.status !== "In review" ||
      action.role !== `${STAGES[p.stage]} reviewer` ||
      (action.decision !== "approve" && !action.note.trim())
    )
      return state;
    const event = makeEvent(
      `${STAGES[p.stage]} review ${action.decision === "approve" ? "approved" : action.decision === "changes" ? "changes requested" : "rejected"}`,
      actorFor(action.role),
      p.id,
      action.note,
    );
    const stage = action.decision === "approve" ? p.stage + 1 : p.stage;
    const status: PipelineStatus =
      action.decision === "approve"
        ? stage === 4
          ? "Ready to publish"
          : "In review"
        : action.decision === "changes"
          ? "Changes requested"
          : "Rejected";
    return withEvent(
      {
        ...state,
        pipelines: state.pipelines.map((item) =>
          item.id === p.id
            ? {
                ...p,
                stage,
                status,
                updated: now(),
                history: [event, ...p.history],
              }
            : item,
        ),
      },
      event,
    );
  }
  if (action.type === "SAVE_DRAFT") {
    const pipeline = state.pipelines.find((p) => p.id === action.id);
    if (
      !pipeline ||
      !["Draft", "Rejected", "Changes requested"].includes(pipeline.status)
    )
      return state;
    const event = makeEvent(
      pipeline.status === "Draft" ? "Draft saved" : "Revision draft saved",
      "Dr. Sarah Chen",
      pipeline.id,
    );
    return withEvent(
      {
        ...state,
        pipelines: state.pipelines.map((p) =>
          p.id === pipeline.id
            ? {
                ...p,
                ...(p.status === "Draft"
                  ? action.fields
                  : { revisionDraft: action.fields }),
                updated: now(),
                history: [event, ...p.history],
              }
            : p,
        ),
      },
      event,
    );
  }
  if (action.type === "REVISE") {
    const p = state.pipelines.find((p) => p.id === action.id);
    if (!p || !["Draft", "Rejected", "Changes requested"].includes(p.status))
      return state;
    if (!submissionComplete({ ...p, ...action.fields })) return state;
    const version =
      p.status === "Draft"
        ? p.version
        : nextAvailableVersion(p, state.pipelines, "patch");
    const event = makeEvent(
      `Revision ${version} submitted`,
      "Dr. Sarah Chen",
      p.id,
      "All four approval stages are required for this revision.",
    );
    return withEvent(
      {
        ...state,
        pipelines: state.pipelines.map((item) =>
          item.id === p.id
            ? {
                ...p,
                ...action.fields,
                revisionDraft: undefined,
                version,
                stage: 0,
                status: "In review",
                updated: now(),
                history: [event, ...p.history],
              }
            : item,
        ),
      },
      event,
    );
  }
  if (action.type === "PUBLISH") {
    const p = state.pipelines.find((p) => p.id === action.id);
    if (
      !p ||
      p.status !== "Ready to publish" ||
      p.stage !== 4 ||
      action.role !== "Researcher"
    )
      return state;
    const event = makeEvent(
      "Pipeline published",
      actorFor(action.role),
      p.id,
      `${p.name} ${p.version} is available in the approved catalog.`,
    );
    return withEvent(
      {
        ...state,
        pipelines: state.pipelines.map((item) =>
          item.id === p.id
            ? {
                ...p,
                status: "Approved",
                updated: now(),
                history: [event, ...p.history],
              }
            : item,
        ),
      },
      event,
    );
  }
  if (action.type === "START_RUN") {
    const pipeline = state.pipelines.find(
      (p) => p.id === action.run.pipelineId && p.status === "Approved",
    );
    const dataset = state.datasets.find((d) => d.id === action.run.datasetId);
    if (
      !pipeline ||
      !dataset ||
      !supportsDataset(pipeline, dataset) ||
      state.runs.some((r) => r.id === action.run.id)
    )
      return state;
    return withEvent(
      {
        ...state,
        runs: [{ ...action.run, output: pipeline.output }, ...state.runs],
      },
      makeEvent(
        "Run started",
        "Dr. Sarah Chen",
        action.run.id,
        action.run.pipelineName,
      ),
    );
  }
  if (action.type === "RETRY") {
    if (
      !state.runs.some(
        (r) => r.id === action.id && ["Failed", "Cancelled"].includes(r.status),
      )
    )
      return state;
    return withEvent(
      {
        ...state,
        runs: state.runs.map((r) =>
          r.id === action.id
            ? {
                ...r,
                status: "Running",
                progress: 0,
                error: undefined,
                failedStep: undefined,
                date: now(),
              }
            : r,
        ),
      },
      makeEvent(
        "Run retried",
        "Dr. Sarah Chen",
        action.id,
        state.runs.find((r) => r.id === action.id)?.status === "Failed"
          ? "Retried with a synthetic example mapping; no source data changed."
          : "Cancelled demo restarted.",
      ),
    );
  }
  if (action.type === "CANCEL_RUN") {
    if (!state.runs.some((r) => r.id === action.id && r.status === "Running"))
      return state;
    return withEvent(
      {
        ...state,
        runs: state.runs.map((r) =>
          r.id === action.id ? { ...r, status: "Cancelled" } : r,
        ),
      },
      makeEvent("Run cancelled", "Dr. Sarah Chen", action.id),
    );
  }
  if (action.type === "REPORT_ISSUE") {
    const run = state.runs.find((r) => r.id === action.id);
    if (!run || run.support || !action.message.trim()) return state;
    const support = {
      id: uid("HELP").toUpperCase(),
      message: action.message.trim(),
      status: "Submitted" as const,
      date: now(),
    };
    return withEvent(
      {
        ...state,
        runs: state.runs.map((r) =>
          r.id === action.id ? { ...r, support } : r,
        ),
      },
      makeEvent(
        "Support requested",
        "Dr. Sarah Chen",
        action.id,
        support.message,
      ),
    );
  }
  if (action.type === "RESOLVE_ISSUE") {
    const run = state.runs.find((r) => r.id === action.id);
    if (
      !run?.support ||
      run.support.status !== "Submitted" ||
      action.role !== "Technical reviewer" ||
      !action.resolution.trim()
    )
      return state;
    return withEvent(
      {
        ...state,
        runs: state.runs.map((r) =>
          r.id === action.id && r.support
            ? {
                ...r,
                support: {
                  ...r.support,
                  status: "Resolved",
                  resolution: action.resolution.trim(),
                },
              }
            : r,
        ),
      },
      makeEvent(
        "Support request resolved",
        actorFor(action.role),
        action.id,
        action.resolution,
      ),
    );
  }
  if (action.type === "TICK") {
    const artifacts = [...state.artifacts];
    const events: Event[] = [];
    const runs = state.runs.map((r) => {
      if (r.status !== "Running") return r;
      const progress = Math.min(r.progress + 12, 100);
      if (progress < 100) return { ...r, progress };
      const artifactId = uid("artifact");
      const dataset = state.datasets.find((d) => d.id === r.datasetId);
      artifacts.unshift({
        id: artifactId,
        name: `${r.pipelineName} · output`,
        runId: r.id,
        pipelineId: r.pipelineId,
        version: r.version,
        datasetName: r.datasetName,
        rows: dataset?.rows || 100,
        status: "Pending review",
        output:
          r.output ||
          state.pipelines.find((p) => p.id === r.pipelineId)?.output,
        date: now(),
      });
      events.push(
        makeEvent(
          "Run completed; output awaits review",
          "Demo execution",
          r.id,
          r.pipelineName,
        ),
      );
      return { ...r, progress, status: "Completed" as const, artifactId };
    });
    return {
      ...state,
      runs,
      artifacts,
      events: [
        ...events.map((event) => {
          const run = runs.find((r) => r.id === event.entityId);
          return {
            ...event,
            entityName: run?.pipelineName,
            version: run?.version,
          };
        }),
        ...state.events,
      ],
    };
  }
  if (action.type === "REVIEW_ARTIFACT") {
    if (
      action.role !== "Privacy reviewer" ||
      (!action.accept && !action.comment.trim()) ||
      !state.artifacts.some(
        (a) => a.id === action.id && a.status === "Pending review",
      )
    )
      return state;
    return withEvent(
      {
        ...state,
        artifacts: state.artifacts.map((a) =>
          a.id === action.id
            ? {
                ...a,
                status: action.accept ? "Validated" : "Not acceptable",
                comment: action.comment,
                reviewedBy: actorFor(action.role),
                reviewedAt: now(),
              }
            : a,
        ),
      },
      makeEvent(
        action.accept ? "Artifact validated" : "Artifact marked not acceptable",
        actorFor(action.role),
        action.id,
        action.comment,
      ),
    );
  }
  return state;
}
