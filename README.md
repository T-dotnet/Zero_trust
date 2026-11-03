# Zero Trust — MVP prototype

An interactive research workspace for datasets, governed pipelines, mandatory multistage approval, simulated execution, and reviewed outputs. Built with React, TypeScript, MUI, and Lucide.

## Run locally

```sh
npm ci
npm run dev
```

Open **http://localhost:3000**. The MVP is the default view; `/?view=full` preserves the original full prototype.

## Try the workflow

1. Import a small CSV or choose the synthetic example.
2. Create a pipeline, define its inputs/outputs, and attach optional evidence.
3. Use the header role selector to complete **Ethical → Technical → Privacy → Security** reviews. Try requesting changes or rejecting a submission with a reason.
4. Switch back to Researcher and publish the approved submission.
5. Start a demo run, inspect its output, and switch to Privacy reviewer to validate it before downloading the sample CSV.

New versions and revisions repeat all four stages. Previous approved versions remain usable. The app also demonstrates drafts, support requests/resolution, cancellation/retry, evidence previews, log export, and activity-history export.

**Prototype boundary:** role switching and processing are local simulations. There is no production authentication, backend execution, PHI detection, or external support integration. Use synthetic data. Dataset file contents are not uploaded; metadata, attached text evidence, and workflow decisions are saved in browser storage.

## Preview

![MVP pipeline catalog](docs/mvp/screenshots/pipelines.png)

![Mandatory pipeline review](docs/mvp/screenshots/approval.png)

## Validate

```sh
npm run lint
npm run build
npm run test:mvp
```

Browser tests use local Chromium. Set `CHROMIUM_PATH` if it is installed somewhere other than `/usr/bin/chromium`. Test output is kept outside the repository under `/tmp/zero-trust-mvp-test-results`.

## Documentation

- [MVP walkthrough and implementation boundaries](docs/mvp/README.md)
- [MVP scope and rationale](docs/mvp-scope.md)
- [Personas, objectives, pains, and gains](docs/personas.md)
- [Full prototype features, settings, and diagrams](docs/README.md)
