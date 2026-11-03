import type { Artifact } from "./model";

export interface ArtifactPreview {
  headers: string[];
  labels: string[];
  rows: string[][];
  note: string;
  criteria: string;
}

/** Synthetic fixtures only. Never imply that a model or disclosure scan ran. */
export function artifactPreview(artifact: Artifact): ArtifactPreview {
  const declared = artifact.output?.toLowerCase() || "";
  // Prefer an explicit output contract over the pipeline's historic name.
  const contract =
    declared && !/^processed (dataset|output|data)\b/.test(declared)
      ? declared
      : artifact.name.toLowerCase();
  if (/imaging|metadata/.test(contract))
    return {
      headers: ["record_id", "generalized_site", "acquisition_month"],
      labels: ["Record", "Generalized site", "Acquisition month"],
      rows: [
        ["REC-001", "Site A", "2026-10"],
        ["REC-002", "Site B", "2026-10"],
        ["REC-003", "Site A", "2026-11"],
        ["REC-004", "Site B", "2026-11"],
      ],
      note: "Synthetic imaging-metadata examples. No file metadata was inspected or scrubbed, and no disclosure scan was performed.",
      criteria:
        "Check the sample metadata for unnecessary identifiers and appropriate generalization. These illustrative records do not certify the original images or files.",
    };
  if (/normaliz/.test(contract))
    return {
      headers: ["record_id", "site", "standard_outcome"],
      labels: ["Record", "Site", "Standard outcome"],
      rows: [
        ["REC-001", "A", "Improved"],
        ["REC-002", "B", "Stable"],
        ["REC-003", "A", "Follow-up needed"],
        ["REC-004", "B", "Improved"],
      ],
      note: "Synthetic normalized records only. No transformations or cross-site mapping were executed.",
      criteria:
        "Check the standardized fields and disclosure risks against the declared contract. The sample does not demonstrate actual cross-site normalization.",
    };
  if (/de.?identif|redact|scrub/.test(contract))
    return {
      headers: ["record_id", "processed_text", "risk"],
      labels: ["Record", "Processed text", "Illustrative risk"],
      rows: [
        [
          "REC-001",
          "[PERSON] attended a follow-up visit. Symptoms improved.",
          "Low",
        ],
        ["REC-002", "Medication review completed. [DATE] removed.", "Medium"],
        ["REC-003", "No adverse events reported during this encounter.", "Low"],
        [
          "REC-004",
          "[LOCATION] generalized. Further assessment recommended.",
          "Medium",
        ],
      ],
      note: "Risk labels are illustrative disclosure concerns, not scan results. This prototype does not perform PHI detection or certify de-identification.",
      criteria:
        "Check the sample for residual identifiers, appropriate generalization and consistency with the declared output. A sample cannot establish safety of the full dataset.",
    };
  if (/risk|stratif/.test(contract))
    return {
      headers: ["record_id", "predicted_risk", "example_score"],
      labels: ["Record", "Predicted risk", "Example score"],
      rows: [
        ["REC-001", "Low", "0.12"],
        ["REC-002", "Moderate", "0.46"],
        ["REC-003", "High", "0.78"],
        ["REC-004", "Low", "0.18"],
      ],
      note: "Example risk bands and scores are synthetic. No model was run and these are not clinical predictions.",
      criteria:
        "Check the risk output structure and potential disclosure of sensitive information. Example scores do not establish model quality or clinical validity.",
    };
  if (/classif|outcome|predict/.test(contract))
    return {
      headers: ["record_id", "predicted_outcome", "example_score"],
      labels: ["Record", "Predicted outcome", "Example score"],
      rows: [
        ["REC-001", "Improved", "0.82"],
        ["REC-002", "Stable", "0.71"],
        ["REC-003", "Follow-up needed", "0.64"],
        ["REC-004", "Improved", "0.88"],
      ],
      note: "Example classifications and scores are synthetic. No model was run and these values do not represent clinical predictions.",
      criteria:
        "Check output fields against the declared classification contract and assess whether the sample exposes identifiers or sensitive information. Do not interpret example scores as model quality.",
    };
  if (/transcri|transcript/.test(contract))
    return {
      headers: ["record_id", "transcript"],
      labels: ["Record", "Transcript"],
      rows: [
        ["REC-001", "Synthetic consultation: follow-up planned."],
        ["REC-002", "Synthetic consultation: symptoms reviewed."],
        ["REC-003", "Synthetic consultation: no new concerns."],
        ["REC-004", "Synthetic consultation: care plan discussed."],
      ],
      note: "Synthetic transcript examples only. No audio was processed.",
      criteria:
        "Check the transcript structure and potential disclosure of identifiers. These samples do not demonstrate transcription accuracy.",
    };
  return {
    headers: ["record_id", "example_result"],
    labels: ["Record", "Example result"],
    rows: [
      ["REC-001", "Illustrative result A"],
      ["REC-002", "Illustrative result B"],
      ["REC-003", "Illustrative result C"],
      ["REC-004", "Illustrative result D"],
    ],
    note: "Generic illustrative preview. A synthetic fixture for this output contract has not been defined; this table does not demonstrate the pipeline's actual schema.",
    criteria:
      "Compare the declared output with the available evidence and assess disclosure risks. This generic sample is insufficient to establish contract conformance.",
  };
}
