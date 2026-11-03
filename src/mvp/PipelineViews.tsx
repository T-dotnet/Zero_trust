import { useState } from "react";
import {
  Button,
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
} from "@mui/material";
import { ArrowRight, FileText, Plus } from "lucide-react";
import { formatDate, type Pipeline, type Workspace } from "./model";
import {
  EmptyState,
  HistoryList,
  PageHeader,
  PipelineProgress,
  ReviewGuide,
  SearchField,
} from "./ui";

interface Props {
  state: Workspace;
  onOpen: (p: Pipeline) => void;
  onNew: () => void;
  onRun: (p: Pipeline) => void;
  onApprovals: () => void;
}
export function PipelineCatalog({
  state,
  onOpen,
  onNew,
  onRun,
  onApprovals,
}: Props) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const approved = state.pipelines.filter(
    (p) => p.status === "Approved",
  ).length;
  const pending = state.pipelines.filter(
    (p) => p.status === "In review",
  ).length;
  const rows = state.pipelines.filter(
    (p) =>
      (tab === "all" ||
        (tab === "approved"
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
        <Button variant="outlined" onClick={onApprovals}>
          View approvals
        </Button>
        <Button
          variant="contained"
          startIcon={<Plus size={17} />}
          onClick={onNew}
        >
          New pipeline
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
      <section className="table-panel">
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          aria-label="Pipeline status"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="all" label={`All pipelines ${state.pipelines.length}`} />
          <Tab value="approved" label={`Approved ${approved}`} />
          <Tab value="review" label={`In review ${pending}`} />
        </Tabs>
        <div className="filter-bar">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search pipelines..."
          />
          <Select
            aria-label="Pipeline category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            size="small"
          >
            <MenuItem value="all">All categories</MenuItem>
            {Array.from(new Set(state.pipelines.map((p) => p.category))).map(
              (c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ),
            )}
          </Select>
        </div>
        <TableContainer>
          <Table aria-label="Pipelines">
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
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell className="name-cell">
                    <button className="entity-name" onClick={() => onOpen(p)}>
                      {p.name}
                    </button>
                    <p>{p.description}</p>
                  </TableCell>
                  <TableCell>
                    <span className="mono version">{p.version}</span>
                  </TableCell>
                  <TableCell>
                    <span className="category-text">{p.category}</span>
                  </TableCell>
                  <TableCell>
                    <PipelineProgress pipeline={p} />
                  </TableCell>
                  <TableCell className="nowrap">
                    {formatDate(p.updated)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant={
                        p.status === "Approved" ? "contained" : "outlined"
                      }
                      onClick={() =>
                        p.status === "Approved" ? onRun(p) : onOpen(p)
                      }
                    >
                      {p.status === "Approved"
                        ? "Run"
                        : p.status === "Ready to publish"
                          ? "Publish"
                          : p.status === "Draft"
                            ? "Edit"
                            : "Review"}
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

export function Approvals({ state, onOpen }: Pick<Props, "state" | "onOpen">) {
  const [search, setSearch] = useState("");
  const rows = state.pipelines.filter(
    (p) =>
      p.status !== "Approved" &&
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
      <section className="table-panel">
        <div className="filter-bar">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search submissions..."
          />
        </div>
        <TableContainer>
          <Table aria-label="Approval queue">
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
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell className="name-cell">
                    <button className="entity-name" onClick={() => onOpen(p)}>
                      {p.name}
                    </button>
                    <p>{p.author}</p>
                  </TableCell>
                  <TableCell className="mono">{p.version}</TableCell>
                  <TableCell>
                    <PipelineProgress pipeline={p} />
                  </TableCell>
                  <TableCell>
                    {p.status === "In review"
                      ? `${["Ethical", "Technical", "Privacy", "Security"][p.stage]} reviewer`
                      : "Researcher"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onOpen(p)}
                      endIcon={<ArrowRight size={14} />}
                    >
                      Open
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
            description="New submissions and required author actions will appear here."
          />
        )}
      </section>
    </>
  );
}

export function Overview({ state, onNew, onApprovals, onOpen, onRun }: Props) {
  const pending = state.pipelines.filter((p) => p.status === "In review");
  return (
    <>
      <PageHeader
        title="Workspace"
        description="A clear view of your research, from input to accepted output."
      >
        <Button
          variant="contained"
          onClick={onNew}
          startIcon={<Plus size={17} />}
        >
          New pipeline
        </Button>
      </PageHeader>
      <div className="metrics-row">
        {[
          [state.datasets.length, "Datasets"],
          [pending.length, "In review"],
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
          {pending.slice(0, 4).map((p) => (
            <button
              className="attention-row"
              key={p.id}
              onClick={() => onOpen(p)}
            >
              <FileText size={19} />
              <span>
                <strong>{p.name}</strong>
                <small>
                  {p.version} /{" "}
                  {["Ethical", "Technical", "Privacy", "Security"][p.stage]}{" "}
                  review
                </small>
              </span>
              <ArrowRight size={18} />
            </button>
          ))}
        </section>
        <section className="plain-panel">
          <h2>Approved & ready</h2>
          <p className="muted">Start with a reviewed processing method.</p>
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
                  onClick={() => onRun(p)}
                >
                  Run
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
