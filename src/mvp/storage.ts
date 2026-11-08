import type { Workspace } from "./model";

type RecordValue = Record<string, unknown>;
const object = (v: unknown): v is RecordValue =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const string = (v: unknown): v is string => typeof v === "string";
const text = (v: unknown) => string(v) && Boolean(v.trim());
const date = (v: unknown) => string(v) && Number.isFinite(Date.parse(v));
const integer = (v: unknown, max = Number.MAX_SAFE_INTEGER) =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= max;
const optionalString = (v: unknown) => v === undefined || string(v);
const strings = (v: RecordValue, fields: string[]) =>
  fields.every((k) => text(v[k]));
const event = (v: unknown) =>
  object(v) &&
  strings(v, ["id", "title", "actor"]) &&
  date(v.date) &&
  ["note", "entityId", "entityName", "version"].every((k) =>
    optionalString(v[k]),
  );
const uniqueIds = (rows: RecordValue[]) =>
  new Set(rows.map((r) => r.id)).size === rows.length;
const attachments = (v: unknown) =>
  v === undefined ||
  (Array.isArray(v) &&
    v.every(
      (a) =>
        object(a) &&
        strings(a, ["id", "name"]) &&
        integer(a.size, 50_000) &&
        optionalString(a.content),
    ));
const columnList = (v: unknown) =>
  v === undefined || (Array.isArray(v) && v.every(text));
const draftFields = (v: unknown) =>
  object(v) &&
  ["description", "repo", "branch", "category", "input", "output"].every(
    (key) => string(v[key]),
  ) &&
  attachments(v.attachments) &&
  columnList(v.requiredColumns);

export function isWorkspace(value: unknown): value is Workspace {
  if (!object(value) || value.schema !== 1) return false;
  const keys = [
    "pipelines",
    "datasets",
    "runs",
    "artifacts",
    "events",
  ] as const;
  if (
    !keys.every((key) => Array.isArray(value[key]) && value[key].every(object))
  )
    return false;
  const pipelines = value.pipelines as RecordValue[];
  const datasets = value.datasets as RecordValue[];
  const runs = value.runs as RecordValue[];
  const artifacts = value.artifacts as RecordValue[];
  if (
    ![
      pipelines,
      datasets,
      runs,
      artifacts,
      value.events as RecordValue[],
    ].every(uniqueIds)
  )
    return false;
  if (
    !pipelines.every((p) => {
      if (
        !strings(p, ["id", "name", "version", "category", "author"]) ||
        !["description", "repo", "branch"].every(
          (key) => string(p[key]) && (p.status === "Draft" || text(p[key])),
        ) ||
        !string(p.input) ||
        !string(p.output) ||
        (p.status !== "Draft" && (!text(p.input) || !text(p.output))) ||
        !date(p.updated) ||
        !integer(p.stage, 4) ||
        !/^v?\d+\.\d+\.\d+$/.test(p.version as string)
      )
        return false;
      if (
        ![
          "Draft",
          "In review",
          "Changes requested",
          "Rejected",
          "Ready to publish",
          "Approved",
        ].includes(p.status as string)
      )
        return false;
      if (
        ["Approved", "Ready to publish"].includes(p.status as string) !==
        (p.stage === 4)
      )
        return false;
      if (p.status === "Draft" && p.stage !== 0) return false;
      if (
        !Array.isArray(p.history) ||
        !p.history.every(event) ||
        !optionalString(p.basedOn)
      )
        return false;
      return (
        attachments(p.attachments) &&
        columnList(p.requiredColumns) &&
        (p.revisionDraft === undefined ||
          (["Changes requested", "Rejected"].includes(p.status as string) &&
            draftFields(p.revisionDraft)))
      );
    })
  )
    return false;
  if (
    !datasets.every(
      (d) =>
        strings(d, ["id", "name", "description", "size", "format"]) &&
        integer(d.rows) &&
        date(d.date) &&
        (d.columns === undefined ||
          (Array.isArray(d.columns) && d.columns.every(text))),
    )
  )
    return false;
  const pipelineIds = new Set(pipelines.map((p) => p.id));
  const datasetIds = new Set(datasets.map((d) => d.id));
  const runIds = new Set(runs.map((r) => r.id));
  const artifactIds = new Set(artifacts.map((a) => a.id));
  if (
    !pipelines.every(
      (p) => p.basedOn === undefined || pipelineIds.has(p.basedOn),
    )
  )
    return false;
  if (
    !runs.every((r) => {
      if (
        !strings(r, [
          "id",
          "pipelineId",
          "pipelineName",
          "version",
          "datasetId",
          "datasetName",
        ]) ||
        !date(r.date) ||
        !integer(r.progress, 100) ||
        !["Running", "Completed", "Failed", "Cancelled"].includes(
          r.status as string,
        ) ||
        !optionalString(r.error) ||
        !optionalString(r.output)
      )
        return false;
      if (!pipelineIds.has(r.pipelineId) || !datasetIds.has(r.datasetId))
        return false;
      if (
        r.retryOf !== undefined &&
        (!runIds.has(r.retryOf) || r.retryOf === r.id)
      )
        return false;
      if (r.status === "Completed" && r.progress !== 100) return false;
      if (r.artifactId !== undefined && !artifactIds.has(r.artifactId))
        return false;
      if (r.failedStep !== undefined && !integer(r.failedStep, 3)) return false;
      return (
        r.support === undefined ||
        (object(r.support) &&
          strings(r.support, ["id", "message"]) &&
          ["Submitted", "Resolved"].includes(r.support.status as string) &&
          date(r.support.date) &&
          optionalString(r.support.resolution))
      );
    })
  )
    return false;
  if (
    !artifacts.every(
      (a) =>
        strings(a, [
          "id",
          "name",
          "runId",
          "pipelineId",
          "version",
          "datasetName",
        ]) &&
        integer(a.rows) &&
        date(a.date) &&
        ["Pending review", "Validated", "Not acceptable"].includes(
          a.status as string,
        ) &&
        optionalString(a.comment) &&
        optionalString(a.output) &&
        optionalString(a.reviewedBy) &&
        (a.reviewedAt === undefined || date(a.reviewedAt)) &&
        runIds.has(a.runId) &&
        pipelineIds.has(a.pipelineId),
    )
  )
    return false;
  return (value.events as unknown[]).every(event);
}
