import { test, expect } from '@playwright/test';

for (const width of [390, 1280]) {
  test(`roadmap and its flow/journey links work at ${width}px without a delivery timeline`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/mvp-flows.html#screen=S14&journey=F04');
    await expect(page).toHaveTitle('Zero Trust MVP · Screen & flow atlas');
    await expect(page.locator('#roadmap-flow')).toContainText('Assigned work and notifications');
    await page.locator('#roadmap-flow').getByRole('link', { name: /Assigned work and notifications/ }).click();
    await expect(page).toHaveURL(/post-mvp-roadmap\.html#feature-1$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('post MVP product roadmap');
    await expect(page.locator('tr[id^="feature-"]')).toHaveCount(10);
    expect(await page.locator('main').innerText()).not.toMatch(/\b(?:weeks?|months?|quarters?)\b/i);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('navigation', { name: 'Document resources' }).getByRole('link', { name: 'Customer journey', exact: true }).click();
    await expect(page).toHaveTitle('Zero Trust MVP · Customer journey');
    await expect(page.locator('#J03 .stage-roadmap')).toContainText('Assigned work and notifications');
    await expect(page.locator('#roadmap-summary')).toContainText('R2 Reproducible self-service');
    await expect(page.getByRole('link', { name: 'Product roadmap', exact: true })).toHaveAttribute('href', 'post-mvp-roadmap.html');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto('/mvp-flows.html#screen=S43&journey=F13');
    await expect(page.locator('#screen-title')).toHaveText('Your saved workspace needs recovery');
    await expect(page.locator('#roadmap-flow')).toContainText('G0 pilot gates');
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
