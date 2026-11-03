import { Check, ChevronRight, Search, ShieldCheck } from "lucide-react";
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
      <div className="heading-actions">{children}</div>
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
export function PipelineProgress({ pipeline }: { pipeline: Pipeline }) {
  const approved = pipeline.status === "Approved";
  return (
    <div className="pipeline-progress">
      <span
        className="progress-blocks"
        aria-label={`${pipeline.stage} of 4 stages approved`}
      >
        {STAGES.map((stage, i) => (
          <Tooltip
            key={stage}
            title={`${stage}: ${i < pipeline.stage ? "approved" : i === pipeline.stage && pipeline.status === "In review" ? "current review" : "pending"}`}
          >
            <span
              className={
                i < pipeline.stage
                  ? "complete"
                  : i === pipeline.stage && pipeline.status === "In review"
                    ? "current"
                    : ""
              }
            />
          </Tooltip>
        ))}
      </span>
      <Status
        kind={
          approved
            ? "success"
            : pipeline.status === "Rejected"
              ? "error"
              : pipeline.status === "Changes requested"
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
    <ol className={`stage-path ${illustrative ? "illustrative" : ""}`}>
      {[...STAGES.map((s) => `${s} review`), "Published"].map((label, i) => {
        const complete =
          pipeline &&
          (i < pipeline.stage || (i === 4 && pipeline.status === "Approved"));
        const current =
          pipeline && i === pipeline.stage && pipeline.status !== "Approved";
        return (
          <li
            key={label}
            className={`${complete ? "complete" : ""} ${current ? "current" : ""}`}
          >
            <span className="stage-number">
              {complete ? <Check size={15} /> : String(i + 1).padStart(2, "0")}
            </span>
            <span>
              <strong>{label}</strong>
              {pipeline && (
                <small>
                  {complete
                    ? "Completed"
                    : current
                      ? i === 4
                        ? "Author action"
                        : "Current stage"
                      : "Upcoming"}
                </small>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
export function HistoryList({
  events,
  compact = false,
}: {
  events: Event[];
  compact?: boolean;
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
    <section className="review-guide">
      <h2>Every pipeline follows a clear path</h2>
      <StagePath illustrative />
      <Button
        onClick={onExplore}
        className="text-link"
        endIcon={<ChevronRight size={16} />}
      >
        Explore the review process
      </Button>
    </section>
  );
}
