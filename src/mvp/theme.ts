import { createTheme } from "@mui/material/styles";
import { colors, cssTokens, fontFamily } from "./designTokens";

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
      light: colors.primarySoft,
    },
    secondary: { main: colors.body },
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: colors.ink, secondary: colors.muted },
    divider: colors.line,
    success: { main: colors.success, light: colors.successSoft },
    warning: { main: colors.warning, light: colors.warningSoft },
    error: { main: colors.error, light: colors.errorSoft },
  },
  typography: {
    fontFamily,
    fontSize: 14,
    h1: {
      fontSize: 50,
      fontWeight: 700,
      letterSpacing: "-2.3px",
      lineHeight: 1.2,
    },
    h2: { fontSize: 24, fontWeight: 700, letterSpacing: "-.6px" },
    h3: { fontSize: 19, fontWeight: 700, letterSpacing: "-.35px" },
    button: { textTransform: "none", fontWeight: 600, fontSize: 14 },
    body2: { fontSize: 14, lineHeight: 1.6 },
  },
  shape: { borderRadius: 7 },
  components: {
    MuiCssBaseline: { styleOverrides: { ":root": cssTokens } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 42, paddingInline: 18, letterSpacing: "-.1px" },
        sizeSmall: { minHeight: 34, fontSize: 13, paddingInline: 12 },
        outlined: {
          borderColor: colors.inputBorder,
          color: colors.ink,
          "&:hover": {
            borderColor: colors.primary,
            background: colors.primarySoft,
          },
        },
      },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          minHeight: 49,
          fontWeight: 500,
          fontSize: 14,
          paddingInline: 22,
        },
      },
    },
    MuiTabs: {
      styleOverrides: { indicator: { height: 2 }, root: { minHeight: 49 } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: colors.line, fontSize: 14 },
        head: {
          backgroundColor: "#ffffff",
          color: colors.muted,
          fontSize: 12,
          fontWeight: 600,
          paddingBlock: 12,
        },
        body: { paddingBlock: 16 },
      },
    },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { background: "#fff", fontSize: 14 },
        notchedOutline: { borderColor: colors.inputBorder },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12, boxShadow: "0 24px 80px #0a254029" },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-.4px",
          padding: "24px 24px 12px",
        },
      },
    },
    MuiDialogActions: {
      defaultProps: { disableSpacing: true },
      styleOverrides: {
        root: {
          padding: "18px 24px",
          borderTop: `1px solid ${colors.line}`,
          gap: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { height: 27, borderRadius: 6, fontSize: 12 } },
    },
    MuiAlert: { styleOverrides: { root: { fontSize: 14, borderRadius: 8 } } },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: `1px solid ${colors.line}`,
          boxShadow: "0 8px 30px #0a254014",
        },
      },
    },
  },
});
