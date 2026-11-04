import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const key = "zero-trust-mvp-v1";
async function draft(page: Page, name: string) {
  await page.getByRole("button", { name: "New pipeline", exact: true }).click();
  await page.getByRole("textbox", { name: /Pipeline name/ }).fill(name);
}
async function save(page: Page) {
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Complete your draft", exact: true }),
  ).toBeVisible();
}
async function edit(page: Page, name: string) {
  await page.getByRole("button", { name, exact: true }).click();
  await page
    .getByRole("button", { name: "Edit & submit draft", exact: true })
    .click();
}
async function failSaves(page: Page) {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (
        key === "zero-trust-mvp-v1" &&
        sessionStorage.getItem("fail-saves") === "yes"
      )
        throw new Error("Simulated quota exceeded");
      return original.call(this, key, value);
    };
  });
}

test("simultaneous saves in two tabs preserve both drafts and synchronize their views", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const second = await context.newPage();
  await second.goto("/");
  await Promise.all([
    draft(page, "Tab A research"),
    draft(second, "Tab B research"),
  ]);
  await Promise.all([save(page), save(second)]);
  for (const tab of [page, second]) {
    await tab.reload();
    await expect(
      tab.getByRole("button", { name: "Tab A research", exact: true }),
    ).toBeVisible();
    await expect(
      tab.getByRole("button", { name: "Tab B research", exact: true }),
    ).toBeVisible();
  }
  await second.close();
});

test("stale edits to the same pipeline are kept in the form rather than overwriting a newer save", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await draft(page, "Shared draft");
  await save(page);
  const second = await context.newPage();
  await second.goto("/");
  await edit(second, "Shared draft");
  await page
    .getByRole("button", { name: "Edit & submit draft", exact: true })
    .click();
  await page.getByLabel("Research purpose").fill("First tab saved purpose");
  await second
    .getByLabel("Research purpose")
    .fill("Second tab unsaved purpose");
  await save(page);
  await second.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(second.getByRole("alert")).toContainText(
    "Your edits are still here",
  );
  await expect(second.getByLabel("Research purpose")).toHaveValue(
    "Second tab unsaved purpose",
  );
  const persisted = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(
    persisted.pipelines.find((p: { name: string }) => p.name === "Shared draft")
      .description,
  ).toBe("First tab saved purpose");
  await second.getByRole("button", { name: "Close pipeline form" }).click();
  await second
    .getByRole("button", { name: "Discard changes", exact: true })
    .click();
  await second.close();
});

test("failed saves preserve draft history and retry the complete local state", async ({
  page,
}) => {
  await failSaves(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Pipelines", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => sessionStorage.setItem("fail-saves", "yes"));
  await draft(page, "Session research draft");
  await save(page);
  await expect(
    page.getByText(
      "Browser storage unavailable. Changes last for this session.",
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit & submit draft", exact: true })
    .click();
  await page.getByLabel("Research purpose").fill("Kept across failed saves");
  await page.evaluate(() => sessionStorage.removeItem("fail-saves"));
  await save(page);
  await expect(
    page.getByText("Your work is saved in this browser."),
  ).toBeVisible();
  await page.reload();
  await edit(page, "Session research draft");
  await expect(page.getByLabel("Research purpose")).toHaveValue(
    "Kept across failed saves",
  );
});

test("a remote save during a local storage failure preserves both copies for recovery", async ({
  page,
  context,
}) => {
  await failSaves(page);
  await page.goto("/");
  const second = await context.newPage();
  await second.goto("/");
  await page.evaluate(() => sessionStorage.setItem("fail-saves", "yes"));
  await draft(page, "Unsaved local work");
  await save(page);
  await draft(second, "Saved remote work");
  await save(second);
  await expect(
    page.getByRole("heading", { name: "Your saved workspace needs recovery" }),
  ).toBeVisible();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download recovery copy" }).click();
  const local = JSON.parse(
    await readFile((await (await downloading).path())!, "utf8"),
  );
  expect(
    local.pipelines.some(
      (p: { name: string }) => p.name === "Unsaved local work",
    ),
  ).toBe(true);
  const remote = await second.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(
    remote.pipelines.some(
      (p: { name: string }) => p.name === "Saved remote work",
    ),
  ).toBe(true);
  await page.evaluate(() => sessionStorage.removeItem("fail-saves"));
  await page.getByRole("button", { name: "Load saved workspace" }).click();
  await expect(
    page.getByRole("button", { name: "Saved remote work", exact: true }),
  ).toBeVisible();
  const backups = await page.evaluate(() =>
    Object.keys(localStorage)
      .filter((key) => key.startsWith("zero-trust-mvp-v1-recovery-"))
      .map((key) => localStorage.getItem(key)),
  );
  expect(backups.some((raw) => raw?.includes("Unsaved local work"))).toBe(true);
  await second.close();
});

test("dirty pipeline forms offer save, keep editing and explicit discard on phones and desktop", async ({
  page,
}) => {
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await draft(page, `Protected draft ${width}`);
    await page
      .getByRole("button", { name: "Close pipeline form", exact: true })
      .click();
    const confirmation = page.getByRole("dialog").filter({
      has: page.getByRole("heading", { name: "Save your changes?" }),
    });
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole("button", { name: "Keep editing" }).click();
    await expect(
      page.getByRole("textbox", { name: /Pipeline name/ }),
    ).toHaveValue(`Protected draft ${width}`);
    await page.keyboard.press("Escape");
    await expect(confirmation).toBeVisible();
    await confirmation
      .getByRole("button", { name: "Save draft", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Complete your draft", exact: true }),
    ).toBeVisible();
    await page.reload();
    await draft(page, `Discarded draft ${width}`);
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole("button", { name: "Discard changes" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    const persisted = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      key,
    );
    expect(
      persisted.pipelines.some(
        (p: { name: string }) => p.name === `Protected draft ${width}`,
      ),
    ).toBe(true);
    expect(
      persisted.pipelines.some(
        (p: { name: string }) => p.name === `Discarded draft ${width}`,
      ),
    ).toBe(false);
  }
});

test("support requests record the active reviewer in history and export", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Acting role" }).click();
  await page
    .getByRole("option", { name: "Security reviewer", exact: true })
    .click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Runs & results", exact: true })
    .click();
  await page
    .getByRole("row")
    .filter({ hasText: "RUN-1041" })
    .getByRole("button", { name: "Details", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Need help with this run?", exact: true })
    .click();
  await page.getByLabel("Describe the issue").fill("Review input mapping");
  await page
    .getByRole("button", { name: "Create support request", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Activity log", exact: true })
    .click();
  await expect(
    page.locator(".history-item").filter({ hasText: "Support requested" }),
  ).toContainText("James Wilson");
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export history" }).click();
  const exported = JSON.parse(
    await readFile((await (await downloading).path())!, "utf8"),
  );
  expect(
    exported.events.find(
      (event: { title: string }) => event.title === "Support requested",
    ).actor,
  ).toBe("James Wilson");
});

test("browsers without atomic storage support keep edits in the session without overwriting saved data", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "locks", { value: undefined }),
  );
  await page.goto("/");
  await draft(page, "Session only research");
  await save(page);
  await expect(
    page.getByText(
      "Browser storage unavailable. Changes last for this session.",
    ),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), key),
  ).toBeNull();
});
