import { createTheme } from "@mui/material/styles";
import { colors, cssTokens, fontFamily } from "./designTokens";

export const theme = createTheme({
  palette: {
    primary: {
      // Small text, form states and selection controls use accessible green.
      main: colors.primaryDark,
      dark: colors.primaryDeep,
      light: colors.primary,
      contrastText: "#ffffff",
    },
    secondary: { main: colors.body },
    action: { active: colors.body },
    info: { main: colors.primaryDark, light: colors.primarySoft },
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
    MuiCssBaseline: { styleOverrides: { ":root": cssTokens, ":focus-visible": { outline: `2px solid ${colors.focus}`, outlineOffset: 3 } } },
    MuiButtonBase: {
      styleOverrides: {
        root: { "&.Mui-focusVisible": { outline: `2px solid ${colors.focus}`, outlineOffset: 3 } },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 42, paddingInline: 18, letterSpacing: "-.1px" },
        sizeSmall: { minHeight: 34, fontSize: 13, paddingInline: 12 },
        contained: ({ ownerState }) => ({
          ...(ownerState.color === "primary" && {
            backgroundColor: colors.primary,
            color: colors.ink,
            "&:hover": { backgroundColor: colors.primaryHover },
          }),
          ...(ownerState.color === "error" && {
            backgroundColor: colors.errorAccent,
            color: colors.ink,
            "&:hover": { backgroundColor: colors.errorHover },
          }),
          "&.Mui-disabled": {
            backgroundColor: colors.line,
            color: colors.muted,
          },
        }),
        outlined: ({ ownerState }) => ({
          borderColor: colors.inputBorder,
          color: ownerState.color === "error" ? colors.error : colors.primaryDark,
          "&:hover": {
            borderColor: ownerState.color === "error" ? colors.error : colors.primaryDark,
            background: ownerState.color === "error" ? colors.errorSoft : colors.primarySoft,
          },
        }),
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
    MuiInputBase: {
      styleOverrides: {
        input: { "&::placeholder": { color: colors.muted, opacity: 1 } },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { background: "#fff", fontSize: 14 },
        notchedOutline: { borderColor: colors.inputBorder },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12, boxShadow: "0 24px 80px #18212f29" },
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
    MuiAlert: {
      styleOverrides: {
        root: { fontSize: 14, borderRadius: 8 },
        standard: ({ ownerState }) => {
          const tone = ownerState.severity === "warning"
            ? { backgroundColor: colors.warningSoft, color: colors.warning }
            : ownerState.severity === "error"
              ? { backgroundColor: colors.errorSoft, color: colors.error }
              : ownerState.severity === "success"
                ? { backgroundColor: colors.successSoft, color: colors.success }
                : { backgroundColor: colors.primarySoft, color: colors.ink };
          return { ...tone, "& .MuiAlert-icon": { color: ownerState.severity === "info" ? colors.primaryDark : tone.color } };
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: `1px solid ${colors.line}`,
          boxShadow: "0 8px 30px #18212f14",
        },
      },
    },
  },
});
