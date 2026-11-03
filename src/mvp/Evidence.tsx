import { useLayoutEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { FileText, Paperclip, X } from "lucide-react";
import { uid, type Attachment } from "./model";
import { WorkspaceDialog } from "./WorkspaceDialog";

export function AttachmentPicker({
  attachments,
  onChange,
  onBusyChange,
}: {
  attachments: Attachment[];
  onChange: (files: Attachment[]) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const picker = useRef<HTMLLabelElement>(null);
  const restoreFocus = useRef(false);
  useLayoutEffect(() => {
    if (!busy && restoreFocus.current) {
      const active = document.activeElement;
      if (
        active === document.body ||
        active === picker.current?.closest('[role="dialog"]') ||
        picker.current?.contains(active)
      )
        picker.current?.focus({ preventScroll: true });
      restoreFocus.current = false;
    }
    // Fast file reads can batch busy=true/false into one render. The new
    // attachment list must also restore focus before the next keyboard event.
  }, [busy, attachments]);
  const read = async (files: FileList | null) => {
    if (!files || busy) return;
    const list = Array.from(files);
    if (
      attachments.length + list.length > 4 ||
      list.some(
        (f) => f.size > 50_000 || !/\.(txt|md|json|csv|ya?ml)$/i.test(f.name),
      )
    ) {
      setError(
        "Attach up to four text, Markdown, JSON, CSV, or YAML files, each under 50 KB.",
      );
      return;
    }
    try {
      setBusy(true);
      restoreFocus.current = true;
      onBusyChange(true);
      const added = await Promise.all(
        list.map(async (f) => ({
          id: uid("file"),
          name: f.name,
          size: f.size,
          content: await f.text(),
        })),
      );
      onChange([...attachments, ...added]);
      setError("");
    } catch {
      setError("The selected file could not be read.");
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  };
  return (
    <div className="evidence-picker">
      <div className="section-title">
        <h3>Evidence attachments</h3>
        <Button
          component="label"
          ref={picker}
          disabled={busy}
          size="small"
          startIcon={<Paperclip size={15} />}
        >
          Attach files
          <input
            type="file"
            multiple
            hidden
            accept=".txt,.md,.json,.csv,.yaml,.yml"
            onChange={(e) => {
              void read(e.target.files);
              e.target.value = "";
            }}
          />
        </Button>
      </div>
      <p className="micro-copy">
        Optional supporting text files. They remain in this browser and are
        available to demo reviewers.
      </p>
      {attachments.map((a) => (
        <div className="attachment-row" key={a.id}>
          <FileText size={17} />
          <span>
            {a.name}
            <small>{Math.max(1, Math.round(a.size / 1024))} KB</small>
          </span>
          <Button
            size="small"
            disabled={busy}
            aria-label={`Remove ${a.name}`}
            onClick={() => onChange(attachments.filter((f) => f.id !== a.id))}
          >
            <X size={14} />
          </Button>
        </div>
      ))}
      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
}

export function EvidenceAttachments({
  attachments,
}: {
  attachments: Attachment[];
}) {
  const [selected, setSelected] = useState<Attachment | null>(null);
  return (
    <>
      <h3>Attached evidence</h3>
      {attachments.length ? (
        attachments.map((a) => (
          <button
            className="attachment-row attachment-button"
            key={a.id}
            onClick={() => setSelected(a)}
          >
            <FileText size={18} />
            <span>
              {a.name}
              <small>
                {Math.max(1, Math.round(a.size / 1024))} KB / Open preview
              </small>
            </span>
          </button>
        ))
      ) : (
        <p className="muted">
          No additional files attached. The standard sample evidence below is
          illustrative.
        </p>
      )}
      <WorkspaceDialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{selected?.name}</DialogTitle>
        <DialogContent>
          <pre className="evidence-preview">
            {selected?.content || "No text preview available."}
          </pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close preview</Button>
        </DialogActions>
      </WorkspaceDialog>
    </>
  );
}
