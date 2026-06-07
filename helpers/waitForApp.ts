import { Page, expect } from '@playwright/test';
import logger from '../logger';

/**
 * Waits for TakeNote to be visually ready before any test action.
 * Uses defensive checks because the demo is a public site that may be cold-started.
 */
export async function waitForAppReady(page: Page, timeout = 20_000): Promise<void> {
  await expect(page).toHaveTitle(/TakeNote/i, { timeout });
  await page.waitForLoadState('domcontentloaded');
  // eslint-disable-next-line playwright/no-networkidle
  await page.waitForLoadState('networkidle', { timeout: timeout / 2 }).catch(() => {
    logger.warn('networkidle wait timed out — proceeding anyway');
  });
}
