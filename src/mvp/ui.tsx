import { Check, ChevronRight, Search, ShieldCheck, X } from "lucide-react";
import { Button, InputAdornment, TextField, Tooltip } from "@mui/material";
import type { ReactNode } from "react";
import {
  STAGES,
  type Pipeline,
  type Event,
  formatTime,
  stageLabel,
} from "./model";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="heading-actions">{children}</div>}
    </header>
  );
}
export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder: string;
}) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search size={17} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
export function Status({
  children,
  kind,
}: {
  children: ReactNode;
  kind?: "success" | "warning" | "error" | "neutral";
}) {
  return (
    <span className={`status-label ${kind || "neutral"}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}
export function ReviewProgressLegend() {
  return (
    <div className="review-progress-legend" role="group" aria-label="Review progress legend">
      <span><i className="complete" aria-hidden="true" />Completed</span>
      <span><i className="current" aria-hidden="true" />Current step</span>
      <span><i className="pending" aria-hidden="true" />Pending</span>
      <span><i className="blocked" aria-hidden="true" />Needs changes</span>
    </div>
  );
}
export function PipelineProgress({ pipeline }: { pipeline: Pipeline }) {
  const approved = pipeline.status === "Approved";
  const needsChanges = pipeline.status === "Rejected" || pipeline.status === "Changes requested";
  return (
    <div className="pipeline-progress">
      <span className="review-progress-summary">
      <span
        className="progress-blocks"
        role="img"
        aria-label={`${pipeline.stage} of 4 stages approved; ${stageLabel(pipeline)}`}
      >
        {STAGES.map((stage, i) => (
          <Tooltip
            key={stage}
            title={`${stage}: ${i < pipeline.stage ? "approved" : i === pipeline.stage && pipeline.status === "In review" ? "current review" : i === pipeline.stage && needsChanges ? "needs author changes" : "pending"}`}
          >
            <span
              className={
                i < pipeline.stage
                  ? "complete"
                  : i === pipeline.stage && pipeline.status === "In review"
                    ? "current"
                    : i === pipeline.stage && needsChanges
                      ? "blocked"
                      : "pending"
              }
            />
          </Tooltip>
        ))}
      </span>
      <span className="progress-count" aria-hidden="true">{pipeline.stage}/4</span>
      </span>
      <Status
        kind={
          approved
            ? "success"
            : pipeline.status === "Rejected"
              ? "error"
              : needsChanges
                ? "error"
                : pipeline.status === "In review" || pipeline.status === "Ready to publish"
                  ? "warning"
                  : "neutral"
        }
      >
        {stageLabel(pipeline)}
      </Status>
    </div>
  );
}
export function StagePath({
  pipeline,
  illustrative = false,
}: {
  pipeline?: Pipeline;
  illustrative?: boolean;
}) {
  return (
    <>
    <ReviewProgressLegend />
    <ol className={`stage-path ${illustrative ? "illustrative" : ""}`}>
      {[...STAGES.map((s) => `${s} review`), "Publication"].map((label, i) => {
        const complete =
          pipeline &&
          (i < pipeline.stage || (i === 4 && pipeline.status === "Approved"));
        const current =
          pipeline && i === pipeline.stage && pipeline.status !== "Approved";
        const blocked = current &&
          (pipeline?.status === "Rejected" || pipeline?.status === "Changes requested");
        return (
          <li
            key={label}
            className={`${complete ? "complete" : ""} ${current ? "current" : ""} ${blocked ? "blocked" : ""} ${pipeline?.status === "Draft" ? "not-started" : ""}`}
            aria-current={current && pipeline?.status !== "Draft" && pipeline?.status !== "Rejected" && pipeline?.status !== "Changes requested" ? "step" : undefined}
          >
            <span className="stage-number" aria-hidden="true">
              {complete ? <Check size={15} /> : blocked ? <X size={15} /> : String(i + 1).padStart(2, "0")}
            </span>
            <span>
              <strong>{label}</strong>
              {pipeline && (
                <small>
                  {complete
                    ? i === 4
                      ? "Published"
                      : "Completed"
                    : current
                      ? pipeline.status === "Draft"
                        ? "Not submitted"
                        : blocked
                          ? pipeline.status
                        : pipeline.status !== "In review"
                          ? i === 4
                            ? "Ready to publish"
                            : "Author action"
                          : "Current review"
                      : "Pending"}
                </small>
              )}
            </span>
          </li>
        );
      })}
    </ol>
    </>
  );
}
export function HistoryList({
  events,
  compact = false,
  onOpen,
}: {
  events: Event[];
  compact?: boolean;
  onOpen?: (event: Event) => void;
}) {
  return (
    <div className={`history-list ${compact ? "compact" : ""}`}>
      {events.map((event) => (
        <div className="history-item" key={event.id}>
          <span className="history-marker">
            <Check size={12} />
          </span>
          <div>
            <strong>{event.title}</strong>
            {event.entityName && (
              <small className="history-context">
                {onOpen && event.entityId ? (
                  <button className="entity-name" onClick={() => onOpen(event)}>
                    {event.entityName}
                    {event.version ? ` · ${event.version}` : ""}
                  </button>
                ) : (
                  <>
                    {event.entityName}
                    {event.version ? ` · ${event.version}` : ""}
                  </>
                )}
              </small>
            )}
            <p>
              {event.actor}
              {event.note ? ` · ${event.note}` : ""}
            </p>
          </div>
          <time>{formatTime(event.date)}</time>
        </div>
      ))}
      {events.length === 0 && (
        <p className="empty-copy">Activity will appear here as you work.</p>
      )}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <ShieldCheck size={32} strokeWidth={1.3} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function ReviewGuide({ onExplore }: { onExplore: () => void }) {
  return (
    <details className="review-guide disclosure">
      <summary>
        How approval works
      </summary>
      <StagePath illustrative />
      <Button
        onClick={onExplore}
        className="text-link"
        endIcon={<ChevronRight size={16} />}
      >
        View stages
      </Button>
    </details>
  );
}
