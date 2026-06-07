import { Page } from '@playwright/test';
import logger from '../logger';

/**
 * TakeNote persists state in localStorage under specific keys.
 * These helpers wrap state inspection and reset for clean test isolation.
 */

export const TAKENOTE_STORAGE_KEYS = {
  notes: 'notes',
  categories: 'categories',
  settings: 'settings',
} as const;

export async function clearAppState(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  logger.info('App state cleared (localStorage + sessionStorage)');
}

export async function getAppState(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    const state: Record<string, unknown> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        try {
          state[key] = JSON.parse(window.localStorage.getItem(key) || 'null');
        } catch {
          state[key] = window.localStorage.getItem(key);
        }
      }
    }
    return state;
  });
}

export async function seedAppState(
  page: Page,
  state: Partial<Record<keyof typeof TAKENOTE_STORAGE_KEYS, unknown>>,
): Promise<void> {
  await page.evaluate((seed) => {
    Object.entries(seed).forEach(([key, value]) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    });
  }, state);
  logger.info(`App state seeded with keys: ${Object.keys(state).join(', ')}`);
}
