import { useCallback, useEffect, useRef, useState } from "react";

// Drafts are per tab, so two reviewers in different tabs cannot overwrite notes.
// Decisions and evidence acknowledgments are never submitted by draft recovery.
const memoryDrafts = new Map<string, unknown>();
const unsavedDrafts = new Set<string>();
const warnMemoryDrafts = (event: BeforeUnloadEvent) => {
  if (!unsavedDrafts.size) return;
  event.preventDefault();
  event.returnValue = "";
};
function updateMemoryWarning() {
  window.removeEventListener("beforeunload", warnMemoryDrafts);
  if (unsavedDrafts.size)
    window.addEventListener("beforeunload", warnMemoryDrafts);
}

export function clearSessionDrafts() {
  memoryDrafts.clear();
  unsavedDrafts.clear();
  updateMemoryWarning();
  try {
    for (const key of Object.keys(sessionStorage))
      if (key.startsWith("zero-trust-draft-v1:"))
        sessionStorage.removeItem(key);
  } catch {
    /* The in-memory copies have still been cleared. */
  }
}

export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
}

export function useSessionDraft<T>(
  key: string,
  initial: T,
  valid: (value: unknown) => value is T,
) {
  const storageKey = `zero-trust-draft-v1:${key}`;
  const [snapshot, setSnapshot] = useState(() => {
    const cached = memoryDrafts.get(storageKey);
    try {
      const raw = sessionStorage.getItem(storageKey);
      const saved: unknown = raw ? JSON.parse(raw) : null;
      return valid(saved)
        ? { value: saved, stored: true }
        : { value: valid(cached) ? cached : initial, stored: !valid(cached) };
    } catch {
      return { value: valid(cached) ? cached : initial, stored: false };
    }
  });
  const current = useRef(snapshot.value);
  const update = useCallback(
    (value: T | ((previous: T) => T)) => {
      const next =
        typeof value === "function"
          ? (value as (previous: T) => T)(current.current)
          : value;
      current.current = next;
      memoryDrafts.set(storageKey, next);
      let stored = false;
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(next));
        stored = true;
      } catch {
        /* In-memory recovery remains available until this tab closes. */
      }
      if (!stored && JSON.stringify(next) !== JSON.stringify(initial))
        unsavedDrafts.add(storageKey);
      else unsavedDrafts.delete(storageKey);
      updateMemoryWarning();
      setSnapshot({ value: next, stored });
    },
    [storageKey, initial],
  );
  const clear = useCallback(() => {
    memoryDrafts.delete(storageKey);
    unsavedDrafts.delete(storageKey);
    updateMemoryWarning();
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      /* Already in memory. */
    }
    current.current = initial;
    setSnapshot({ value: initial, stored: true });
  }, [storageKey, initial]);
  return [snapshot.value, update, clear, snapshot.stored] as const;
}
