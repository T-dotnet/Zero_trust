import {
  openDemo,
  closeDemo,
  setDemoRole,
  demoAction,
} from "./mvp-demo-helpers";
import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function role(page: Page, name: string) {
  await setDemoRole(page, name);
}
async function nav(page: Page, name: string) {
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name, exact: true })
    .click();
}
async function simulate(page: Page) {
  await openDemo(page);
  await expect(
    page.getByRole("heading", { name: "Demo controls", exact: true }),
  ).toBeVisible();
}

test("reviewers get their actionable queue and authors see a tracking receipt", async ({
  page,
}) => {
  await page.goto("/");
  await role(page, "Technical reviewer");
  await nav(page, "Approvals");
  await expect(
    page.getByRole("tab", { name: "My tasks 1", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("table", { name: "Approval queue" }).getByRole("row"),
  ).toHaveCount(2);
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Approve review" }),
  ).toBeDisabled();
  await role(page, "Researcher");
  await expect(
    page.getByRole("heading", { name: "Submitted for review", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Approve review" }),
  ).toBeHidden();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(
    page.getByText("No author action is needed while this review is pending."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Switch role",
      exact: true,
    }),
  ).toBeHidden();
});

test("mobile review puts criteria in the first viewport and keeps all four stages discoverable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Patient risk stratification", exact: true })
    .click();
  await role(page, "Technical reviewer");
  await expect(
    page.getByText("Technical review · 2 of 4", { exact: true }),
  ).toBeVisible();
  const criteria = await page
    .getByRole("heading", { name: "Required evidence checks" })
    .boundingBox();
  expect(criteria!.y + criteria!.height).toBeLessThan(844);
  await expect(page.locator(".stage-path")).toBeHidden();
  await page.locator("summary").filter({ hasText: "View all stages" }).click();
  await expect(page.locator(".stage-path li")).toHaveCount(5);
  await page.locator("summary").filter({ hasText: "View all stages" }).click();
  await expect(
    page.getByRole("button", { name: "Approve review" }),
  ).toBeDisabled();
  for (const checkbox of await page.getByRole("checkbox").all())
    await checkbox.check();
  await expect(
    page.getByRole("button", { name: "Approve review" }),
  ).toBeDisabled();
  await page
    .getByLabel("Review comments", { exact: true })
    .fill(
      "Demo exception: supporting evidence must be supplied before pilot use.",
    );
  await expect(
    page.getByRole("button", { name: "Approve review" }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("incomplete named drafts persist and field-specific errors prevent premature submission", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New pipeline", exact: true }).click();
  await page
    .getByRole("textbox", { name: /Pipeline name/ })
    .fill("Incomplete research draft");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Complete your draft", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Complete your draft", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit draft", exact: true }).click();
  await expect(page.getByLabel("Research purpose")).toHaveValue("");
  await page
    .getByLabel("Research purpose")
    .fill("A partially written purpose.");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("button", { name: "Edit draft", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByText("Enter a valid HTTP(S) repository URL.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Repository URL")).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Submit for review", exact: true }),
  ).toBeHidden();
});

test("revision drafts retain requested changes and edits without prematurely resetting reviews", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Patient risk stratification", exact: true })
    .click();
  await role(page, "Technical reviewer");
  await page
    .getByLabel("Review comments", { exact: true })
    .fill("Add a field dictionary and output evidence.");
  await page
    .getByRole("button", { name: "Request changes", exact: true })
    .click();
  await role(page, "Researcher");
  await page
    .getByRole("button", { name: "Revise & resubmit", exact: true })
    .click();
  await expect(page.getByRole("note")).toContainText(
    "Add a field dictionary and output evidence.",
  );
  await page
    .getByLabel("Research purpose")
    .fill("Working revision with a field dictionary.");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("note")).toBeVisible();
  await page
    .getByLabel("Expected output")
    .fill("Reviewed outcome classification (CSV)");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("zero-trust-mvp-v1")!).pipelines.find(
      (p: { id: string }) => p.id === "pipe-2",
    ),
  );
  expect(saved.status).toBe("Changes requested");
  expect(saved.version).toBe("v1.0.0");
  expect(saved.stage).toBe(1);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Author action required", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Revise & resubmit", exact: true })
    .click();
  await expect(page.getByLabel("Research purpose")).toHaveValue(
    "Working revision with a field dictionary.",
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByLabel("Expected output")).toHaveValue(
    "Reviewed outcome classification (CSV)",
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Edit source", exact: true }).click();
  await expect(page.getByLabel("Research purpose")).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Resubmit for review", exact: true })
    .click();
  await expect(
    page.getByText("0 of 4 reviews completed", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".page-heading")).toContainText("v1.0.1");
});

test("simulation controls unblock reviews, execution and output while keeping publication separate", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Adverse event classifier", exact: true })
    .click();
  await openDemo(page);
  await expect(
    page.getByRole("heading", { name: "Demo controls", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Approve stage", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Approve stage",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText(/Waiting for Technical review/)).toBeVisible();
  await page
    .getByRole("button", { name: "Approve remaining", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Publish pipeline",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ready to publish", exact: true }),
  ).toBeVisible();
  const decisions = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("zero-trust-mvp-v1")!)
      .pipelines.find((p: { id: string }) => p.id === "pipe-5")
      .history.filter((event: { title: string }) =>
        /review approved/.test(event.title),
      ),
  );
  expect(decisions).toHaveLength(4);
  expect(
    decisions.every((event: { note: string }) =>
      event.note.includes("Simulated in prototype controls"),
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Publish pipeline", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Configure run", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Source dataset", exact: true })
    .click();
  await page
    .getByRole("option", {
      name: "Clinical notes · November cohort (CSV)",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Start demo run", exact: true })
    .click();
  await simulate(page);
  await page.locator("summary").filter({ hasText: "Execution events" }).click();
  await page
    .getByRole("button", { name: "Complete runs", exact: true })
    .click();
  await page
    .locator("summary")
    .filter({ hasText: "Output validation" })
    .click();
  await page
    .getByRole("combobox", { name: "Demo output", exact: true })
    .click();
  await page
    .getByRole("option", { name: /Adverse event classifier · output/ })
    .click();
  await page
    .getByRole("button", { name: "Accept output", exact: true })
    .click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  const run = page
    .getByRole("table", { name: "Runs", exact: true })
    .getByRole("row")
    .filter({ hasText: "Adverse event classifier" });
  await expect(run).toContainText("Ready to download");
  await run.getByRole("button", { name: "View output", exact: true }).click();
  await expect(
    page.getByRole("columnheader", { name: "Predicted outcome", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText(
    "Acceptance simulated in prototype controls",
  );
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download sample CSV" }).click();
  const download = await downloading;
  const csv = await readFile((await download.path())!, "utf8");
  expect(csv.split(/\r?\n/)[0]).toBe(
    "record_id,predicted_outcome,example_score,run_id,pipeline_version",
  );
  expect(errors).toEqual([]);
});

test("artifact decisions start neutral, expose a readable limitation and record the reviewer", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Runs & results");
  const completed = page.getByRole("row").filter({ hasText: "RUN-1042" });
  await expect(completed).toContainText("Output: Awaiting validation");
  await completed
    .getByRole("button", { name: "View output", exact: true })
    .click();
  await setDemoRole(page, "Privacy reviewer");
  await expect(
    page.getByRole("radio", { name: "Acceptable", exact: true }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("radio", { name: "Not acceptable", exact: true }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("button", { name: "Choose a decision", exact: true }),
  ).toBeDisabled();
  const contrast = await page
    .getByText(/Synthetic sample only\./)
    .evaluate((node) => {
      const rgb = getComputedStyle(node)
        .color.match(/\d+/g)!
        .map(Number)
        .map((value) => {
          const c = value / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
      return (
        1.05 / (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] + 0.05)
      );
    });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  await page.getByRole("radio", { name: "Acceptable", exact: true }).check();
  await page
    .getByRole("button", { name: "Accept output", exact: true })
    .click();
  await expect(page.locator(".validation-receipt")).toContainText(
    "Dr. Olivia Reed",
  );
  await expect(
    page.getByRole("button", { name: "Download sample CSV" }),
  ).toBeEnabled();
  await openDemo(page);
  await expect(
    page.getByRole("heading", { name: "Demo controls", exact: true }),
  ).toBeVisible();
});

test("import discloses a sample but persists only metadata and column names", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Datasets");
  await page
    .getByRole("button", { name: "Import dataset", exact: true })
    .click();
  await demoAction(page, "Use sample");
  await expect(page.locator(".upload-zone")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Replace", exact: true }),
  ).toBeVisible();
  await page
    .locator("summary")
    .filter({ hasText: "Preview columns and sample rows" })
    .click();
  await expect(
    page
      .getByRole("table", { name: "Dataset sample preview" })
      .getByRole("row"),
  ).toHaveCount(4);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Import dataset", exact: true })
    .click();
  const dataset = await page.evaluate(
    () => JSON.parse(localStorage.getItem("zero-trust-mvp-v1")!).datasets[0],
  );
  expect(dataset.columns).toEqual(["record_id", "clinical_note", "visit_date"]);
  expect(dataset.preview).toBeUndefined();
  expect(dataset.content).toBeUndefined();
});

test("activity search and filters keep entity navigation and filtered export usable", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Activity log");
  await page
    .getByRole("textbox", { name: "Search activity..." })
    .fill("Patient risk stratification");
  await expect(page.locator(".history-item")).toHaveCount(2);
  await page
    .locator("summary")
    .filter({ hasText: "Filter by entity, event or date" })
    .click();
  await page.getByRole("combobox", { name: "Event type", exact: true }).click();
  await page.getByRole("option", { name: "Reviews", exact: true }).click();
  await expect(page.locator(".history-item")).toHaveCount(1);
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export history", exact: true })
    .click();
  const result = JSON.parse(
    await readFile((await (await downloading).path())!, "utf8"),
  );
  expect(result.events).toHaveLength(1);
  expect(result.filters.kind).toBe("Reviews");
  await page
    .locator(".history-item")
    .getByRole("button", {
      name: "Patient risk stratification · v1.0.0",
      exact: true,
    })
    .click();
  await expect(page.locator(".page-heading")).toContainText(
    "Patient risk stratification · v1.0.0",
  );
});
