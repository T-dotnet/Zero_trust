import { test } from "node:test";
import assert from "node:assert/strict";
import {
  STAGES,
  seedWorkspace,
  workspaceReducer,
  type Role,
} from "../src/mvp/model";

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
