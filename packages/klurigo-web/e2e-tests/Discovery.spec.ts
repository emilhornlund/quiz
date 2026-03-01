import { expect, test } from '@playwright/test'

test.describe('Discovery', () => {
  test('/discover renders the discovery rails page after login', async ({
    page,
  }) => {
    await page.goto('/auth/login')

    await page.getByTestId('test-email-textfield').fill('tester01@klurigo.com')
    await page
      .getByTestId('test-password-textfield')
      .fill('Super$ecretPassw0rd123#')

    const loginButton = page.getByTestId('test-login-button')
    await expect(loginButton).toBeEnabled()
    await loginButton.click()

    await expect(page).toHaveURL('/')

    await page.goto('/discover')
    await expect(page).toHaveURL('/discover')

    const heading = page.getByRole('heading', { name: 'Discover' })
    await expect(heading).toBeVisible()
  })

  test('/discover/rails no longer exists', async ({ page }) => {
    await page.goto('/discover/rails')

    const errorHeading = page.getByText('Oops! Something went wrong.')
    await expect(errorHeading).toBeVisible()
  })
})
