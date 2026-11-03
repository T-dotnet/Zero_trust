# Diagram sources and SVG exports

[Documentation home](../README.md) · [User flows](../user-flows.md)

Ten diagrams accompany the product documentation: an overview, a settings/feature relationship diagram, and journeys J1–J8. They are lightweight flowcharts, not formal UML or verified models of a production runtime.

The Mermaid blocks in the parent Markdown documents are authoritative. Each matching `.mmd` file is an editable copy; each `.svg` is its rendered export. Adjacent prose/numbered steps provide the text equivalent. Diagrams use labels and line styles rather than color alone; dotted edges explicitly identify intended outcomes without a verified backend implementation.

| Diagram | Editable source | Rendered SVG | Context |
| --- | --- | --- | --- |
| Product workflow | [Mermaid](product-workflow.mmd) | [SVG](product-workflow.svg) | [Overview](../README.md#product-workflow) |
| Settings and Features | [Mermaid](settings-and-features.mmd) | [SVG](settings-and-features.svg) | [Shared toggle state](../settings-and-feature-toggles.md#how-settings-and-features-relate) |
| J1 Import and queue | [Mermaid](j1.mmd) | [SVG](j1.svg) | [Flow](../user-flows.md#j1-import-data-and-queue-an-approved-pipeline) |
| J2 Readiness and build | [Mermaid](j2.mmd) | [SVG](j2.svg) | [Flow and current blocking limit](../user-flows.md#j2-create-a-custom-pipeline-and-confirm-a-build) |
| J3 Dry-run and submit | [Mermaid](j3.mmd) | [SVG](j3.svg) | [Flow](../user-flows.md#j3-dry-run-and-submit-a-draft) |
| J4 Review and publish | [Mermaid](j4.mmd) | [SVG](j4.svg) | [Flow](../user-flows.md#j4-review-revise-and-publish-a-pipeline) |
| J5 Artifact review/export | [Mermaid](j5.mmd) | [SVG](j5.svg) | [Flow](../user-flows.md#j5-inspect-validate-or-review-an-artifact) |
| J6 Failure and support | [Mermaid](j6.mmd) | [SVG](j6.svg) | [Flow](../user-flows.md#j6-diagnose-a-failure-and-coordinate-support) |
| J7 Container inspection | [Mermaid](j7.mmd) | [SVG](j7.svg) | [Flow](../user-flows.md#j7-inspect-container-risk-and-usage) |
| J8 Update/bug fix | [Mermaid](j8.mmd) | [SVG](j8.svg) | [Flow](../user-flows.md#j8-submit-an-update-or-bug-fix) |

## Regeneration

Reviewed source: repository commit `b6be833`; documentation completed 2026-11-03. Exports were rendered with **Mermaid 11.17.2** in Chromium, using the neutral theme, Arial/sans-serif, linear edges, and `htmlLabels: false`. Diagram titles and descriptions are included through Mermaid's `accTitle` / `accDescr`.

After changing a diagram, copy the complete Mermaid block from Markdown into its matching `.mmd`, then render it to `.svg`. For example, with Mermaid CLI installed in your documentation tooling:

```sh
mmdc --input docs/diagrams/j2.mmd --output docs/diagrams/j2.svg --theme neutral --backgroundColor white --configFile /path/to/mermaid-config.json
```

Use this configuration to match the exports:

```json
{
  "theme": "neutral",
  "fontFamily": "Arial, sans-serif",
  "flowchart": { "htmlLabels": false, "curve": "linear" }
}
```

The CLI needs a working Chromium/Puppeteer setup. If its local `file:` navigation is unavailable, the same Mermaid renderer can run on a locally served HTML page. Do not change browser security policies just to export a diagram.

## Validation performed

- All ten sources parsed and rendered successfully with Mermaid.
- Exported SVGs contain accessible titles/descriptions and nonempty view boxes.
- The J2 branching and J4 review diagrams were visually inspected for legibility and clipping.
- Feature IDs/titles were compared with all 59 seeded `INITIAL_FEATURES` entries.
- Local file links, heading targets, and source line references were checked.

This validation checks documentation and diagram rendering. It does not validate live execution, authorization, scanning, privacy protection, or persistence.
