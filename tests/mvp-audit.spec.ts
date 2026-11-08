import {
  openDemo,
  closeDemo,
  setDemoRole,
  demoAction,
} from "./mvp-demo-helpers";
import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { parseDatasetCsv } from "../src/mvp/csv";

async function nav(page: Page, name: string) {
  await expect(page.locator("h1")).toBeVisible();
  const menu = page.getByRole("button", { name: "Open navigation" });
  const mobile = await menu.isVisible();
  if (mobile) await menu.click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name, exact: true })
    .click();
  if (mobile) await expect(page.locator(".MuiDrawer-root")).toBeHidden();
}
async function role(page: Page, name: string) {
  await setDemoRole(page, name);
}

test("invalid replacement file clears the previous valid import", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Datasets");
  await page
    .getByRole("button", { name: "Import dataset", exact: true })
    .click();
  await demoAction(page, "Use sample");
  const submit = page
    .getByRole("dialog")
    .getByRole("button", { name: "Import dataset", exact: true });
  await expect(submit).toBeEnabled();
  await page.locator("input[type=file]").setInputFiles({
    name: "invalid.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("header only"),
  });
  await expect(page.getByRole("alert")).toContainText("header");
  await expect(submit).toBeDisabled();
});

test("quoted multiline CSV records are counted correctly and invalid rows are rejected", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Datasets");
  await page
    .getByRole("button", { name: "Import dataset", exact: true })
    .click();
  const input = page.locator("input[type=file]");
  await input.setInputFiles({
    name: "multiline.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      'id,note\n1,"first line\nsecond line"\n2,"another note"\n',
    ),
  });
  await expect(
    page.getByText("2 records / 1 KB", { exact: true }),
  ).toBeVisible();
  await input.setInputFiles({
    name: "bad-columns.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("id,note\n1,first,unexpected\n"),
  });
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: "Import dataset", exact: true }),
  ).toBeDisabled();
});

test("missing processing requirements block submission", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New pipeline", exact: true }).click();
  await demoAction(page, "Use example");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Input specification").fill(" ");
  await page.getByLabel("Expected output").fill("");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("alert")
      .filter({ hasText: "Define both" }),
  ).toContainText("input");
  await expect(
    page.getByRole("button", { name: "Submit for review", exact: true }),
  ).toBeHidden();
});

test("new versions never reuse a reserved version number", async ({ page }) => {
  await page.goto("/");
  for (const expected of ["v2.2.0", "v2.3.0"]) {
    await nav(page, "Pipelines");
    const approved = page.getByRole("row").filter({ hasText: "v2.1.0" });
    await approved
      .getByRole("button", {
        name: "Clinical note de-identification",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: "New version" }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page
      .getByRole("button", { name: "Submit for review", exact: true })
      .click();
    await expect(
      page
        .locator(".page-heading")
        .getByText(`Clinical note de-identification · ${expected}`, {
          exact: true,
        }),
    ).toBeVisible();
  }
});

test("damaged saved data is preserved until explicit recovery and reset", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Pipelines", exact: true }),
  ).toBeVisible();
  const damaged = '{"schema":1,"datasets":[{"name":"Keep this original"}]}';
  await page.evaluate(
    (raw) => localStorage.setItem("zero-trust-mvp-v1", raw),
    damaged,
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your saved workspace needs recovery" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("zero-trust-mvp-v1")),
  ).toBe(damaged);
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download recovery copy" }).click();
  const download = await downloading;
  expect(await readFile((await download.path())!, "utf8")).toBe(damaged);
  await page.getByRole("button", { name: "Reset workspace" }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("zero-trust-mvp-v1")),
  ).toBe(damaged);
  await page.getByRole("button", { name: "Reset workspace" }).click();
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Pipelines", exact: true }),
  ).toBeVisible();
  const backups = await page.evaluate(() =>
    Object.keys(localStorage)
      .filter((key) => key.startsWith("zero-trust-mvp-v1-recovery-"))
      .map((key) => localStorage.getItem(key)),
  );
  expect(backups).toContain(damaged);
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Clinical note de-identification",
      exact: true,
    }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("drafts retain requirements and attachments across editing and reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New pipeline", exact: true }).click();
  await demoAction(page, "Use example");
  await page.locator("summary").filter({ hasText: "Source settings" }).click();
  await page.getByLabel("Branch or tag").fill("release/audit");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Expected output").fill("Audited outcome data (CSV)");
  await page.locator("input[type=file]").setInputFiles({
    name: "evidence.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("Evidence retained through draft and revision."),
  });
  await expect(
    page.getByRole("button", { name: "Remove evidence.md" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Complete your draft", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Complete your draft", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit draft", exact: true }).click();
  await expect(page.getByLabel("Branch or tag")).toHaveValue("release/audit");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByLabel("Expected output")).toHaveValue(
    "Audited outcome data (CSV)",
  );
  await expect(
    page.getByRole("button", { name: "Remove evidence.md" }),
  ).toBeVisible();
});

test("reviewers cannot approve out of order and rejection needs a reason", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Adverse event classifier", exact: true })
    .click();
  await role(page, "Security reviewer");
  await expect(
    page.getByRole("button", { name: "Approve review" }),
  ).toBeHidden();
  await role(page, "Ethical reviewer");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(
    page.getByText("Add a comment explaining what needs to change."),
  ).toBeVisible();
  await page
    .getByLabel("Review comments", { exact: true })
    .fill("Clarify consent scope.");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(
    page.getByText("Clarify consent scope.", { exact: true }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Confirm rejection", exact: true })
    .click();
  await role(page, "Researcher");
  await page
    .getByRole("button", { name: "Revise & resubmit", exact: true })
    .click();
  await page
    .getByLabel("Repository URL")
    .fill("https://github.com/research/revised");
  await page.locator("summary").filter({ hasText: "Source settings" }).click();
  await page.getByLabel("Branch or tag").fill("fix/consent");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Input specification").fill("Revised CSV input");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Resubmit for review", exact: true })
    .click();
  await page
    .locator("summary")
    .filter({ hasText: "Source and version" })
    .click();
  await expect(page.getByText("fix/consent", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Revised CSV input", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".page-heading")
      .getByText("Adverse event classifier · v0.2.1", { exact: true }),
  ).toBeVisible();
});

test("catalog filters, empty states, details, and guide cancel actions work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Approved 2", exact: true }).click();
  await expect(
    page
      .getByRole("table", { name: "Pipelines", exact: true })
      .getByRole("row"),
  ).toHaveCount(3);
  await page
    .getByRole("textbox", { name: "Search pipelines..." })
    .fill("nothing matches");
  await expect(
    page.getByRole("heading", { name: "No matching pipelines" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(
    page
      .getByRole("table", { name: "Pipelines", exact: true })
      .getByRole("row"),
  ).toHaveCount(7);
  await nav(page, "Datasets");
  await page
    .getByRole("button", {
      name: "Clinical notes · November cohort",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toContainText("1,248");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await demoAction(page, "Walkthrough guide");
  await expect(
    page.getByRole("heading", { name: "Explore the MVP" }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
});

test("validated CSV download has a standard header, sample records, and provenance", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Runs & results");
  await page.getByRole("tab", { name: "Results 1", exact: true }).click();
  await page
    .getByRole("button", { name: "De-identified clinical notes", exact: true })
    .click();
  await setDemoRole(page, "Privacy reviewer");
  await page.getByRole("radio", { name: "Acceptable", exact: true }).check();
  await page.getByRole("button", { name: "Accept output" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download sample CSV" }).click();
  const file = await download;
  const contents = await readFile((await file.path())!, "utf8");
  expect(contents.split(/\r?\n/)[0]).toBe(
    "record_id,processed_text,risk,run_id,pipeline_version",
  );
  expect(parseDatasetCsv(contents).rows).toBe(4);
  expect(contents).toContain("RUN-1042");
  expect(contents).toContain("v2.1.0");
});

test("incompatible dataset formats and non-researcher creation are blocked", async ({
  page,
}) => {
  await page.goto("/");
  await role(page, "Privacy reviewer");
  await expect(
    page.getByRole("button", { name: "New pipeline", exact: true }),
  ).toBeHidden();
  await page
    .getByRole("button", { name: "View my tasks", exact: true })
    .click();
  await expect(
    page.getByRole("tab", { name: "My tasks 1", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await nav(page, "Datasets");
  await expect(
    page.getByRole("button", { name: "Import dataset", exact: true }),
  ).toBeDisabled();
  await role(page, "Researcher");
  await nav(page, "Pipelines");
  await page
    .getByRole("row")
    .filter({ hasText: "Audio transcription" })
    .getByRole("button", { name: "Run", exact: true })
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
  await expect(
    page.getByRole("button", { name: "Start demo run" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("alert").filter({ hasText: "does not match" }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Source dataset", exact: true })
    .click();
  await page
    .getByRole("option", {
      name: "Consultation audio · Sample set (WAV)",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "Start demo run" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
});

test("evidence limits, removal, same-file reattachment, and cancel do not leak drafts", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New pipeline", exact: true }).click();
  await demoAction(page, "Use example");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const input = page.locator("input[type=file]");
  await input.setInputFiles({
    name: "too-large.md",
    mimeType: "text/markdown",
    buffer: Buffer.alloc(50_001, "x"),
  });
  await expect(
    page.getByRole("alert").filter({ hasText: "under 50 KB" }),
  ).toBeVisible();
  const file = {
    name: "same.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("Retained evidence."),
  };
  await input.setInputFiles(file);
  await page.getByRole("button", { name: "Remove same.md" }).click();
  await input.setInputFiles(file);
  await expect(
    page.getByRole("button", { name: "Remove same.md" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Attach files", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Discard changes", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(
    page.getByRole("tab", { name: "All pipelines 6", exact: true }),
  ).toBeVisible();
});

test("running jobs survive reload and produce exactly one output", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("row")
    .filter({ hasText: "Clinical note de-identification" })
    .getByRole("button", { name: "Run", exact: true })
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
  await page.getByRole("button", { name: "Start demo run" }).click();
  await expect(
    page.getByRole("table", { name: "Runs", exact: true }),
  ).toContainText("Running");
  await page.reload();
  await nav(page, "Runs & results");
  await expect(
    page
      .getByRole("table", { name: "Runs", exact: true })
      .getByRole("row")
      .filter({ hasText: "Running" }),
  ).toHaveCount(0, { timeout: 15_000 });
  await page.getByRole("tab", { name: "Results 2", exact: true }).click();
  await expect(
    page.getByRole("table", { name: "Results", exact: true }).getByRole("row"),
  ).toHaveCount(3);
});

test("storage warnings recover after a later successful save", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    let remainingFailures = 1;
    Storage.prototype.setItem = function (key, value) {
      if (remainingFailures > 0 && key === "zero-trust-mvp-v1") {
        remainingFailures -= 1;
        throw new Error("Simulated storage quota");
      }
      return original.call(this, key, value);
    };
  });
  await page.goto("/");
  await expect(
    page.getByText(
      "Browser storage unavailable. Changes last for this session.",
    ),
  ).toBeVisible();
  await nav(page, "Datasets");
  await page
    .getByRole("button", { name: "Import dataset", exact: true })
    .click();
  await demoAction(page, "Use sample");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Import dataset", exact: true })
    .click();
  await expect(
    page.getByText("Your work is saved in this browser."),
  ).toBeVisible();
});

test("all six screens fit narrow phone and tablet widths", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 360, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    for (const name of [
      "Overview",
      "Datasets",
      "Pipelines",
      "Runs & results",
      "Approvals",
      "Activity log",
    ]) {
      await nav(page, name);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${name} overflow at ${width}px`,
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
