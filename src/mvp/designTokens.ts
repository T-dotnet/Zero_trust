// Shared by MUI and the workspace CSS, including dialogs rendered in portals.
export const colors = {
  ink: "#0a2540",
  body: "#425466",
  muted: "#596b7e",
  line: "#e3e8ef",
  inputBorder: "#bac5d1",
  surface: "#f6f8fb",
  primary: "#635bff",
  primaryDark: "#5147d9",
  primarySoft: "#f0efff",
  primaryBorder: "#dcd9ff",
  success: "#13795b",
  successSoft: "#edf8f3",
  warning: "#946200",
  warningSoft: "#fff7e5",
  error: "#bc3545",
  errorSoft: "#fff0f2",
} as const;

export const fontFamily =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const cssTokens = {
  ...Object.fromEntries(
    Object.entries(colors).map(([key, value]) => [
      `--zt-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
      value,
    ]),
  ),
  "--zt-font": fontFamily,
};
