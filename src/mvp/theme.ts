import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#214b3e", dark: "#15392d", light: "#edf4f2" },
    secondary: { main: "#536477" },
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: "#171b1a", secondary: "#626966" },
    divider: "#d2d6d3",
    success: { main: "#299643", light: "#e9f7eb" },
    warning: { main: "#b47715", light: "#fff5df" },
    error: { main: "#c54646", light: "#fff0ef" },
  },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
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
    body2: { fontSize: 13, lineHeight: 1.5 },
  },
  shape: { borderRadius: 5 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 38, paddingInline: 18 },
        sizeSmall: { minHeight: 30, fontSize: 12, paddingInline: 12 },
        outlined: { borderColor: "#b6c8bd" },
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
      styleOverrides: { indicator: { height: 3 }, root: { minHeight: 49 } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "#d5d9d6", fontSize: 13 },
        head: {
          backgroundColor: "#ffffff",
          color: "#171b1a",
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
        notchedOutline: { borderColor: "#b9c0bc" },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 5 } } },
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
      styleOverrides: {
        root: { padding: "18px 24px", borderTop: "1px solid #e4eaf0", gap: 8 },
      },
    },
    MuiChip: {
      styleOverrides: { root: { height: 25, borderRadius: 5, fontSize: 12 } },
    },
    MuiAlert: { styleOverrides: { root: { fontSize: 13, borderRadius: 5 } } },
  },
});
