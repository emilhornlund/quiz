import { expect, test } from '@playwright/test'

test.describe('Home Page', () => {
  test('shows home page entry points', async ({ page }) => {
    await page.goto('/')

    const title = page.getByText(/Let’s play/)
    await expect(title).toBeVisible()

    const loginLink = page.getByRole('link', { name: 'Login' })
    await expect(loginLink).toBeVisible()

    const joinButton = page.getByRole('button', { name: 'join' })
    await expect(joinButton).toBeVisible()
    await expect(joinButton).toBeDisabled()
  })
})
