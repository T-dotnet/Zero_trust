import { useCallback, useEffect, useRef, useState } from "react";
import {
  seedWorkspace,
  workspaceReducer,
  type Action,
  type Workspace,
} from "./model";
import { isWorkspace } from "./storage";

export const STORAGE_KEY = "zero-trust-mvp-v1";
type Snapshot = {
  state: Workspace;
  storageAvailable: boolean;
  recoveryData: string | null;
  recoveryReason: "unreadable" | "conflict" | null;
};

function parseSaved(raw: string | null): Workspace | null {
  if (raw === null) return seedWorkspace();
  try {
    const saved: unknown = JSON.parse(raw);
    return isWorkspace(saved) ? saved : null;
  } catch {
    return null;
  }
}

function restore(): Snapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const state = parseSaved(raw);
    return {
      state: state || seedWorkspace(),
      storageAvailable: true,
      recoveryData: state ? null : raw,
      recoveryReason: state ? null : "unreadable",
    };
  } catch {
    return {
      state: seedWorkspace(),
      storageAvailable: false,
      recoveryData: null,
      recoveryReason: null,
    };
  }
}

export function useWorkspace() {
  const [snapshot, setSnapshot] = useState(restore);
  const current = useRef(snapshot);
  const unsaved = useRef<{
    base: string | null | undefined;
    state: Workspace;
  } | null>(null);
  const lastSaved = useRef<string | null | undefined>(undefined);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const initialized = useRef(false);
  const publish = useCallback((next: Snapshot) => {
    current.current = next;
    setSnapshot(next);
  }, []);

  // Read/reduce/write is serialized across tabs. Failed saves retain the exact
  // in-memory state; they are never replayed with regenerated history IDs.
  const enqueue = useCallback(
    (action?: Action, useSaved = false) => {
      const update = () => {
        let raw: string | null;
        try {
          raw = localStorage.getItem(STORAGE_KEY);
        } catch {
          const before = current.current;
          const next =
            action && before.recoveryData === null
              ? workspaceReducer(before.state, action)
              : before.state;
          if (next !== before.state)
            unsaved.current = {
              base: unsaved.current ? unsaved.current.base : lastSaved.current,
              state: next,
            };
          publish({ ...before, state: next, storageAvailable: false });
          return !action || next !== before.state;
        }
        const saved = parseSaved(raw);
        const localConflict =
          unsaved.current &&
          raw !== unsaved.current.base &&
          !(unsaved.current.base === undefined && raw === null);
        if (
          (localConflict || current.current.recoveryReason === "conflict") &&
          action?.type !== "RESET" &&
          !useSaved
        ) {
          publish({
            ...current.current,
            recoveryReason: "conflict",
            recoveryData: JSON.stringify(unsaved.current!.state),
            storageAvailable: false,
          });
          return false;
        }
        if (!saved && action?.type !== "RESET") {
          // A recovery download of unsaved work must stay accessible even if
          // the other tab's saved copy also becomes unreadable.
          if (current.current.recoveryReason === "conflict") return false;
          publish({
            ...current.current,
            recoveryData: raw,
            recoveryReason: "unreadable",
          });
          return false;
        }
        const base = useSaved
          ? saved!
          : unsaved.current?.state || saved || seedWorkspace();
        const next = action ? workspaceReducer(base, action) : base;
        try {
          // Reset/recovery is explicit and keeps the replaced bytes as a backup.
          const backup =
            useSaved || current.current.recoveryReason === "conflict"
              ? current.current.recoveryData
              : !saved
                ? raw
                : null;
          if (backup !== null)
            localStorage.setItem(
              `${STORAGE_KEY}-recovery-${crypto.randomUUID()}`,
              backup,
            );
          const encoded = JSON.stringify(next);
          localStorage.setItem(STORAGE_KEY, encoded);
          lastSaved.current = encoded;
          unsaved.current = null;
          publish({
            state: next,
            storageAvailable: true,
            recoveryData: null,
            recoveryReason: null,
          });
        } catch {
          if (!saved || useSaved || current.current.recoveryData !== null) {
            publish({ ...current.current, storageAvailable: false });
            return false;
          }
          if (action || unsaved.current)
            unsaved.current = { base: raw, state: next };
          publish({
            state: next,
            storageAvailable: false,
            recoveryData: null,
            recoveryReason: null,
          });
        }
        return !action || next !== base;
      };
      const result = queue.current
        .then(async () => {
          if (navigator.locks)
            return await navigator.locks.request(STORAGE_KEY, update);
          // Session-only fallback: unsafe cross-tab persistence is never attempted.
          const before = current.current;
          const next =
            action && before.recoveryData === null
              ? workspaceReducer(before.state, action)
              : before.state;
          if (next !== before.state)
            unsaved.current = { base: lastSaved.current, state: next };
          publish({ ...before, state: next, storageAvailable: false });
          return !action || next !== before.state;
        })
        .catch(() => {
          publish({ ...current.current, storageAvailable: false });
          return false;
        });
      queue.current = result;
      return result;
    },
    [publish],
  );

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      void enqueue();
    }
    const sync = (event: StorageEvent) => {
      if (
        event.storageArea === localStorage &&
        (event.key === STORAGE_KEY || event.key === null)
      )
        void enqueue();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [enqueue]);

  useEffect(() => {
    if (snapshot.storageAvailable) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (!unsaved.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [snapshot.storageAvailable]);

  const hasRunningJobs =
    snapshot.recoveryData === null &&
    snapshot.state.runs.some((r) => r.status === "Running");
  useEffect(() => {
    if (!hasRunningJobs) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible")
        void enqueue({ type: "TICK" });
    }, 650);
    return () => window.clearInterval(timer);
  }, [hasRunningJobs, enqueue]);

  return {
    ...snapshot,
    dispatch: enqueue,
    loadSavedWorkspace: () => enqueue(undefined, true),
  };
}
