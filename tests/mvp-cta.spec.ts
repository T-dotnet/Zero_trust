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

async function primaryFirst(page: Page, name: string) {
  const actions = page
    .getByRole("dialog")
    .getByRole("group", { name: "Dialog actions", exact: true });
  const primary = actions.getByRole("button", { name, exact: true });
  await expect(actions.getByRole("button").first()).toHaveAccessibleName(name);
  await expect(actions.locator(".MuiButton-contained")).toHaveCount(1);
  await expect(primary).toBeInViewport({ ratio: 1 });
  const main = (await primary.boundingBox())!;
  expect(main.height).toBeGreaterThanOrEqual(48);
  for (const action of (await actions.getByRole("button").all()).slice(1)) {
    const bounds = (await action.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(
      page.viewportSize()!.width + 1,
    );
    if (
      page.viewportSize()!.width < 600 ||
      page.viewportSize()!.height >= 480
    ) {
      expect(bounds.y).toBeGreaterThanOrEqual(main.y + main.height);
    } else {
      expect(bounds.y).toBeGreaterThanOrEqual(main.y);
    }
  }
  return { actions, primary };
}

test("form actions put the primary first in layout and keyboard order at every step", async ({
  page,
}) => {
  for (const [width, height] of [
    [320, 640],
    [390, 844],
    [768, 1024],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page
      .getByRole("button", { name: "New pipeline", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Use example", exact: true })
      .click();
    for (const step of [0, 1, 2]) {
      const name = step === 2 ? "Submit for review" : "Continue";
      const { actions, primary } = await primaryFirst(page, name);
      await primary.focus();
      await page.keyboard.press("Tab");
      await expect(
        actions.getByRole("button", { name: "Save draft", exact: true }),
      ).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(
        actions.getByRole("button", {
          name: step === 0 ? "Cancel" : "Back",
          exact: true,
        }),
      ).toBeFocused();
      if (step === 1) {
        const filename =
          "research-evidence-for-the-longitudinal-outcome-classifier-with-a-long-file-name.md";
        await page.locator('input[type="file"]').setInputFiles({
          name: filename,
          mimeType: "text/markdown",
          buffer: Buffer.from("Synthetic review evidence."),
        });
        const remove = page.getByRole("button", {
          name: `Remove ${filename}`,
          exact: true,
        });
        await expect(remove).toBeVisible();
        const bounds = (await remove.boundingBox())!;
        expect(bounds.width).toBeGreaterThanOrEqual(48);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
        const fileText = (await page
          .locator(".attachment-row > span")
          .boundingBox())!;
        expect(fileText.x + fileText.width).toBeLessThanOrEqual(bounds.x);
      }
      if (step < 2) await primary.click();
    }
    await page
      .getByRole("button", { name: "Close pipeline form", exact: true })
      .click();
  }
});

test("output review gives each role a clear primary and keeps recovery actions first", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await nav(page, "Runs & results");
  await page
    .getByRole("row")
    .filter({ hasText: "RUN-1042" })
    .getByRole("button", { name: "View output", exact: true })
    .click();
  let bar = await primaryFirst(page, "Continue as Privacy reviewer");
  await bar.primary.click();
  bar = await primaryFirst(page, "Choose a decision");
  await expect(bar.primary).toBeDisabled();
  await page.getByRole("radio", { name: "Acceptable", exact: true }).check();
  bar = await primaryFirst(page, "Accept output");
  await bar.primary.click();
  bar = await primaryFirst(page, "Download sample CSV");
  await bar.actions.getByRole("button", { name: "Close", exact: true }).click();

  await page
    .getByRole("combobox", { name: "Acting role", exact: true })
    .click();
  await page.getByRole("option", { name: "Researcher", exact: true }).click();
  await page
    .getByRole("row")
    .filter({ hasText: "RUN-1041" })
    .getByRole("button", { name: "Details", exact: true })
    .click();
  bar = await primaryFirst(page, "Retry demo with example mapping");
  await page
    .getByRole("button", { name: "Need help with this run?", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Describe the issue", exact: true })
    .fill("Synthetic demo input could not be mapped.");
  const support = page.locator(".support-actions");
  await expect(support.getByRole("button").first()).toHaveAccessibleName(
    "Create support request",
  );
  const create = (await support
    .getByRole("button", { name: "Create support request", exact: true })
    .boundingBox())!;
  const cancel = (await support
    .getByRole("button", { name: "Cancel", exact: true })
    .boundingBox())!;
  expect(create.y + create.height).toBeLessThanOrEqual(cancel.y);
  await bar.actions.getByRole("button", { name: "Close", exact: true }).click();

  await nav(page, "Datasets");
  await page
    .getByRole("button", { name: "Import dataset", exact: true })
    .click();
  await primaryFirst(page, "Import dataset");
});

test("help and confirmation dialogs retain primary priority with larger text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "20px";
  });
  await page
    .getByRole("button", { name: "Workspace options", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Walkthrough guide", exact: true })
    .click();
  let bar = await primaryFirst(page, "Create a pipeline");
  await bar.actions.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .getByRole("button", { name: "Workspace options", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Reset demo data", exact: true })
    .click();
  bar = await primaryFirst(page, "Reset demo");
  await bar.actions
    .getByRole("button", { name: "Cancel", exact: true })
    .click();

  await page
    .getByRole("combobox", { name: "Acting role", exact: true })
    .click();
  await page
    .getByRole("option", { name: "Technical reviewer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Patient risk stratification", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Review comments", exact: true })
    .fill("The synthetic evidence needs correction.");
  await page
    .getByRole("button", { name: "Reject submission", exact: true })
    .click();
  bar = await primaryFirst(page, "Confirm rejection");
  await bar.actions
    .getByRole("button", { name: "Keep reviewing", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeHidden();
});
