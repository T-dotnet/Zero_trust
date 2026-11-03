import { useEffect, useReducer, useState } from "react";
import { seedWorkspace, workspaceReducer, type Workspace } from "./model";
import { isWorkspace } from "./storage";
const STORAGE_KEY = "zero-trust-mvp-v1";
function restore(): Workspace {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (isWorkspace(saved)) return saved;
  } catch {
    /* A fresh demo also works when browser storage is unavailable. */
  }
  return seedWorkspace();
}
export function useWorkspace() {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, restore);
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }, [state]);
  const hasRunningJobs = state.runs.some((r) => r.status === "Running");
  useEffect(() => {
    if (!hasRunningJobs) return;
    const timer = window.setInterval(() => dispatch({ type: "TICK" }), 650);
    return () => window.clearInterval(timer);
  }, [hasRunningJobs]);
  return { state, dispatch, storageAvailable };
}
