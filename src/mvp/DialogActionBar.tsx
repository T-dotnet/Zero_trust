import { DialogActions, type DialogActionsProps } from "@mui/material";
import type { ReactNode } from "react";

type Props = DialogActionsProps & { primary?: ReactNode };

/** Keep visual, reading and keyboard order aligned with action priority. */
export function DialogActionBar({
  primary,
  children,
  className = "",
  ...props
}: Props) {
  return (
    <DialogActions
      {...props}
      role="group"
      aria-label="Dialog actions"
      className={`dialog-action-bar ${className}`}
    >
      {primary}
      {children}
    </DialogActions>
  );
}
