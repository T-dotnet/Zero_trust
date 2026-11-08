import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Fab, Portal, Tooltip, useMediaQuery } from "@mui/material";
import { SlidersHorizontal } from "lucide-react";
import "./demo.css";

type DemoAction = { id: string; label: string; run: () => void };
const Context = createContext<{
  actions: DemoAction[];
  register: (action: DemoAction) => () => void;
} | null>(null);

export function DemoToolsProvider({
  children,
  open,
  onOpen,
}: {
  children: ReactNode;
  open: boolean;
  onOpen: () => void;
}) {
  const [actions, setActions] = useState<DemoAction[]>([]);
  const register = useCallback((action: DemoAction) => {
    setActions((previous) => [
      ...previous.filter((a) => a.id !== action.id),
      action,
    ]);
    return () =>
      setActions((previous) => previous.filter((a) => a.id !== action.id));
  }, []);
  return (
    <Context.Provider value={{ actions, register }}>
      {children}
      <DemoLauncher hidden={open} onOpen={onOpen} />
    </Context.Provider>
  );
}

export function useDemoActions() {
  return useContext(Context)?.actions || [];
}

/** Task examples live in the demo panel while their form stays mounted. */
export function useDemoAction(
  label: string,
  action: () => void,
  enabled = true,
) {
  const id = useId();
  const register = useContext(Context)?.register;
  const latest = useRef(action);
  useLayoutEffect(() => {
    latest.current = action;
  });
  useEffect(() => {
    if (enabled && register)
      return register({ id, label, run: () => latest.current() });
  }, [enabled, id, label, register]);
}

function DemoLauncher({
  hidden,
  onOpen,
}: {
  hidden: boolean;
  onOpen: () => void;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [footerHeight, setFooterHeight] = useState(0);
  const compact = useMediaQuery(
    "(max-width: 599px), (max-width: 900px) and (max-height: 479px)",
  );
  useEffect(() => {
    if (hidden) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    const frame = requestAnimationFrame(() => {
      button.current?.focus({ preventScroll: true });
      wasOpen.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [hidden, host]);
  useLayoutEffect(() => {
    // Keep the single launcher inside an open task's accessible modal tree.
    // Opening demo tools never closes or replaces that task.
    const update = () => {
      const dialogs = [
        ...document.querySelectorAll<HTMLElement>(".MuiDialog-paper"),
      ].filter(
        (paper) =>
          paper.closest(".MuiModal-root")?.getAttribute("aria-hidden") !==
          "true",
      );
      const next = dialogs.at(-1) || document.body;
      setHost((previous) => (previous === next ? previous : next));
    };
    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-hidden"],
    });
    update();
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    if (!host || host === document.body) {
      setFooterHeight(0);
      return;
    }
    host.classList.add("demo-launcher-host");
    const footer = host.querySelector<HTMLElement>(".MuiDialogActions-root");
    const update = () =>
      setFooterHeight(footer?.getBoundingClientRect().height || 0);
    const observer = new ResizeObserver(update);
    if (footer) observer.observe(footer);
    update();
    return () => {
      observer.disconnect();
      host.classList.remove("demo-launcher-host");
    };
  }, [host]);
  return (
    <Portal container={host}>
      <Tooltip title="Demo controls" placement="left" describeChild>
        <Fab
          ref={button}
          className="demo-launcher"
          aria-label="Open demo controls"
          aria-haspopup="dialog"
          aria-controls="demo-controls-panel"
          aria-expanded={false}
          onClick={onOpen}
          style={
            {
              display: hidden ? "none" : undefined,
              "--demo-footer-height": `${compact ? footerHeight : 0}px`,
            } as CSSProperties
          }
        >
          <SlidersHorizontal size={22} />
        </Fab>
      </Tooltip>
    </Portal>
  );
}
