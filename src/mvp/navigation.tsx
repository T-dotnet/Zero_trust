import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { STAGES, type Page, type Role } from "./model";

const pages: Record<string, Page> = {
  overview: "Overview",
  datasets: "Datasets",
  pipelines: "Pipelines",
  runs: "Runs & results",
  approvals: "Approvals",
  activity: "Activity log",
};
const fields = [
  "pipeline",
  "dataset",
  "run",
  "output",
  "tab",
  "scope",
  "search",
  "status",
  "category",
  "event",
  "entity",
  "from",
  "until",
] as const;
type Field = (typeof fields)[number];
export type WorkspaceRoute = { page: Page; role: Role } & Partial<
  Record<Field, string>
>;
type Navigate = (
  next: WorkspaceRoute | ((previous: WorkspaceRoute) => WorkspaceRoute),
  replace?: boolean,
) => void;
const Context = createContext<{
  route: WorkspaceRoute;
  navigate: Navigate;
} | null>(null);

function readRoute(): WorkspaceRoute {
  const query = new URLSearchParams(location.search);
  const requestedRole = query.get("role");
  const roles: string[] = ["Researcher", ...STAGES.map((s) => `${s} reviewer`)];
  const route: WorkspaceRoute = {
    page: pages[query.get("page") || "pipelines"] || "Pipelines",
    // This selects a demo interface only; it never grants backend permissions.
    role: roles.includes(requestedRole || "")
      ? (requestedRole as Role)
      : "Researcher",
  };
  for (const field of fields) {
    const value = query.get(field);
    if (value) route[field] = value;
  }
  return route;
}

export function useWorkspaceNavigation() {
  const [route, setRoute] = useState(readRoute);
  const current = useRef(route);
  const navigate = useCallback<Navigate>((next, replace = false) => {
    const value = typeof next === "function" ? next(current.current) : next;
    const url = new URL(location.href);
    url.hash = "";
    url.searchParams.set(
      "page",
      Object.keys(pages).find((key) => pages[key] === value.page) ||
        "pipelines",
    );
    url.searchParams.set("role", value.role);
    for (const field of fields) {
      if (value[field]) url.searchParams.set(field, value[field]!);
      else url.searchParams.delete(field);
    }
    if (url.href !== location.href)
      history[replace ? "replaceState" : "pushState"](null, "", url);
    current.current = value;
    setRoute(value);
  }, []);
  useEffect(() => {
    const pop = () => {
      const next = readRoute();
      current.current = next;
      setRoute(next);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  return { route, navigate };
}

export function WorkspaceNavigation({
  value,
  children,
}: {
  value: { route: WorkspaceRoute; navigate: Navigate };
  children: ReactNode;
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRouteField(field: Field, fallback = "") {
  const context = useContext(Context);
  if (!context) throw new Error("Workspace navigation is unavailable");
  const set = (value: string) =>
    context.navigate(
      (previous) => ({ ...previous, [field]: value || undefined }),
      true,
    );
  return [context.route[field] || fallback, set] as const;
}
