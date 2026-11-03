import { test, expect, type Page } from "@playwright/test";

async function role(page: Page, name: string) {
  await page.getByRole("combobox", { name: "Acting role" }).click();
  await page.getByRole("option", { name, exact: true }).click();
  await expect(page.getByRole("listbox")).toBeHidden();
}
test("new pipeline passes all four reviews, publishes, runs, and produces a validated download", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle("Zero Trust — Research Workspace");
  await page.getByRole("button", { name: "New pipeline", exact: true }).click();
  await page.getByRole("button", { name: "Use example" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Submit for review", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Ethical review", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Approve ethical review" }),
  ).toBeDisabled();
  for (const stage of ["Ethical", "Technical", "Privacy", "Security"]) {
    await role(page, `${stage} reviewer`);
    await page
      .getByRole("button", {
        name: `Approve ${stage.toLowerCase()} review`,
        exact: true,
      })
      .click();
    await expect(
      page.getByText(
        "Confirm all three review evidence items before approving.",
      ),
    ).toBeVisible();
    for (const check of await page.getByRole("checkbox").all())
      await check.check();
    await page
      .getByLabel("Review comments", { exact: true })
      .fill(`${stage} evidence reviewed.`);
    await page
      .getByRole("button", {
        name: `Approve ${stage.toLowerCase()} review`,
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Ready to publish", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Publish pipeline", exact: true }),
  ).toBeHidden();
  await role(page, "Researcher");
  await page
    .getByRole("button", { name: "Publish pipeline", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Configure run", exact: true })
    .click();
  await page.getByLabel("Source dataset", { exact: true }).click();
  await page
    .getByRole("option", {
      name: "Clinical notes · November cohort (CSV)",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Start demo run", exact: true })
    .click();
  const row = page.getByRole("row").filter({
    has: page.getByText("Longitudinal outcome classifier", { exact: true }),
  });
  await expect(row.getByText("Completed", { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await row.getByRole("button", { name: "Details", exact: true }).click();
  await page
    .getByRole("button", { name: "Inspect output", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Download sample CSV" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Switch role", exact: true }).click();
  await page
    .getByLabel("Validation comments")
    .fill("Sample reviewed and accepted.");
  await page.getByRole("button", { name: "Submit validation" }).click();
  await expect(
    page.getByRole("button", { name: "Download sample CSV" }),
  ).toBeEnabled();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download sample CSV" }).click();
  expect((await download).suggestedFilename()).toContain("sample.csv");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Longitudinal outcome classifier",
      exact: true,
    }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("feedback requires a comment and revised pipeline restarts the four-stage path", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Patient risk stratification", exact: true })
    .click();
  await role(page, "Technical reviewer");
  await page
    .getByRole("button", { name: "Request changes", exact: true })
    .click();
  await expect(
    page.getByText("Add a comment explaining what needs to change."),
  ).toBeVisible();
  await page
    .getByLabel("Review comments", { exact: true })
    .fill("Document the output schema.");
  await page
    .getByRole("button", { name: "Request changes", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Author action required" }),
  ).toBeVisible();
  await role(page, "Researcher");
  await page
    .getByRole("button", { name: "Revise & resubmit", exact: true })
    .click();
  await page
    .getByLabel("Research purpose")
    .fill("Updated purpose with explicit output schema.");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Resubmit for review", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Ethical review", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".page-heading")
      .getByText("Patient risk stratification · v1.0.1", { exact: true }),
  ).toBeVisible();
});

test("mobile navigation, dataset import, search, and reset work without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Pipelines", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Datasets", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Import dataset", exact: true })
    .click();
  await page.getByRole("button", { name: "Use synthetic example" }).click();
  await page.getByLabel("Dataset name").fill("MVP imported cohort");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Import dataset", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search datasets..." })
    .fill("MVP imported");
  await expect(
    page.getByRole("button", { name: "MVP imported cohort", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Workspace options" }).click();
  await page.getByRole("menuitem", { name: "Reset demo data" }).click();
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Pipelines", exact: true }),
  ).toBeVisible();
});

test("new versions retain the approved version and expose attached evidence to reviewers", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Clinical note de-identification",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Submit new version" }).click();
  await page
    .getByLabel("Research purpose")
    .fill("Updated de-identification with explicit validation evidence.");
  await page.getByLabel("Branch or tag").fill("release/v2.2");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Expected output")
    .fill("Validated synthetic notes (CSV)");
  await page.locator("input[type=file]").setInputFiles({
    name: "validation-evidence.md",
    mimeType: "text/markdown",
    buffer: Buffer.from(
      "# Validation evidence\nSynthetic schema and output checked.",
    ),
  });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Submit for review", exact: true })
    .click();
  await expect(
    page
      .locator(".page-heading")
      .getByText("Clinical note de-identification · v2.2.0", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Ethical review", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Evidence", exact: true }).click();
  await page.getByRole("button", { name: /validation-evidence.md/ }).click();
  await expect(
    page.getByText("Synthetic schema and output checked.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close preview" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Pipelines", exact: true })
    .click();
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: "v2.1.0" })
      .getByRole("button", { name: "Run", exact: true }),
  ).toBeVisible();
});

test("failed run support can be resolved and logs exported before retry and cancellation", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Runs & results", exact: true })
    .click();
  await page
    .getByRole("row")
    .filter({ hasText: "RUN-1041" })
    .getByRole("button", { name: "Details", exact: true })
    .click();
  await page.getByRole("button", { name: "Need help with this run?" }).click();
  await page
    .getByLabel("Describe the issue")
    .fill("Please check the input mapping.");
  await page.getByRole("button", { name: "Create support request" }).click();
  await page
    .getByRole("button", { name: "Switch to technical support role" })
    .click();
  await page
    .getByLabel("Resolution notes")
    .fill("Demo input mapping confirmed.");
  await page.getByRole("button", { name: "Mark resolved" }).click();
  await expect(
    page.getByText("Resolution: Demo input mapping confirmed."),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export log" }).click();
  expect((await download).suggestedFilename()).toBe("run-1041-demo.log");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await role(page, "Researcher");
  await page
    .getByRole("row")
    .filter({ hasText: "RUN-1041" })
    .getByRole("button", { name: "Details", exact: true })
    .click();
  await page.getByRole("button", { name: "Correct mapping & retry" }).click();
  await page.getByRole("button", { name: "Cancel run", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Restart demo run" }),
  ).toBeVisible();
});

test("unacceptable outputs require a reason and remain blocked from download; decisions export in activity history", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Runs & results", exact: true })
    .click();
  await page.getByRole("tab", { name: "Results 1", exact: true }).click();
  await page
    .getByRole("button", { name: "De-identified clinical notes", exact: true })
    .click();
  await page.getByRole("button", { name: "Switch role", exact: true }).click();
  await page
    .getByRole("radio", { name: "Not acceptable", exact: true })
    .check();
  await page.getByRole("button", { name: "Submit validation" }).click();
  await expect(
    page.getByText("Explain why this output is not acceptable."),
  ).toBeVisible();
  await page
    .getByLabel("Validation comments")
    .fill("Residual identifiers require another processing pass.");
  await page.getByRole("button", { name: "Submit validation" }).click();
  await expect(
    page.getByRole("button", { name: "Download sample CSV" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Residual identifiers require another processing pass.", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Activity log", exact: true })
    .click();
  await expect(
    page.getByText("Artifact marked not acceptable", { exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export history" }).click();
  expect((await download).suggestedFilename()).toBe("zero-trust-activity.json");
});
