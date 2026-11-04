// Shared by MUI and the workspace CSS, including dialogs rendered in portals.
import { colors } from "./palette.mjs";
export { colors };

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
