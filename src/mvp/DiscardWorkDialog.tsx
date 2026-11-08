import { Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { DialogActionBar } from "./DialogActionBar";

export function DiscardWorkDialog({
  open,
  onKeep,
  onDiscard,
}: {
  open: boolean;
  onKeep: () => void;
  onDiscard: () => void;
}) {
  return (
    <Dialog open={open} onClose={onKeep} maxWidth="xs" fullWidth>
      <DialogTitle>Discard this import?</DialogTitle>
      <DialogContent>
        Your selected file and entered details have not been imported. Keep
        editing, or explicitly discard them.
      </DialogContent>
      <DialogActionBar
        primary={
          <Button variant="contained" onClick={onKeep}>
            Keep editing
          </Button>
        }
      >
        <Button color="error" onClick={onDiscard}>
          Discard import
        </Button>
      </DialogActionBar>
    </Dialog>
  );
}
