import { expect, test } from '@playwright/test'

test.describe('Auth: Login', () => {
  test('navigates from Home to Login and authenticates successfully', async ({
    page,
  }) => {
    await page.goto('/')

    await test.step('Open login form from Home', async () => {
      const loginLink = page.getByRole('link', { name: 'Login' })
      await expect(loginLink).toBeVisible()
      await loginLink.click()
      await expect(page).toHaveURL('/auth/login')
    })

    await test.step('Validate initial form state', async () => {
      const loginButton = page.getByTestId('test-login-button')
      await expect(loginButton).toBeVisible()
      await expect(loginButton).toBeDisabled()

      await expect(page.getByTestId('test-email-textfield')).toBeVisible()
      await expect(page.getByTestId('test-password-textfield')).toBeVisible()
    })

    await test.step('Fill credentials and submit', async () => {
      await page
        .getByTestId('test-email-textfield')
        .fill('tester01@klurigo.com')
      await page
        .getByTestId('test-password-textfield')
        .fill('Super$ecretPassw0rd123#')

      const loginButton = page.getByTestId('test-login-button')
      await expect(loginButton).toBeEnabled()
      await loginButton.click()
    })

    await test.step('Redirects back to Home after login', async () => {
      await expect(page).toHaveURL('/')
    })
  })
})
