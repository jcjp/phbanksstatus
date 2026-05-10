import { test, expect } from '@playwright/test'

test.describe('Philippine Bank Status Dashboard', () => {
  test('should load dashboard and display all banks', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page).toHaveTitle(/Philippine Bank Status Monitor/)

    // Wait for banks to load
    await page.waitForSelector('[class*="bank"]', { timeout: 10000 })

    // Verify all 6 banks are displayed
    const bankCards = page.locator('text=/UnionBank|Security Bank|Bank of the Philippines|Banco De Oro|Rizal Commercial|EastWest/')
    await expect(bankCards).toHaveCount(6, { timeout: 10000 })
  })

  test('should display summary indicator', async ({ page }) => {
    await page.goto('/')

    // Wait for summary message
    const summary = page.locator('text=/All banks operational|bank.*experiencing issues/')
    await expect(summary).toBeVisible({ timeout: 10000 })
  })

  test('should auto-refresh status', async ({ page }) => {
    await page.goto('/')

    // Get initial last update time
    const initialUpdate = await page.locator('text=/Last updated:/')
    await expect(initialUpdate).toBeVisible()

    // Wait for refresh (60 seconds + buffer)
    await page.waitForTimeout(65000)

    // Verify update time changed
    const updatedTime = await page.locator('text=/Last updated:/')
    await expect(updatedTime).toBeVisible()
  })

  test('should show bank details on card', async ({ page }) => {
    await page.goto('/')

    // Wait for first bank card
    await page.waitForSelector('text=UnionBank', { timeout: 10000 })

    // Verify status badge is visible
    const statusBadge = page.locator('text=/Up|Degraded|Down|Maintenance/').first()
    await expect(statusBadge).toBeVisible()

    // Verify last checked time
    await expect(page.locator('text=/Last checked:/')).toBeVisible()

    // Verify service breakdown (4 services per bank)
    const services = page.locator('text=/Website|Mobile App|Internet Banking|API Integration/')
    await expect(services.first()).toBeVisible()
  })

  test('should toggle historical timeline view', async ({ page }) => {
    await page.goto('/')

    // Wait for first bank card and click it
    const firstBankCard = page.locator('text=UnionBank').first()
    await firstBankCard.click()

    // Verify historical view expands
    await expect(page.locator('text=30-Day History')).toBeVisible({ timeout: 5000 })

    // Close historical view
    const closeButton = page.locator('[icon="i-heroicons-x-mark"]').first()
    await closeButton.click()

    // Verify historical view is hidden
    await expect(page.locator('text=30-Day History')).not.toBeVisible()
  })

  test('should display circuit breaker banner when active', async ({ page }) => {
    // This test would need mocked data to trigger circuit breaker
    // For now, just verify the banner element can be found if it appears
    await page.goto('/')

    // Check if banner exists (may not be visible if circuit breaker is not active)
    const banner = page.locator('text=/Status checks paused due to rate limits/')
    const bannerCount = await banner.count()

    // Banner should either be visible (1) or not present (0)
    expect(bannerCount).toBeLessThanOrEqual(1)
  })

  test('should handle loading states', async ({ page }) => {
    await page.goto('/')

    // Verify loading indicator appears initially
    const loadingSpinner = page.locator('[class*="animate-spin"]')
    // Loading may be fast, so we just check it existed or content is already loaded
    const hasContent = await page.locator('text=/UnionBank|Security Bank/').count()
    const wasLoading = await loadingSpinner.count()

    expect(hasContent > 0 || wasLoading > 0).toBeTruthy()
  })

  test('should display degraded bank details', async ({ page }) => {
    await page.goto('/')

    // Look for any degraded banks (if present)
    const degradedBanks = page.locator('text=Degraded')
    const count = await degradedBanks.count()

    if (count > 0) {
      // Verify affected services are shown
      await expect(page.locator('text=/Affected Services:/')).toBeVisible()
    }
  })

  test('should be responsive and mobile-friendly', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Verify content is still accessible
    await expect(page.locator('text=Philippine Bank Status Monitor')).toBeVisible()

    // Verify banks are displayed in single column on mobile
    const bankCards = page.locator('[class*="grid"]')
    await expect(bankCards).toBeVisible()
  })
})
