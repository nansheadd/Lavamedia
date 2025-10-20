import { test, expect } from '@playwright/test';

test('homepage has newsletter link', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Rejoindre la newsletter' })).toBeVisible();
});
