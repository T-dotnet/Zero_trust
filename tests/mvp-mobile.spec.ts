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
  await page
    .getByRole("button", { name: "Discard changes", exact: true })
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
    .getByRole("button", { name: "Approve remaining", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Done", exact: true })
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
  for (const label of ["Approved pipeline", "Source dataset"]) {
    const selection = page.getByRole("combobox", { name: label, exact: true });
    expect(
      await selection.evaluate(
        (element) =>
          element.scrollWidth <= element.clientWidth &&
          element.scrollHeight <= element.clientHeight,
      ),
    ).toBe(true);
  }
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
    .getByRole("button", { name: "Switch role", exact: true })
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

test("phone filters expose every status and preserve selections when the layout changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/");
  const status = page.getByRole("combobox", {
    name: "Pipeline status",
    exact: true,
  });
  await status.click();
  await page.getByRole("option", { name: "Approved 2", exact: true }).click();
  const rows = page
    .getByRole("table", { name: "Pipelines", exact: true })
    .locator("tbody tr");
  await expect(rows).toHaveCount(2);
  await page
    .getByRole("button", { name: "Filter pipelines by category", exact: true })
    .click();
  await page
    .getByRole("menuitemradio", { name: "Privacy", exact: true })
    .click();
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText("Clinical note de-identification");
  await expect(
    page.getByRole("button", {
      name: "Clear category filter: Privacy",
      exact: true,
    }),
  ).toBeVisible();

  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(
    page.getByRole("tab", { name: "Approved 2", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("combobox", { name: "Pipeline category", exact: true }),
  ).toHaveText("Privacy");
  await expect(rows).toHaveCount(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(status).toHaveText("Approved 2");
  await page
    .getByRole("button", {
      name: "Clear category filter: Privacy",
      exact: true,
    })
    .click();
  await expect(rows).toHaveCount(2);
  await status.click();
  await page
    .getByRole("option", { name: "All pipelines 6", exact: true })
    .click();
  await expect(rows).toHaveCount(6);
  await status.click();
  await page
    .getByRole("option", { name: "Needs your action 0", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "No matching pipelines", exact: true }),
  ).toBeVisible();
});

test("cards and controls adapt to narrower windows and larger reading text", async ({
  page,
}) => {
  await page.goto("/");
  for (const [width, columns] of [
    [600, 1],
    [768, 2],
  ]) {
    await page.setViewportSize({ width, height: 1024 });
    const cards = page.locator(".mobile-card-table tbody tr");
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    if (columns === 1) expect(second!.x).toBe(first!.x);
    else expect(second!.x).toBeGreaterThan(first!.x + first!.width);
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "20px";
  });
  expect(
    await fontSize(page.locator(".page-heading p")),
  ).toBeGreaterThanOrEqual(20);
  await page.getByRole("combobox", { name: "Acting role" }).click();
  await page
    .getByRole("option", { name: "Technical reviewer", exact: true })
    .click();
  const roleLabel = page.locator(".role-select .MuiSelect-select");
  expect(
    await roleLabel.evaluate(
      (element) =>
        element.scrollWidth <= element.clientWidth &&
        element.scrollHeight <= element.clientHeight,
    ),
  ).toBe(true);

  for (const screen of [
    "Overview",
    "Datasets",
    "Pipelines",
    "Runs & results",
    "Approvals",
    "Activity log",
  ]) {
    await nav(page, screen);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      screen,
    ).toBe(true);
    const menu = await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .boundingBox();
    expect(menu!.width).toBeGreaterThanOrEqual(48);
    expect(menu!.height).toBeGreaterThanOrEqual(48);
    for (const tab of await page.getByRole("tab").all()) {
      const bounds = await tab.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    }
  }
  await nav(page, "Overview");
  const metrics = page.locator(".overview-metrics > button");
  expect((await metrics.nth(2).boundingBox())!.y).toBeGreaterThan(
    (await metrics.nth(0).boundingBox())!.y,
  );
  await nav(page, "Approvals");
  await page.getByRole("button", { name: "Review", exact: true }).click();
  for (const checkbox of await page.getByRole("checkbox").all())
    await checkbox.check();
  await page.getByLabel("Review comments", { exact: true }).fill("Demo exception: evidence must be supplied before pilot use.");
  await page
    .getByRole("button", { name: "Approve review", exact: true })
    .click();
  const notification = page.locator(".MuiSnackbar-root");
  await expect(notification).toBeVisible();
  const header = await page.locator(".utility-bar").boundingBox();
  expect((await notification.boundingBox())!.y).toBeGreaterThanOrEqual(
    header!.y + header!.height,
  );
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Close navigation", exact: true })
    .click();
  await expect(page.locator(".MuiDrawer-root")).toBeHidden();
});

test("task forms use the available viewport and keep content separate from footer actions", async ({
  page,
}) => {
  for (const [width, height] of [
    [320, 640],
    [390, 480],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : height });
    await page.goto("/");
    await page
      .getByRole("button", { name: "New pipeline", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Use example", exact: true })
      .click();
    if (width === 390) {
      await page.getByLabel("Research purpose").focus();
      await page.setViewportSize({ width: 844, height: 390 });
      await expect(page.getByLabel("Pipeline name")).toHaveValue(
        "Longitudinal outcome classifier",
      );
      await page.setViewportSize({ width, height });
    }
    const dialog = page.getByRole("dialog");
    const bounds = await dialog.boundingBox();
    expect(bounds!.width).toBe(width);
    expect(bounds!.height).toBe(height);
    for (const step of [1, 2, 3]) {
      await expect(
        page.getByText(`Step ${step} of 3`, { exact: true }),
      ).toBeVisible();
      const content = dialog.locator(".MuiDialogContent-root");
      const footer = dialog.locator(".MuiDialogActions-root");
      expect(
        (await content.boundingBox())!.y +
          (await content.boundingBox())!.height,
      ).toBeLessThanOrEqual((await footer.boundingBox())!.y);
      const primary = footer.locator(".MuiButton-contained");
      await expect(primary).toBeInViewport({ ratio: 1 });
      const target = await primary.boundingBox();
      expect(target!.height).toBeGreaterThanOrEqual(48);
      expect(target!.x + target!.width).toBeLessThanOrEqual(width);
      expect(
        await dialog.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      ).toBe(true);
      if (step < 3) {
        await content.evaluate((element) => {
          element.scrollTop = element.scrollHeight;
        });
        await primary.click();
        await expect(content).toHaveJSProperty("scrollTop", 0);
      }
    }
    await page
      .getByRole("button", { name: "Close pipeline form", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Discard changes", exact: true })
      .click();
  }
});

test("opening a record and navigating from long lists starts at the new screen heading", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Imaging metadata scrubber", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Pipeline review", exact: true }),
  ).toBeInViewport({ ratio: 1 });
  await expect(
    page.getByRole("button", { name: "Back to approvals", exact: true }),
  ).toBeInViewport({ ratio: 1 });
  await nav(page, "Pipelines");
  await page
    .getByRole("button", { name: "Imaging metadata scrubber", exact: true })
    .scrollIntoViewIfNeeded();
  await nav(page, "Datasets");
  await expect(
    page.getByRole("heading", { name: "Datasets", exact: true }),
  ).toBeInViewport({ ratio: 1 });
});
