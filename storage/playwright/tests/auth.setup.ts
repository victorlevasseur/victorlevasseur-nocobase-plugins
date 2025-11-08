import { expect, test as setup } from '@playwright/test';

// Sauvegarder l'état de connexion pour éviter de se connecter à chaque test
setup('admin', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username/Email').click();
  await page.getByPlaceholder('Username/Email').fill('admin@nocobase.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByTestId('user-center-button')).toBeVisible();

  // Activer le mode configuration/design
  await page.evaluate(() => {
    localStorage.setItem('NOCOBASE_DESIGNABLE', 'true');
  });
  await page.context().storageState({
    path: process.env.PLAYWRIGHT_AUTH_FILE,
  });
});
