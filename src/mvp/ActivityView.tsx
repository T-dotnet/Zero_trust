import { Alert, Button, MenuItem, TextField } from "@mui/material";
import { HistoryList, PageHeader, SearchField, EmptyState } from "./ui";
import { now, type Event, type Workspace } from "./model";
import { downloadText } from "./files";
import { useRouteField } from "./navigation";

const eventKind = (event: Event) =>
  /^Artifact/i.test(event.title)
    ? "Outputs"
    : /^Run|Support/i.test(event.title)
      ? "Runs"
      : /review (approved|rejected|changes requested)/i.test(event.title)
        ? "Reviews"
        : /dataset/i.test(event.title)
          ? "Datasets"
          : "Submissions";

export function ActivityView({
  state,
  onOpen,
}: {
  state: Workspace;
  onOpen: (event: Event) => void;
}) {
  const [search, setSearch] = useRouteField("search");
  const [kind, setKind] = useRouteField("event", "All");
  const [entity, setEntity] = useRouteField("entity", "All");
  const [from, setFrom] = useRouteField("from");
  const [until, setUntil] = useRouteField("until");
  const invalidRange = Boolean(from && until && from > until);
  const entities = new Map(
    state.events
      .filter((event) => event.entityId)
      .map((event) => [event.entityId!, event.entityName || event.entityId!]),
  );
  const events = state.events.filter(
    (event) =>
      (kind === "All" || eventKind(event) === kind) &&
      (entity === "All" || event.entityId === entity) &&
      (!from || event.date.slice(0, 10) >= from) &&
      (!until || event.date.slice(0, 10) <= until) &&
      `${event.title} ${event.actor} ${event.entityName || ""} ${event.entityId || ""} ${event.version || ""} ${event.note || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const clear = () => {
    setSearch("");
    setKind("All");
    setEntity("All");
    setFrom("");
    setUntil("");
  };
  return (
    <>
      <PageHeader
        title="Activity log"
        description="The decisions and actions behind every research output."
      >
        <Button
          variant="outlined"
          disabled={invalidRange}
          onClick={() =>
            downloadText(
              "zero-trust-activity.json",
              JSON.stringify(
                {
                  generatedAt: now(),
                  filters: { search, kind, entity, from, until },
                  events,
                },
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
          <span className="mono muted" role="status">
            {invalidRange
              ? "Check the date range"
              : `${events.length} of ${state.events.length} events`}
          </span>
        </div>
        <div className="activity-search">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search activity..."
          />
        </div>
        <details
          className="disclosure activity-filters"
          open={
            Boolean(from || until || kind !== "All" || entity !== "All") ||
            undefined
          }
        >
          <summary>
            Filter by entity, event or date
            {kind !== "All" || entity !== "All" || from || until
              ? " · filters active"
              : ""}
          </summary>
          <div className="activity-filter-grid disclosure-content">
            <TextField
              select
              label="Event type"
              value={kind}
              onChange={(event) => setKind(event.target.value)}
            >
              <MenuItem value="All">All events</MenuItem>
              {["Reviews", "Submissions", "Runs", "Outputs", "Datasets"].map(
                (value) => (
                  <MenuItem value={value} key={value}>
                    {value}
                  </MenuItem>
                ),
              )}
            </TextField>
            <TextField
              select
              label="Entity"
              value={entity}
              onChange={(event) => setEntity(event.target.value)}
            >
              <MenuItem value="All">All entities</MenuItem>
              {[...entities].map(([id, label]) => (
                <MenuItem value={id} key={id}>
                  {label} · {id}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="From date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              type="date"
              label="To date"
              error={invalidRange}
              helperText={
                invalidRange
                  ? "Choose an end date on or after the start date."
                  : undefined
              }
              value={until}
              onChange={(event) => setUntil(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </div>
          {invalidRange && (
            <Alert severity="warning">
              The end date is before the start date. Correct the range to view
              or export activity.
            </Alert>
          )}
          <Button onClick={clear} size="small">
            Clear filters
          </Button>
        </details>
        {invalidRange ? null : events.length ? (
          <HistoryList events={events} onOpen={onOpen} />
        ) : (
          <EmptyState
            title="No matching activity"
            description="Try another search or clear the filters."
            action={<Button onClick={clear}>Clear filters</Button>}
          />
        )}
        <p className="micro-copy">
          Export history includes the currently filtered events.
        </p>
      </section>
    </>
  );
}
