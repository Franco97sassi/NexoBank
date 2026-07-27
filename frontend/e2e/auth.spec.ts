import { expect, test } from '@playwright/test';

test('a visitor can navigate between login and registration', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  await page.getByRole('link', { name: 'Crear una cuenta' }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible();
});
