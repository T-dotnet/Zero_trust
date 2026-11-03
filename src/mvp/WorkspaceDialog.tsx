import { Dialog, useMediaQuery, type DialogProps } from "@mui/material";

/** Give task flows the available screen on phones and in short mobile windows. */
export function WorkspaceDialog({ className = "", ...props }: DialogProps) {
  const compact = useMediaQuery(
    "(max-width: 599px), (max-width: 900px) and (max-height: 479px)",
  );
  return (
    <Dialog
      {...props}
      fullScreen={compact || props.fullScreen}
      className={`workspace-dialog ${className}`}
    />
  );
}
