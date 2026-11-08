import { useState } from "react";
import { Alert, Button, TextField } from "@mui/material";
import { type Role, type Run } from "./model";
import { Status } from "./ui";
export function RunSupport({
  run,
  role,
  onReport,
  onResolve,
}: {
  run: Run;
  role: Role;
  onReport: (message: string) => void;
  onResolve: (resolution: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  if (run.support)
    return (
      <section className="support-block">
        <div className="section-title">
          <h3>Support request</h3>
          <Status
            kind={run.support.status === "Resolved" ? "success" : "warning"}
          >
            {run.support.status}
          </Status>
        </div>
        <span className="mono">{run.support.id}</span>
        <p>{run.support.message}</p>
        {run.support.status === "Resolved" ? (
          <div className="decision-note">
            Resolution: {run.support.resolution}
          </div>
        ) : role === "Technical reviewer" ? (
          <>
            <TextField
              label="Resolution notes"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
            <Button
              variant="outlined"
              disabled={!message.trim()}
              onClick={() => onResolve(message)}
            >
              Mark resolved
            </Button>
          </>
        ) : (
          <p className="muted">
            A Technical reviewer can resolve this support request.
          </p>
        )}
        <p className="micro-copy">
          Local demo request. No message is sent to an external team.
        </p>
      </section>
    );
  return (
    <section className={`support-block ${open ? "" : "is-collapsed"}`}>
      {open ? (
        <>
          <h3>Request support</h3>
          <TextField
            label="Describe the issue"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What happened, and what did you expect?"
            multiline
            minRows={2}
            fullWidth
          />
          <div className="support-actions">
            <Button
              variant="contained"
              disabled={!message.trim()}
              onClick={() => {
                onReport(message);
                setMessage("");
              }}
            >
              Create request
            </Button>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </div>
          <p className="micro-copy">
            Saved locally for the demo. Nothing is sent externally.
          </p>
        </>
      ) : (
        <Button variant="text" onClick={() => setOpen(true)}>
          Get help
        </Button>
      )}
    </section>
  );
}
