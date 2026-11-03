import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const App = lazy(() =>
  new URLSearchParams(window.location.search).get("view") === "full"
    ? import("./App.tsx")
    : import("./mvp/MvpApp.tsx"),
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense
      fallback={
        <div style={{ padding: 32, fontFamily: "Arial, sans-serif" }}>
          Loading workspace…
        </div>
      }
    >
      <App />
    </Suspense>
  </StrictMode>,
);
