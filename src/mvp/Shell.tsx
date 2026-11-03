import { useState, type ReactNode } from "react";
import {
  Avatar,
  Button,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import {
  Activity,
  ArrowUpRight,
  ChevronDown,
  Database,
  FileText,
  House,
  Menu as MenuIcon,
  Play,
  RotateCcw,
  Shield,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { STAGES, type Page, type Role, actorFor } from "./model";
const NAV = [
  ["Overview", House],
  ["Datasets", Database],
  ["Pipelines", Workflow],
  ["Runs & results", Play],
  ["Approvals", ShieldCheck],
  ["Activity log", Activity],
] as const;
interface Props {
  page: Page;
  setPage: (page: Page) => void;
  role: Role;
  setRole: (role: Role) => void;
  approvalCount: number;
  children: ReactNode;
  onReset: () => void;
  onHelp: () => void;
  onSimulation: () => void;
  storageAvailable: boolean;
}
export function Shell({
  page,
  setPage,
  role,
  setRole,
  approvalCount,
  children,
  onReset,
  onHelp,
  onSimulation,
  storageAvailable,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const go = (page: Page) => {
    setPage(page);
    setMobileOpen(false);
  };
  const sidebar = (
    <>
      <div className="brand">
        <Shield size={31} strokeWidth={2} />
        <span>ZERO TRUST</span>
      </div>
      <div className="workspace-label">Research workspace</div>
      <nav aria-label="Main navigation">
        {NAV.map(([label, Icon]) => (
          <button
            key={label}
            aria-label={label}
            onClick={() => go(label)}
            className={`nav-item ${page === label ? "active" : ""}`}
            aria-current={page === label ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={1.6} />
            <span>{label}</span>
            {label === "Approvals" && approvalCount > 0 && (
              <b>{approvalCount}</b>
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <strong>Clinical Research</strong>
        <span>MVP prototype</span>
        <button className="sidebar-help" onClick={onHelp}>
          <FileText size={14} /> Walkthrough guide <ArrowUpRight size={13} />
        </button>
        <button className="simulation-link" onClick={onSimulation}>
          Simulation controls
        </button>
      </div>
    </>
  );
  return (
    <div className="mvp-app">
      <a href="#workspace-main" className="skip-link">
        Skip to workspace
      </a>
      <aside className="desktop-sidebar">{sidebar}</aside>
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ "& .MuiDrawer-paper": { width: 224 } }}
      >
        <div className="mobile-sidebar">{sidebar}</div>
      </Drawer>
      <div className="workspace-body">
        <header className="utility-bar">
          <div className="utility-left">
            <IconButton
              aria-label="Open navigation"
              className="mobile-menu"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon size={21} />
            </IconButton>
            <span className="breadcrumb">
              Workspace <i>/</i> <strong>{page}</strong>
            </span>
          </div>
          <div className="utility-actions">
            <Tooltip
              describeChild
              title="Interactive UX prototype. Open simulation controls to advance the walkthrough."
            >
              <button className="demo-mode" onClick={onSimulation}>
                Demo mode
              </button>
            </Tooltip>
            <Select
              aria-label="Acting role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              size="small"
              IconComponent={ChevronDown}
              className="role-select"
            >
              {(
                ["Researcher", ...STAGES.map((s) => `${s} reviewer`)] as Role[]
              ).map((r) => (
                <MenuItem value={r} key={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
            <Tooltip title={`${actorFor(role)} · workspace options`}>
              <IconButton
                aria-label="Workspace options"
                onClick={(e) => setAnchor(e.currentTarget)}
                size="small"
              >
                <Avatar
                  variant="square"
                  sx={{
                    height: 31,
                    width: 31,
                    background: "#fff",
                    border: "1px solid #171b1a",
                    color: "#171b1a",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {role === "Researcher"
                    ? "SC"
                    : actorFor(role)
                        .split(" ")
                        .filter((s) => s !== "Dr.")
                        .map((s) => s[0])
                        .join("")}
                </Avatar>
              </IconButton>
            </Tooltip>
          </div>
        </header>
        <main id="workspace-main" tabIndex={-1}>
          {children}
        </main>
        <footer className="workspace-footer">
          <span>Zero Trust / Clinical Research</span>
          <span>
            {storageAvailable
              ? "Your work is saved in this browser."
              : "Browser storage unavailable. Changes last for this session."}
          </span>
        </footer>
      </div>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setAnchor(null);
            onSimulation();
          }}
        >
          Simulation controls
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            onHelp();
          }}
        >
          Walkthrough guide
        </MenuItem>
        <MenuItem component="a" href="/?view=full" target="_blank">
          Open original workspace
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            onReset();
          }}
        >
          <RotateCcw size={15} style={{ marginRight: 10 }} /> Reset demo data
        </MenuItem>
      </Menu>
    </div>
  );
}
