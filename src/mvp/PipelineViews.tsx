import { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
} from "@mui/material";
import { ArrowRight, FileText, Plus, SlidersHorizontal, X } from "lucide-react";
import {
  formatDate,
  stageLabel,
  pipelineNeedsAction,
  pipelineActionLabel,
  type Pipeline,
  type Workspace,
  type Role,
} from "./model";
import {
  EmptyState,
  HistoryList,
  PageHeader,
  PipelineProgress,
  ReviewGuide,
  ReviewProgressLegend,
  SearchField,
} from "./ui";

interface Props {
  state: Workspace;
  onOpen: (p: Pipeline) => void;
  onNew: () => void;
  onRun: (p: Pipeline) => void;
  onApprovals: () => void;
  role: Role;
  onOutputs: () => void;
}
export function PipelineCatalog({
  state,
  onOpen,
  onNew,
  onRun,
  onApprovals,
  role,
}: Props) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(
    null,
  );
  const compact = useMediaQuery("(max-width: 599px)");
  const categoryMenuOpen = compact && Boolean(categoryAnchor?.isConnected);
  const tasks = state.pipelines.filter((p) => pipelineNeedsAction(p, role));
  const approved = state.pipelines.filter(
    (p) => p.status === "Approved",
  ).length;
  const pending = state.pipelines.filter(
    (p) => p.status === "In review",
  ).length;
  const categories = Array.from(
    new Set(state.pipelines.map((p) => p.category)),
  );
  const statuses = [
    { value: "all", label: `All pipelines ${state.pipelines.length}` },
    {
      value: "tasks",
      label: `Needs your action ${tasks.length}`,
      short: `Needs action ${tasks.length}`,
    },
    { value: "approved", label: `Approved ${approved}` },
    { value: "review", label: `In review ${pending}` },
  ];
  const rows = state.pipelines.filter(
    (p) =>
      (tab === "all" ||
        (tab === "tasks"
          ? pipelineNeedsAction(p, role)
          : tab === "approved"
            ? p.status === "Approved"
            : p.status === "In review")) &&
      (category === "all" || p.category === category) &&
      `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Pipelines"
        description="From research code to approved, reproducible workflows."
      >
        <Button
          variant="contained"
          startIcon={<Plus size={17} />}
          onClick={role === "Researcher" ? onNew : onApprovals}
        >
          {role === "Researcher" ? "New pipeline" : "View my tasks"}
        </Button>
        <Button variant="outlined" onClick={onApprovals}>
          View approvals
        </Button>
      </PageHeader>
      <div className="metrics-row">
        {[
          [state.pipelines.length, "Total pipelines"],
          [approved, "Approved"],
          [pending, "In review"],
        ].map(([n, label]) => (
          <div key={label}>
            <strong>{String(n).padStart(2, "0")}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <ReviewProgressLegend />
      <section className="table-panel">
        {!compact && (
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            aria-label="Pipeline status"
            variant="scrollable"
            scrollButtons="auto"
          >
            {statuses.map((status) => (
              <Tab
                key={status.value}
                value={status.value}
                label={status.label}
              />
            ))}
          </Tabs>
        )}
        <div
          className={`filter-bar ${compact ? "catalog-mobile-controls" : ""}`}
        >
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search pipelines..."
          />
          {compact ? (
            <>
              <Select
                aria-label="Pipeline status"
                value={tab}
                onChange={(event) => setTab(event.target.value)}
                renderValue={(value) => {
                  const status = statuses.find((item) => item.value === value);
                  return status?.short || status?.label;
                }}
              >
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
              <Button
                variant="outlined"
                startIcon={<SlidersHorizontal size={17} />}
                onClick={(event) => setCategoryAnchor(event.currentTarget)}
                aria-label="Filter pipelines by category"
                aria-haspopup="menu"
                aria-expanded={categoryMenuOpen}
              >
                Filters{category !== "all" ? " (1)" : ""}
              </Button>
              {category !== "all" && (
                <Button
                  className="active-category-filter"
                  aria-label={`Clear category filter: ${category}`}
                  endIcon={<X size={16} />}
                  onClick={() => setCategory("all")}
                >
                  Category: {category}
                </Button>
              )}
            </>
          ) : (
            <Select
              aria-label="Pipeline category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              size="small"
            >
              <MenuItem value="all">All categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          )}
        </div>
        <Menu
          anchorEl={categoryAnchor}
          open={categoryMenuOpen}
          onClose={() => setCategoryAnchor(null)}
          slotProps={{ list: { "aria-label": "Pipeline categories" } }}
        >
          {["all", ...categories].map((value) => (
            <MenuItem
              key={value}
              role="menuitemradio"
              aria-checked={category === value}
              selected={category === value}
              onClick={() => {
                setCategory(value);
                setCategoryAnchor(null);
              }}
            >
              {value === "all" ? "All categories" : value}
            </MenuItem>
          ))}
        </Menu>
        <TableContainer>
          <Table
            aria-label="Pipelines"
            role="table"
            className="mobile-card-table"
          >
            <TableHead>
              <TableRow>
                {[
                  "Pipeline",
                  "Version",
                  "Category",
                  "Review progress",
                  "Updated",
                  "Action",
                ].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody role="rowgroup">
              {rows.map((p) => (
                <TableRow role="row" key={p.id} hover>
                  <TableCell
                    className="name-cell"
                    role="cell"
                    data-label="Pipeline"
                  >
                    <button className="entity-name" onClick={() => onOpen(p)}>
                      {p.name}
                    </button>
                    <p>{p.description}</p>
                  </TableCell>
                  <TableCell role="cell" data-label="Version">
                    <span className="mono version">{p.version}</span>
                  </TableCell>
                  <TableCell role="cell" data-label="Category">
                    <span className="category-text">{p.category}</span>
                  </TableCell>
                  <TableCell role="cell" data-label="Review progress">
                    <PipelineProgress pipeline={p} />
                  </TableCell>
                  <TableCell
                    className="nowrap"
                    role="cell"
                    data-label="Updated"
                  >
                    {formatDate(p.updated)}
                  </TableCell>
                  <TableCell
                    role="cell"
                    data-label="Action"
                    className="mobile-card-actions"
                  >
                    <Button
                      size="small"
                      variant={
                        p.status === "Approved" ? "contained" : "outlined"
                      }
                      onClick={() =>
                        p.status === "Approved" && role === "Researcher"
                          ? onRun(p)
                          : onOpen(p)
                      }
                    >
                      {pipelineActionLabel(p, role)}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {rows.length === 0 && (
          <EmptyState
            title="No matching pipelines"
            description="Try another search or category."
            action={
              <Button
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setTab("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}
        <div className="table-footer">
          <span>
            Showing {rows.length} pipeline{rows.length === 1 ? "" : "s"}
          </span>
          <span className="mono">
            {tab === "all" ? "ALL" : tab.toUpperCase()} / {rows.length}
          </span>
        </div>
      </section>
      <ReviewGuide onExplore={onApprovals} />
    </>
  );
}

export function Approvals({
  state,
  onOpen,
  role,
}: Pick<Props, "state" | "onOpen" | "role">) {
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState(role === "Researcher" ? "all" : "mine");
  const submissions = state.pipelines.filter((p) => p.status !== "Approved");
  const tasks = submissions.filter((p) => pipelineNeedsAction(p, role));
  const rows = state.pipelines.filter(
    (p) =>
      p.status !== "Approved" &&
      (scope === "all" || pipelineNeedsAction(p, role)) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Approvals"
        description="Four distinct reviews. One traceable path to publication."
      />
      <div className="section-note">
        New submissions pass Ethical, Technical, Privacy, and Security review.
        Publication remains an author action.
      </div>
      <ReviewProgressLegend />
      <section className="table-panel">
        <Tabs
          value={scope}
          onChange={(_, value) => setScope(value)}
          aria-label="Approval scope"
        >
          <Tab value="mine" label={`My tasks ${tasks.length}`} />
          <Tab value="all" label={`All submissions ${submissions.length}`} />
        </Tabs>
        <div className="filter-bar">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search submissions..."
          />
        </div>
        <TableContainer>
          <Table
            aria-label="Approval queue"
            role="table"
            className="mobile-card-table"
          >
            <TableHead>
              <TableRow>
                {[
                  "Submission",
                  "Version",
                  "Review progress",
                  "Next actor",
                  "Action",
                ].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody role="rowgroup">
              {rows.map((p) => (
                <TableRow role="row" key={p.id} hover>
                  <TableCell
                    className="name-cell"
                    role="cell"
                    data-label="Submission"
                  >
                    <button className="entity-name" onClick={() => onOpen(p)}>
                      {p.name}
                    </button>
                    <p>{p.author}</p>
                  </TableCell>
                  <TableCell className="mono" role="cell" data-label="Version">
                    {p.version}
                  </TableCell>
                  <TableCell role="cell" data-label="Review progress">
                    <PipelineProgress pipeline={p} />
                  </TableCell>
                  <TableCell role="cell" data-label="Next actor">
                    {p.status === "In review"
                      ? `${["Ethical", "Technical", "Privacy", "Security"][p.stage]} reviewer`
                      : "Researcher"}
                  </TableCell>
                  <TableCell
                    role="cell"
                    data-label="Action"
                    className="mobile-card-actions"
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onOpen(p)}
                      endIcon={<ArrowRight size={14} />}
                    >
                      {pipelineActionLabel(p, role)}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {!rows.length && (
          <EmptyState
            title="All caught up"
            description={
              search
                ? "Try another search or view all submissions."
                : scope === "mine"
                  ? "No submissions currently require your action. View all submissions to track other stages."
                  : "New submissions and required author actions will appear here."
            }
            action={
              scope === "mine" ? (
                <Button
                  onClick={() => {
                    setScope("all");
                    setSearch("");
                  }}
                >
                  View all submissions
                </Button>
              ) : undefined
            }
          />
        )}
      </section>
    </>
  );
}

export function Overview({
  state,
  onNew,
  onApprovals,
  onOpen,
  onRun,
  role,
  onOutputs,
}: Props) {
  const attention = state.pipelines
    .filter((p) => pipelineNeedsAction(p, role))
    .sort(
      (a, b) =>
        Number(a.status === "In review") - Number(b.status === "In review") ||
        b.updated.localeCompare(a.updated),
    );
  return (
    <>
      <PageHeader
        title="Workspace"
        description="A clear view of your research, from input to accepted output."
      >
        <Button
          variant="contained"
          onClick={role === "Researcher" ? onNew : onApprovals}
          startIcon={<Plus size={17} />}
        >
          {role === "Researcher" ? "New pipeline" : "View my tasks"}
        </Button>
      </PageHeader>
      <div className="metrics-row overview-metrics">
        {[
          [state.datasets.length, "Datasets"],
          [attention.length, "Your pipeline tasks"],
          [
            state.runs.filter((r) => r.status === "Running").length,
            "Active runs",
          ],
          [
            state.artifacts.filter((a) => a.status === "Pending review").length,
            "Outputs to review",
          ],
        ].map(([n, label]) => (
          <div key={label}>
            <strong>{String(n).padStart(2, "0")}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="overview-grid">
        <section className="plain-panel">
          <div className="section-title">
            <h2>Needs attention</h2>
            <Button
              onClick={onApprovals}
              size="small"
              endIcon={<ArrowRight size={15} />}
            >
              All approvals
            </Button>
          </div>
          {attention.slice(0, 4).map((p) => (
            <button
              className="attention-row"
              key={p.id}
              onClick={() => onOpen(p)}
            >
              <FileText size={19} />
              <span>
                <strong>{p.name}</strong>
                <small>
                  {p.version} / {stageLabel(p)}
                </small>
              </span>
              <ArrowRight size={18} />
            </button>
          ))}
          {role === "Privacy reviewer" &&
            state.artifacts.some((a) => a.status === "Pending review") && (
              <button className="attention-row" onClick={onOutputs}>
                <FileText size={19} />
                <span>
                  <strong>Validate research outputs</strong>
                  <small>
                    {
                      state.artifacts.filter(
                        (a) => a.status === "Pending review",
                      ).length
                    }{" "}
                    awaiting your decision
                  </small>
                </span>
                <ArrowRight size={18} />
              </button>
            )}
          {!attention.length && (
            <p className="muted">
              No pipeline submissions currently require your action.
            </p>
          )}
        </section>
        <section className="plain-panel">
          <h2>Approved & ready</h2>
          <p className="muted">Start with a reviewed processing method.</p>
          {!state.pipelines.some((p) => p.status === "Approved") && (
            <p className="muted">
              Pipelines appear here after approval and publication.
            </p>
          )}
          {state.pipelines
            .filter((p) => p.status === "Approved")
            .map((p) => (
              <div className="attention-row" key={p.id}>
                <span>
                  <strong>{p.name}</strong>
                  <small>
                    {p.version} / {p.category}
                  </small>
                </span>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => (role === "Researcher" ? onRun(p) : onOpen(p))}
                >
                  {role === "Researcher" ? "Run" : "View"}
                </Button>
              </div>
            ))}
        </section>
      </div>
      <section className="plain-panel">
        <h2>Recent activity</h2>
        <HistoryList events={state.events.slice(0, 4)} compact />
      </section>
    </>
  );
}
