import type { Run } from "./model";
export function downloadText(
  filename: string,
  content: string,
  type = "text/plain;charset=utf-8",
) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadRunLog(run: Run) {
  downloadText(
    `${run.id.toLowerCase()}-demo.log`,
    [
      `ZERO TRUST / DEMO EXECUTION LOG`,
      `Run: ${run.id}`,
      `Pipeline: ${run.pipelineName} ${run.version}`,
      `Dataset: ${run.datasetName}`,
      `Started: ${run.date}`,
      `Status: ${run.status}`,
      `Progress: ${run.progress}%`,
      run.error ? `Error: ${run.error}` : "",
      run.artifactId ? `Output: ${run.artifactId}` : "",
      "This log describes a local simulation. No pipeline code executed on a backend.",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}
