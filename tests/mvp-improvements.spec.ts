import {
  openDemo,
  closeDemo,
  setDemoRole,
  demoAction,
} from "./mvp-demo-helpers";
import { test, expect, type Page } from "@playwright/test";

async function role(page: Page, name: string) {
  await setDemoRole(page, name);
}
async function nav(page: Page, name: string) {
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name, exact: true })
    .click();
}
async function review(page: Page) {
  await page
    .getByRole("button", { name: "Patient risk stratification", exact: true })
    .click();
  await role(page, "Technical reviewer");
}

test("unavailable draft storage retains notes in memory and warns even after navigating away", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("zero-trust-draft-v1:"))
        throw new Error("Draft storage unavailable");
      return original.call(this, key, value);
    };
  });
  await page.goto("/");
  await review(page);
  await page
    .getByLabel("Review comments", { exact: true })
    .fill("Retain these notes when draft storage fails.");
  await expect(
    page.getByRole("status").filter({ hasText: "Notes kept in memory" }),
  ).toBeVisible();
  await nav(page, "Pipelines");
  expect(
    await page.evaluate(() => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    }),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Patient risk stratification", exact: true })
    .click();
  await expect(page.getByLabel("Review comments", { exact: true })).toHaveValue(
    "Retain these notes when draft storage fails.",
  );
});

test("review notes survive navigation and refresh, remain role scoped, and never restore evidence acknowledgments", async ({
  page,
}) => {
  await page.goto("/");
  await review(page);
  const notes =
    "Check the output schema and record why the consent boundary applies.";
  await page.getByLabel("Review comments", { exact: true }).fill(notes);
  await page.getByRole("checkbox").first().check();
  await nav(page, "Pipelines");
  await page
    .getByRole("button", { name: "Patient risk stratification", exact: true })
    .click();
  await expect(page.getByLabel("Review comments", { exact: true })).toHaveValue(
    notes,
  );
  await expect(page.getByRole("checkbox", { checked: true })).toHaveCount(0);
  await role(page, "Researcher");
  await expect(
    page.getByLabel("Review comments", { exact: true }),
  ).toBeHidden();
  await role(page, "Technical reviewer");
  await expect(page.getByLabel("Review comments", { exact: true })).toHaveValue(
    notes,
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Pipeline review", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Review comments", { exact: true })).toHaveValue(
    notes,
  );
  await expect(page.getByRole("checkbox", { checked: true })).toHaveCount(0);
  await openDemo(page);
  await expect(page.getByRole("combobox", { name: "Acting role" })).toHaveText(
    "Technical reviewer",
  );
  await closeDemo(page);
});

test("closing an output keeps its assessment draft without recording a decision", async ({
  page,
}) => {
  await page.goto(
    "/?page=runs&tab=results&output=artifact-1&role=Privacy+reviewer",
  );
  await page
    .getByLabel("Validation comments", { exact: true })
    .fill("Inspect residual identifiers before accepting this sample.");
  await page.getByRole("radio", { name: "Acceptable", exact: true }).check();
  const url = page.url();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page
    .getByRole("button", { name: "De-identified clinical notes", exact: true })
    .click();
  await expect(
    page.getByLabel("Validation comments", { exact: true }),
  ).toHaveValue("Inspect residual identifiers before accepting this sample.");
  await expect(
    page.getByRole("radio", { name: "Acceptable", exact: true }),
  ).toBeChecked();
  await page.reload();
  expect(Object.fromEntries(new URL(page.url()).searchParams)).toEqual(
    Object.fromEntries(new URL(url).searchParams),
  );
  await expect(
    page.getByLabel("Validation comments", { exact: true }),
  ).toHaveValue("Inspect residual identifiers before accepting this sample.");
  const statuses = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("zero-trust-mvp-v1")!).artifacts.map(
      (a: { status: string }) => a.status,
    ),
  );
  expect(statuses).toContain("Pending review");
  await expect(
    page.getByRole("button", { name: "Download sample CSV", exact: true }),
  ).toBeDisabled();
});

test("Escape and Cancel protect a selected import until explicit discard", async ({
  page,
}) => {
  await page.goto("/?page=datasets");
  await page
    .getByRole("button", { name: "Import dataset", exact: true })
    .click();
  await demoAction(page, "Use sample");
  await page
    .getByRole("textbox", { name: /Dataset name/ })
    .fill("Protected study notes");
  await page
    .getByRole("textbox", { name: "Description", exact: true })
    .fill("Keep the study context and the selected sample.");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Discard this import?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  await expect(page.getByRole("textbox", { name: /Dataset name/ })).toHaveValue(
    "Protected study notes",
  );
  await expect(
    page.getByText("synthetic-clinical-records.csv", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page
    .getByRole("button", { name: "Discard import", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("record URLs retain role and filter context through refresh, sharing and Back", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByPlaceholder("Search pipelines...").fill("Patient");
  await page
    .getByRole("button", { name: "Patient risk stratification", exact: true })
    .click();
  await role(page, "Technical reviewer");
  const url = page.url();
  expect(new URL(url).searchParams.get("pipeline")).toBe("pipe-2");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Pipeline review", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Patient risk stratification · Zero Trust");
  const second = await context.newPage();
  await second.goto(url);
  await expect(
    second.getByRole("heading", { name: "Technical review", exact: true }),
  ).toBeVisible();
  await second.close();
  await page.goBack(); // acting-role change
  await page.goBack(); // selected record
  await expect(
    page.getByRole("heading", { name: "Pipelines", exact: true }),
  ).toBeVisible();
  await expect(page.getByPlaceholder("Search pipelines...")).toHaveValue(
    "Patient",
  );
  await page.goForward();
  await expect(
    page.getByRole("heading", { name: "Pipeline review", exact: true }),
  ).toBeVisible();
  await page.goto("/?page=approvals&pipeline=missing-record");
  await expect(
    page.getByRole("heading", { name: "Record unavailable" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "View approvals", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Approvals", exact: true }),
  ).toBeVisible();
});

test("same-format data with missing declared fields cannot start a demo run", async ({
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
      name: "Patient outcomes · Site A (CSV)",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("CSV format matches", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Missing required columns: clinical_note" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start demo run", exact: true }),
  ).toBeDisabled();
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
    page.getByText("Required columns present", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start demo run", exact: true }),
  ).toBeEnabled();
});

test("review sources are inspectable and missing evidence needs a recorded demo rationale", async ({
  page,
}) => {
  await page.goto("/");
  await review(page);
  for (const checkbox of await page.getByRole("checkbox").all())
    await checkbox.check();
  await expect(
    page.getByRole("button", { name: "Approve review", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", {
      name: "View evidence for Sample execution results are reviewed",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Evidence not supplied");
  await page
    .getByRole("button", { name: "Return to review", exact: true })
    .click();
  await page
    .getByLabel("Review comments", { exact: true })
    .fill(
      "Demo exception only: execution evidence still needs to be supplied for a pilot.",
    );
  await page
    .getByRole("button", { name: "Approve review", exact: true })
    .click();
  await expect(
    page.getByText("Privacy review · 3 of 4", { exact: true }),
  ).toBeVisible();
  const note = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("zero-trust-mvp-v1")!).pipelines.find(
        (p: { id: string }) => p.id === "pipe-2",
      ).history[0].note,
  );
  expect(note).toContain("Evidence basis · v1.0.0");
  expect(note).toContain("Demo exception");
  expect(note).toContain("Input/output contract");
});

test("repairing input creates a distinct run and preserves the failed attempt", async ({
  page,
}) => {
  await page.goto("/?page=runs");
  await page
    .getByRole("row")
    .filter({ hasText: "RUN-1041" })
    .getByRole("button", { name: "Fix input", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "New attempt after RUN-1041",
  );
  await expect(
    page.getByRole("button", { name: "Start demo run", exact: true }),
  ).toBeDisabled();
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
  await expect(
    page.getByRole("heading", { name: "Runs & results", exact: true }),
  ).toBeVisible();
  const runs = await page.evaluate(
    () => JSON.parse(localStorage.getItem("zero-trust-mvp-v1")!).runs,
  );
  expect(runs.find((r: { id: string }) => r.id === "RUN-1041").status).toBe(
    "Failed",
  );
  const retry = runs.find(
    (r: { retryOf?: string }) => r.retryOf === "RUN-1041",
  );
  expect(retry.id).not.toBe("RUN-1041");
  expect(retry.datasetId).toBe("data-1");
});

test("invalid dates explain the problem and block export without losing other filters", async ({
  page,
}) => {
  await page.goto("/?page=activity&search=Clinical");
  await page
    .locator("summary")
    .filter({ hasText: "Filter by entity, event or date" })
    .click();
  await page.getByLabel("From date", { exact: true }).fill("2026-11-09");
  await page.getByLabel("To date", { exact: true }).fill("2026-11-01");
  await expect(page.getByRole("alert")).toContainText(
    "end date is before the start date",
  );
  await expect(
    page.getByRole("button", { name: "Export history", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("heading", { name: "No matching activity" }),
  ).toBeHidden();
  await page.reload();
  await expect(page.getByPlaceholder("Search activity...")).toHaveValue(
    "Clinical",
  );
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByLabel("From date", { exact: true }).fill("2026-11-01");
  await page.getByLabel("To date", { exact: true }).fill("2026-11-09");
  await expect(
    page.getByRole("button", { name: "Export history", exact: true }),
  ).toBeEnabled();
  await expect(page.getByPlaceholder("Search activity...")).toHaveValue(
    "Clinical",
  );
});

test("mobile catalogue reaches the first record action while keeping the summary available", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".catalog-summary")).not.toHaveAttribute(
    "open",
    "",
  );
  await expect(
    page
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: "Run", exact: true }),
  ).toBeInViewport({ ratio: 1 });
  await page.locator(".catalog-summary summary").click();
  await expect(
    page.getByText("Total pipelines", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("skip link and navigation orient keyboard users, and neutral input boundaries retain contrast", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Pipelines", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to workspace" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#workspace-main")).toBeFocused();
  await nav(page, "Datasets");
  await expect(
    page.getByRole("heading", { name: "Datasets", exact: true }),
  ).toBeFocused();
  await expect(page).toHaveTitle("Datasets · Zero Trust");
  await page
    .getByRole("button", { name: "Import dataset", exact: true })
    .click();
  const ratio = await page
    .getByRole("dialog")
    .locator(".MuiOutlinedInput-notchedOutline")
    .first()
    .evaluate((element) => {
      const channels = getComputedStyle(element)
        .borderColor.match(/\d+/g)!
        .slice(0, 3)
        .map(Number)
        .map((c) => c / 255)
        .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
      return (
        1.05 /
        (channels[0] * 0.2126 +
          channels[1] * 0.7152 +
          channels[2] * 0.0722 +
          0.05)
      );
    });
  expect(ratio).toBeGreaterThanOrEqual(3);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Import dataset", exact: true }),
  ).toBeFocused();
});
