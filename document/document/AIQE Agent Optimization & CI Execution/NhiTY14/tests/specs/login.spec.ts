import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('valid user can sign in and reach the dashboard', async ({ page }) => {
  const username = process.env.ORANGEHRM_USERNAME;
  const password = process.env.ORANGEHRM_PASSWORD;
  test.skip(!username || !password, 'Set ORANGEHRM_USERNAME and ORANGEHRM_PASSWORD in .env');

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(username!, password!);

  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

