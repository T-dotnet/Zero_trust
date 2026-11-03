import { test, expect, type Page } from "@playwright/test";

async function nav(page: Page, name: string) {
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name, exact: true })
    .click();
  await expect(page.locator(".MuiDrawer-root")).toBeHidden();
}
async function simulation(page: Page) {
  await page
    .getByRole("button", { name: "Workspace options", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Simulation controls", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Simulation controls", exact: true }),
  ).toBeVisible();
}
const fontSize = (locator: ReturnType<Page["locator"]>) =>
  locator.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));

test("phone and portrait tablet lists use readable cards with visible touch actions", async ({
  page,
}) => {
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(
      await fontSize(page.locator(".page-heading p")),
    ).toBeGreaterThanOrEqual(16);
    expect(
      await fontSize(page.locator(".metrics-row span").first()),
    ).toBeGreaterThanOrEqual(14);
    expect(
      await fontSize(page.locator(".name-cell .entity-name").first()),
    ).toBeGreaterThanOrEqual(18);
    expect(
      await fontSize(page.locator(".name-cell p").first()),
    ).toBeGreaterThanOrEqual(14);
    expect(
      await fontSize(page.locator(".status-label").first()),
    ).toBeGreaterThanOrEqual(14);
    expect(
      await fontSize(
        page.getByRole("textbox", { name: "Search pipelines..." }),
      ),
    ).toBeGreaterThanOrEqual(16);
    const search = await page
      .getByRole("textbox", { name: "Search pipelines..." })
      .boundingBox();
    expect(search!.height).toBeGreaterThanOrEqual(44);
    for (const name of [
      "Pipelines",
      "Datasets",
      "Runs & results",
      "Approvals",
    ]) {
      await nav(page, name);
      const table = page.locator(".mobile-card-table");
      await expect(table.locator("tbody")).toHaveCSS("display", "grid");
      const bounds = await table.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      const action = table.locator(".mobile-card-actions button").first();
      const target = await action.boundingBox();
      expect(target!.height).toBeGreaterThanOrEqual(44);
      expect(target!.x + target!.width).toBeLessThanOrEqual(width);
      expect(await fontSize(action)).toBeGreaterThanOrEqual(15);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${name} at ${width}px`,
      ).toBe(true);
    }
  }
});

test("phone forms and output samples remain readable without horizontal scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "New pipeline", exact: true }).click();
  await page.getByRole("button", { name: "Use example", exact: true }).click();
  expect(
    await fontSize(page.getByLabel("Repository URL")),
  ).toBeGreaterThanOrEqual(16);
  expect(
    await fontSize(page.getByLabel("Research purpose")),
  ).toBeGreaterThanOrEqual(16);
  const next = await page
    .getByRole("button", { name: "Continue", exact: true })
    .boundingBox();
  expect(next!.height).toBeGreaterThanOrEqual(44);
  expect(next!.x + next!.width).toBeLessThanOrEqual(320);
  expect(
    await page
      .getByRole("dialog")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Close pipeline form", exact: true })
    .click();
  await nav(page, "Runs & results");
  await page
    .getByRole("row")
    .filter({ hasText: "RUN-1042" })
    .getByRole("button", { name: "View output", exact: true })
    .click();
  const preview = page.getByRole("table", {
    name: "Synthetic output preview",
    exact: true,
  });
  await expect(preview.locator("tbody")).toHaveCSS("display", "grid");
  expect(
    await fontSize(preview.locator('td[data-label="Processed text"]').first()),
  ).toBeGreaterThanOrEqual(16);
  expect(
    await preview.evaluate(
      (element) => element.scrollWidth <= element.parentElement!.clientWidth,
    ),
  ).toBe(true);
  expect(
    await page
      .getByRole("dialog")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
});

test("the complete solo walkthrough works with the mobile menu, larger controls and output cards", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "New pipeline", exact: true }).click();
  await page.getByRole("button", { name: "Use example", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Submit for review", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Submitted for review", exact: true }),
  ).toBeVisible();
  await simulation(page);
  await page
    .getByRole("button", { name: "Simulate remaining reviews", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Return to prototype", exact: true })
    .click();
  await expect(
    page.getByText("4 of 4 reviews completed", { exact: true }),
  ).toBeVisible();
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
  const run = page
    .getByRole("table", { name: "Runs", exact: true })
    .getByRole("row")
    .filter({ hasText: "Longitudinal outcome classifier" });
  await expect(
    run.getByRole("button", { name: "View output", exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await run.getByRole("button", { name: "View output", exact: true }).click();
  await page
    .getByRole("button", { name: "Continue as Privacy reviewer", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Choose a decision", exact: true }),
  ).toBeDisabled();
  await page.getByRole("radio", { name: "Acceptable", exact: true }).check();
  await page
    .getByRole("button", { name: "Accept output", exact: true })
    .click();
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download sample CSV", exact: true })
    .click();
  expect((await downloading).suggestedFilename()).toContain("sample.csv");
  expect(
    await page
      .getByRole("dialog")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  expect(errors).toEqual([]);
});
