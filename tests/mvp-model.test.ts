import { test } from "node:test";
import assert from "node:assert/strict";
import {
  STAGES,
  seedWorkspace,
  workspaceReducer,
  type Role,
} from "../src/mvp/model";
import { nextAvailableVersion, executionStepStatus } from "../src/mvp/model";
import { parseDatasetCsv, encodeCsv } from "../src/mvp/csv";
import { isWorkspace } from "../src/mvp/storage";
import { artifactPreview } from "../src/mvp/artifactPreview";

test("all four stage-specific approvals are needed before author publication", () => {
  let state = seedWorkspace();
  const id = "pipe-5";
  state = workspaceReducer(state, { type: "PUBLISH", id, role: "Researcher" });
  assert.equal(state.pipelines.find((p) => p.id === id)?.status, "In review");
  const unchanged = workspaceReducer(state, {
    type: "REVIEW",
    id,
    role: "Security reviewer",
    decision: "approve",
    note: "",
  });
  assert.equal(unchanged, state, "later reviewer cannot skip stages");
  for (let i = 0; i < 4; i++) {
    state = workspaceReducer(state, {
      type: "REVIEW",
      id,
      role: `${STAGES[i]} reviewer` as Role,
      decision: "approve",
      note: "Evidence reviewed.",
    });
    assert.equal(state.pipelines.find((p) => p.id === id)?.stage, i + 1);
    assert.equal(
      state.pipelines.find((p) => p.id === id)?.status,
      i === 3 ? "Ready to publish" : "In review",
    );
  }
  assert.equal(
    workspaceReducer(state, { type: "PUBLISH", id, role: "Security reviewer" }),
    state,
  );
  state = workspaceReducer(state, { type: "PUBLISH", id, role: "Researcher" });
  assert.equal(state.pipelines.find((p) => p.id === id)?.status, "Approved");
});

test("feedback needs a reason; revision resets approvals and preserves history", () => {
  let state = seedWorkspace();
  const id = "pipe-2";
  assert.equal(
    workspaceReducer(state, {
      type: "REVIEW",
      id,
      role: "Technical reviewer",
      decision: "changes",
      note: " ",
    }),
    state,
  );
  state = workspaceReducer(state, {
    type: "REVIEW",
    id,
    role: "Technical reviewer",
    decision: "changes",
    note: "Specify output schema.",
  });
  assert.equal(
    state.pipelines.find((p) => p.id === id)?.status,
    "Changes requested",
  );
  const previous = state.pipelines.find((p) => p.id === id)!;
  state = workspaceReducer(state, {
    type: "REVISE",
    id,
    fields: {
      ...previous,
      description: "Updated schema.",
      repo: previous.repo,
    },
  });
  const revised = state.pipelines.find((p) => p.id === id)!;
  assert.equal(revised.version, "v1.0.1");
  assert.equal(revised.stage, 0);
  assert.equal(revised.history.length, previous.history.length + 1);
  assert.ok(revised.history.some((e) => e.note === "Specify output schema."));
});

test("run cancellation and support lifecycle retain history and require a technical reviewer to resolve", () => {
  let state = seedWorkspace();
  const id = "RUN-1041";
  state = workspaceReducer(state, {
    type: "REPORT_ISSUE",
    id,
    role: "Researcher",
    message: "Input mapping needs review.",
  });
  assert.equal(
    state.runs.find((r) => r.id === id)?.support?.status,
    "Submitted",
  );
  assert.equal(
    workspaceReducer(state, {
      type: "RESOLVE_ISSUE",
      id,
      role: "Researcher",
      resolution: "Fixed.",
    }),
    state,
  );
  state = workspaceReducer(state, {
    type: "RESOLVE_ISSUE",
    id,
    role: "Technical reviewer",
    resolution: "Mapping reviewed.",
  });
  state = workspaceReducer(state, { type: "RETRY", id });
  state = workspaceReducer(state, { type: "CANCEL_RUN", id });
  assert.equal(state.runs.find((r) => r.id === id)?.status, "Cancelled");
  assert.equal(
    state.runs.find((r) => r.id === id)?.support?.resolution,
    "Mapping reviewed.",
  );
  assert.ok(state.events.some((e) => e.title === "Run cancelled"));
});

test("execution produces a pending artifact; only privacy reviewer validates it", () => {
  let state = seedWorkspace();
  state = workspaceReducer(state, {
    type: "START_RUN",
    run: {
      id: "run-test",
      pipelineId: "pipe-1",
      pipelineName: "Example",
      version: "v2.1.0",
      datasetId: "data-1",
      datasetName: "Example dataset",
      status: "Running",
      progress: 96,
      date: new Date().toISOString(),
    },
  });
  state = workspaceReducer(state, { type: "TICK" });
  const run = state.runs.find((r) => r.id === "run-test")!;
  const artifact = state.artifacts.find((a) => a.id === run.artifactId)!;
  assert.equal(run.status, "Completed");
  assert.equal(artifact.status, "Pending review");
  assert.equal(
    workspaceReducer(state, {
      type: "REVIEW_ARTIFACT",
      id: artifact.id,
      role: "Researcher",
      accept: true,
      comment: "",
    }),
    state,
  );
  assert.equal(
    workspaceReducer(state, {
      type: "REVIEW_ARTIFACT",
      id: artifact.id,
      role: "Privacy reviewer",
      accept: false,
      comment: "",
    }),
    state,
  );
  state = workspaceReducer(state, {
    type: "REVIEW_ARTIFACT",
    id: artifact.id,
    role: "Privacy reviewer",
    accept: true,
    comment: "Synthetic sample accepted.",
  });
  assert.equal(
    state.artifacts.find((a) => a.id === artifact.id)?.status,
    "Validated",
  );
});

test("CSV imports handle quoting, embedded newlines, and schema errors", () => {
  assert.equal(
    parseDatasetCsv(
      '\uFEFFid,note\r\n1,"first\nsecond"\r\n2,"a, b and ""quotes"""\r\n',
    ).rows,
    2,
  );
  for (const invalid of [
    "id,note\n",
    "id,note\n1,extra,field",
    "id,id\n1,2",
    'id,note\n1,"unclosed',
  ])
    assert.throws(() => parseDatasetCsv(invalid));
  const csv = encodeCsv([
    ["id", "note"],
    ["1", 'comma, quote " and\nnewline'],
    ["2", "normal"],
  ]);
  assert.ok(csv.startsWith("id,note\r\n"));
  assert.equal(parseDatasetCsv(csv).rows, 2);
});

test("reserved versions include drafts and every version in a pipeline family", () => {
  const state = seedWorkspace();
  const source = state.pipelines[0];
  const draft = {
    ...source,
    id: "draft-version",
    basedOn: source.id,
    version: "v2.2.0",
    status: "Draft" as const,
    stage: 0,
  };
  const patch = {
    ...source,
    id: "patch-version",
    basedOn: source.id,
    version: "v2.2.1",
    status: "In review" as const,
    stage: 0,
  };
  const pipelines = [...state.pipelines, draft, patch];
  assert.equal(nextAvailableVersion(source, pipelines, "minor"), "v2.3.0");
  assert.equal(nextAvailableVersion(draft, pipelines, "patch"), "v2.2.2");
});

test("saved workspace validation rejects damaged records while accepting incomplete draft requirements", () => {
  const state = seedWorkspace();
  assert.equal(isWorkspace(state), true);
  assert.equal(isWorkspace({ ...state, datasets: [{}] }), false);
  assert.equal(
    isWorkspace({
      ...state,
      runs: [{ ...state.runs[0], pipelineId: "missing" }],
    }),
    false,
  );
  assert.equal(
    isWorkspace({
      ...state,
      pipelines: [{ ...state.pipelines[0], status: "In review", stage: 4 }],
    }),
    false,
  );
  assert.equal(
    isWorkspace({
      ...state,
      pipelines: [
        {
          ...state.pipelines[0],
          status: "Draft",
          stage: 0,
          input: "",
          output: "",
        },
      ],
    }),
    true,
  );
});

test("review history identifies pipeline and version before and after revision", () => {
  let state = seedWorkspace();
  const source = state.pipelines[1];
  state = workspaceReducer(state, {
    type: "REVIEW",
    id: source.id,
    role: "Technical reviewer",
    decision: "changes",
    note: "Add evidence.",
  });
  const feedback = state.events[0];
  state = workspaceReducer(state, {
    type: "REVISE",
    id: source.id,
    fields: { ...source, branch: "revision", input: "Revised CSV schema" },
  });
  assert.equal(feedback.entityName, source.name);
  assert.equal(feedback.version, "v1.0.0");
  assert.equal(state.events[0].version, "v1.0.1");
  assert.equal(state.pipelines[1].history[0].version, "v1.0.1");
  assert.equal(state.pipelines[1].history[1].version, "v1.0.0");
});

test("run steps identify the failed stage and incompatible data cannot be queued", () => {
  const state = seedWorkspace();
  const failed = state.runs[1];
  assert.equal(executionStepStatus(failed, 0), "Failed");
  assert.equal(executionStepStatus(failed, 1), "Pending");
  assert.equal(
    executionStepStatus({ ...failed, status: "Running", progress: 30 }, 1),
    "Running",
  );
  const result = workspaceReducer(state, {
    type: "START_RUN",
    run: {
      ...failed,
      id: "bad-format",
      pipelineId: "pipe-3",
      datasetId: "data-1",
      status: "Running",
    },
  });
  assert.equal(result, state);
});

test("named incomplete drafts survive persistence but cannot enter review", () => {
  let state = seedWorkspace();
  const draft = {
    ...state.pipelines[0],
    id: "working-draft",
    name: "Working draft",
    description: "",
    repo: "",
    input: "",
    output: "",
    stage: 0,
    status: "Draft" as const,
    history: [],
  };
  state = workspaceReducer(state, {
    type: "SUBMIT",
    pipeline: draft,
    draft: true,
  });
  assert.ok(isWorkspace(JSON.parse(JSON.stringify(state))));
  assert.equal(state.pipelines[0].status, "Draft");
  assert.equal(
    workspaceReducer(state, { type: "REVISE", id: draft.id, fields: draft }),
    state,
  );
  state = workspaceReducer(state, {
    type: "SAVE_DRAFT",
    id: draft.id,
    fields: { ...draft, description: "Partial purpose" },
  });
  assert.equal(state.pipelines[0].description, "Partial purpose");
  assert.equal(state.pipelines[0].status, "Draft");
  assert.ok(isWorkspace(JSON.parse(JSON.stringify(state))));
});

test("saving a working revision preserves the reviewed submission until explicit resubmission", () => {
  let state = seedWorkspace();
  state = workspaceReducer(state, {
    type: "REVIEW",
    id: "pipe-2",
    role: "Technical reviewer",
    decision: "changes",
    note: "Add output evidence.",
  });
  const reviewed = state.pipelines.find((p) => p.id === "pipe-2")!;
  const fields = {
    description: "Working revised purpose",
    repo: reviewed.repo,
    branch: "fix/schema",
    category: reviewed.category,
    input: reviewed.input,
    output: reviewed.output,
    attachments: [
      {
        id: "evidence",
        name: "schema.md",
        size: 20,
        content: "Synthetic evidence",
      },
    ],
  };
  state = workspaceReducer(state, {
    type: "SAVE_DRAFT",
    id: reviewed.id,
    fields,
  });
  const saved = state.pipelines.find((p) => p.id === reviewed.id)!;
  assert.equal(saved.description, reviewed.description);
  assert.equal(saved.status, "Changes requested");
  assert.equal(saved.stage, 1);
  assert.equal(saved.version, reviewed.version);
  assert.equal(saved.revisionDraft?.branch, "fix/schema");
  assert.ok(isWorkspace(JSON.parse(JSON.stringify(state))));
  state = workspaceReducer(state, { type: "REVISE", id: saved.id, fields });
  const resubmitted = state.pipelines.find((p) => p.id === saved.id)!;
  assert.equal(resubmitted.version, "v1.0.1");
  assert.equal(resubmitted.stage, 0);
  assert.equal(resubmitted.status, "In review");
  assert.equal(resubmitted.revisionDraft, undefined);
  assert.ok(
    resubmitted.history.some((event) => event.note === "Add output evidence."),
  );
});

test("output contracts are captured for a run and validation records its reviewer", () => {
  let state = seedWorkspace();
  state.pipelines[0].output = "Outcome classification (CSV)";
  state = workspaceReducer(state, {
    type: "START_RUN",
    run: {
      ...state.runs[0],
      id: "run-snapshot",
      artifactId: undefined,
      status: "Running",
      progress: 96,
    },
  });
  state = {
    ...state,
    pipelines: state.pipelines.map((p, index) =>
      index === 0 ? { ...p, output: "New contract" } : p,
    ),
  };
  state = workspaceReducer(state, { type: "TICK" });
  const artifact = state.artifacts.find((a) => a.runId === "run-snapshot")!;
  assert.equal(artifact.output, "Outcome classification (CSV)");
  state = workspaceReducer(state, {
    type: "REVIEW_ARTIFACT",
    id: artifact.id,
    role: "Privacy reviewer",
    accept: true,
    comment: "Synthetic sample checked.",
  });
  const accepted = state.artifacts.find((a) => a.id === artifact.id)!;
  assert.equal(accepted.reviewedBy, "Dr. Olivia Reed");
  assert.ok(Number.isFinite(Date.parse(accepted.reviewedAt!)));
  assert.ok(isWorkspace(JSON.parse(JSON.stringify(state))));
});

test("synthetic previews follow declared outputs and disclose unsupported schemas", () => {
  const artifact = seedWorkspace().artifacts[0];
  const classification = artifactPreview({
    ...artifact,
    output: "Outcome classification (CSV)",
  });
  assert.ok(classification.headers.includes("predicted_outcome"));
  assert.ok(
    !classification.headers.includes("processed_text"),
    "an older pipeline name cannot override the declared output",
  );
  assert.ok(
    artifactPreview({
      ...artifact,
      output: "Patient risk stratification (CSV)",
    }).headers.includes("predicted_risk"),
  );
  assert.ok(
    artifactPreview({
      ...artifact,
      output: "Imaging metadata (CSV)",
    }).headers.includes("acquisition_month"),
  );
  assert.ok(
    artifactPreview({
      ...artifact,
      output: "Normalized cohort (CSV)",
    }).headers.includes("standard_outcome"),
  );
  assert.match(
    artifactPreview({ ...artifact, output: "Custom graph (XML)" }).note,
    /Generic illustrative preview/,
  );
  assert.ok(artifactPreview(artifact).headers.includes("processed_text"));
});
