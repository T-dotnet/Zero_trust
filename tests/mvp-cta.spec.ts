import {
  openDemo,
  closeDemo,
  setDemoRole,
  demoAction,
} from "./mvp-demo-helpers";
import { test, expect, type Locator, type Page } from "@playwright/test";

async function fullWidth(action: Locator) {
  const bounds = (await action.boundingBox())!;
  const parent = await action.evaluate((element) => {
    const parent = element.parentElement!;
    const style = getComputedStyle(parent);
    return {
      left:
        parent.getBoundingClientRect().left +
        parent.clientLeft +
        parseFloat(style.paddingLeft),
      width:
        parent.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight),
    };
  });
  expect(Math.abs(bounds.x - parent.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(bounds.width - parent.width)).toBeLessThanOrEqual(1);
}

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
  await fullWidth(primary);
  let previousBottom = main.y + main.height;
  for (const action of (await actions.getByRole("button").all()).slice(1)) {
    const bounds = (await action.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(
      page.viewportSize()!.width + 1,
    );
    await fullWidth(action);
    expect(bounds.y).toBeGreaterThanOrEqual(previousBottom);
    previousBottom = bounds.y + bounds.height;
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
    await fullWidth(
      page.getByRole("button", { name: "New pipeline", exact: true }),
    );
    await fullWidth(
      page.getByRole("button", { name: "View approvals", exact: true }),
    );
    await page
      .getByRole("button", { name: "New pipeline", exact: true })
      .click();
    await demoAction(page, "Use example");
    await expect(
      page.getByRole("button", { name: "Use example", exact: true }),
    ).toBeHidden();
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
        await fullWidth(
          page.getByRole("button", { name: "Attach files", exact: true }),
        );
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
    await page
      .getByRole("button", { name: "Discard changes", exact: true })
      .click();
  }
});

test("output review gives each role a clear primary and keeps recovery actions first", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await nav(page, "Runs & results");
  for (const action of await page
    .getByRole("row")
    .filter({ hasText: "RUN-1042" })
    .locator(".mobile-card-actions .MuiButton-root")
    .all())
    await fullWidth(action);
  await page
    .getByRole("row")
    .filter({ hasText: "RUN-1042" })
    .getByRole("button", { name: "View output", exact: true })
    .click();
  let bar = await primaryFirst(page, "Close");
  await setDemoRole(page, "Privacy reviewer");
  bar = await primaryFirst(page, "Choose a decision");
  await expect(bar.primary).toBeDisabled();
  await page.getByRole("radio", { name: "Acceptable", exact: true }).check();
  bar = await primaryFirst(page, "Accept output");
  await bar.primary.click();
  bar = await primaryFirst(page, "Download sample CSV");
  await bar.actions.getByRole("button", { name: "Close", exact: true }).click();

  await setDemoRole(page, "Researcher");
  await page
    .getByRole("row")
    .filter({ hasText: "RUN-1041" })
    .getByRole("button", { name: "Details", exact: true })
    .click();
  bar = await primaryFirst(page, "Configure retry");
  await page.getByRole("button", { name: "Get help", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Describe the issue", exact: true })
    .fill("Synthetic demo input could not be mapped.");
  const support = page.locator(".support-actions");
  for (const action of await support.getByRole("button").all())
    await fullWidth(action);
  await expect(support.getByRole("button").first()).toHaveAccessibleName(
    "Create request",
  );
  const create = (await support
    .getByRole("button", { name: "Create request", exact: true })
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
  await demoAction(page, "Walkthrough guide");
  let bar = await primaryFirst(page, "Create a pipeline");
  await bar.actions.getByRole("button", { name: "Close", exact: true }).click();
  await demoAction(page, "Reset demo data");
  bar = await primaryFirst(page, "Reset demo");
  await bar.actions
    .getByRole("button", { name: "Cancel", exact: true })
    .click();

  await setDemoRole(page, "Technical reviewer");
  await page
    .getByRole("button", { name: "Patient risk stratification", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Review comments", exact: true })
    .fill("The synthetic evidence needs correction.");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  bar = await primaryFirst(page, "Confirm rejection");
  await bar.actions
    .getByRole("button", { name: "Keep reviewing", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeHidden();
});
