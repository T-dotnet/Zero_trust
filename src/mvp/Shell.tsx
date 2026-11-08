import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Avatar, Drawer, IconButton, Tooltip } from "@mui/material";
import {
  Activity,
  Database,
  House,
  Menu as MenuIcon,
  Play,
  Shield,
  ShieldCheck,
  Workflow,
  X,
} from "lucide-react";
import { type Page, type Role, actorFor } from "./model";
import { colors } from "./designTokens";
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
  approvalCount: number;
  children: ReactNode;
  storageAvailable: boolean;
}
export function Shell({
  page,
  setPage,
  role,
  approvalCount,
  children,
  storageAvailable,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const update = () => {
      if (header.current)
        root.style.setProperty(
          "--zt-header-height",
          `${header.current.getBoundingClientRect().height}px`,
        );
    };
    const observer = new ResizeObserver(update);
    if (header.current) observer.observe(header.current);
    update();
    return () => {
      observer.disconnect();
      root.style.removeProperty("--zt-header-height");
    };
  }, []);
  const go = (page: Page) => {
    setPage(page);
    setMobileOpen(false);
  };
  const sidebar = (
    <>
      <div className="brand">
        <Shield size={31} strokeWidth={2} />
        <span>Zero Trust</span>
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
        sx={{
          "& .MuiDrawer-paper": { width: 280, maxWidth: "calc(100% - 48px)" },
        }}
      >
        <div className="mobile-sidebar">
          <IconButton
            className="drawer-close"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={21} />
          </IconButton>
          {sidebar}
        </div>
      </Drawer>
      <div className="workspace-body">
        <header className="utility-bar" ref={header}>
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
            <span className="current-role">{role}</span>
            <Tooltip title={`${actorFor(role)}`}>
              <span
                className="workspace-avatar"
                aria-label={`${actorFor(role)} · ${role}`}
              >
                <Avatar
                  variant="circular"
                  sx={{
                    height: 31,
                    width: 31,
                    background: colors.surface,
                    border: `1px solid ${colors.line}`,
                    color: colors.body,
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
              </span>
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
    </div>
  );
}
