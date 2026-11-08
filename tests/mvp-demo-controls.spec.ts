import { test, expect } from "@playwright/test";
import {
  openDemo,
  closeDemo,
  demoAction,
  setDemoRole,
} from "./mvp-demo-helpers";

for (const width of [390, 1440]) {
  test(`demo tools stay behind one floating launcher and retain task context at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Pipelines", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Acting role" }),
    ).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Demo mode", exact: true }),
    ).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Walkthrough guide" }),
    ).toBeHidden();
    const launcher = page.getByRole("button", {
      name: "Open demo controls",
      exact: true,
    });
    await expect(launcher).toHaveCount(1);
    await expect(launcher).toBeInViewport({ ratio: 1 });
    const box = (await launcher.boundingBox())!;
    expect(box.x).toBeGreaterThan(width - 90);
    expect(box.y).toBeGreaterThan(800);
    await openDemo(page);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Demo controls", exact: true }),
    ).toBeHidden();
    await expect(launcher).toBeFocused();

    await page
      .getByRole("button", { name: "New pipeline", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: /Pipeline name/ })
      .fill("Keep my unfinished method");
    await expect(
      page.getByRole("button", { name: "Use example", exact: true }),
    ).toBeHidden();
    const form = page.getByRole("dialog");
    const before = await form
      .getByRole("textbox", { name: /Pipeline name/ })
      .inputValue();
    const panel = await openDemo(page);
    await expect(
      panel.getByRole("combobox", { name: "Jump to screen" }),
    ).toBeDisabled();
    await expect(
      panel.getByRole("button", { name: "Walkthrough guide", exact: true }),
    ).toBeDisabled();
    await closeDemo(page);
    await expect(
      page.getByRole("textbox", { name: /Pipeline name/ }),
    ).toHaveValue(before);
    await expect(launcher).toBeFocused();
    if (width < 600) {
      const fab = (await launcher.boundingBox())!;
      const footer = (await page
        .getByRole("group", { name: "Dialog actions" })
        .boundingBox())!;
      expect(fab.y + fab.height).toBeLessThanOrEqual(footer.y);
    }
    await demoAction(page, "Reset demo data");
    await expect(
      page.getByRole("heading", { name: "Reset demo workspace?" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(
      page.getByRole("textbox", { name: /Pipeline name/ }),
    ).toHaveValue(before);
    await demoAction(page, "Use example");
    await expect(
      page.getByRole("textbox", { name: /Pipeline name/ }),
    ).toHaveValue("Longitudinal outcome classifier");
    expect(errors).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("demo role switching stays outside output review and keeps the same record open", async ({
  page,
}) => {
  await page.goto("/?page=runs&tab=results&output=artifact-1");
  await expect(
    page.getByRole("button", { name: "Switch role", exact: true }),
  ).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Download sample CSV", exact: true }),
  ).toBeDisabled();
  await setDemoRole(page, "Privacy reviewer");
  await page
    .getByLabel("Validation comments", { exact: true })
    .fill("Keep this assessment while exploring demo tools.");
  await openDemo(page);
  await closeDemo(page);
  await expect(
    page.getByLabel("Validation comments", { exact: true }),
  ).toHaveValue("Keep this assessment while exploring demo tools.");
  expect(new URL(page.url()).searchParams.get("output")).toBe("artifact-1");
  await page.getByRole("radio", { name: "Acceptable", exact: true }).check();
  await page
    .getByRole("button", { name: "Accept output", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Download sample CSV", exact: true }),
  ).toBeEnabled();
});

test("demo navigation and reset are available in the panel with explicit reset confirmation", async ({
  page,
}) => {
  await page.goto("/");
  const panel = await openDemo(page);
  await panel
    .getByRole("combobox", { name: "Jump to screen", exact: true })
    .click();
  await page.getByRole("option", { name: "Datasets", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Datasets", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Import dataset", exact: true })
    .click();
  await demoAction(page, "Use sample");
  await expect(
    page.getByText("synthetic-clinical-records.csv", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Import dataset", exact: true })
    .click();
  await demoAction(page, "Reset demo data");
  await expect(
    page.getByRole("heading", { name: "Reset demo workspace?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Clinical research · Demo cohort",
      exact: true,
    }),
  ).toBeVisible();
});
