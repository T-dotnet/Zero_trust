import { expect, type Page } from "@playwright/test";

export async function openDemo(page: Page) {
  const panel = page.getByRole("dialog", {
    name: "Demo controls",
    exact: true,
  });
  if (!(await panel.isVisible())) {
    await page
      .getByRole("button", { name: "Open demo controls", exact: true })
      .click();
  }
  await expect(panel).toBeVisible();
  return panel;
}

export async function closeDemo(page: Page) {
  const panel = page.getByRole("dialog", {
    name: "Demo controls",
    exact: true,
  });
  await panel
    .getByRole("button", { name: "Close demo controls", exact: true })
    .click();
  await expect(panel).toBeHidden();
}

export async function setDemoRole(page: Page, name: string) {
  const panel = await openDemo(page);
  await panel
    .getByRole("combobox", { name: "Acting role", exact: true })
    .click();
  await page.getByRole("option", { name, exact: true }).click();
  await expect(page.getByRole("listbox")).toBeHidden();
  await closeDemo(page);
}

export async function demoAction(page: Page, name: string) {
  const panel = await openDemo(page);
  await panel.getByRole("button", { name, exact: true }).click();
  await expect(panel).toBeHidden();
}
