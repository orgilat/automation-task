import { TestInfo } from '@playwright/test';
import logger from '../logger';

/**
 * Auto-fixture body — runs before/after every test for consistent context.
 * Logs entry and exit with timing.
 */
export async function withTestContext(testInfo: TestInfo, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  logger.info(`▶ START: ${testInfo.titlePath.join(' › ')}`);
  try {
    await fn();
    logger.info(`✔ PASS: ${testInfo.title} (${Date.now() - start}ms)`);
  } catch (err) {
    logger.error(`✘ FAIL: ${testInfo.title} (${Date.now() - start}ms) — ${(err as Error).message}`);
    throw err;
  }
}
