# TakeNote Test Suite — Project Conventions

These are the rules every agent must follow. Violations break consistency and downstream agents.

## 1. Fixture Import — The One Rule

Always import from the project fixtures file, never from `@playwright/test` directly in test files:

```typescript
// ✅ Correct
import { test, expect } from '../../fixtures';

// ❌ Wrong — bypasses POM injection
import { test, expect } from '@playwright/test';
```

## 2. POM Naming and Registration

| Fixture name                     | POM Class | File |
| -------------------------------- | --------- | ---- |
| (registered as POMs are written) |           |      |

Every new POM must be:

1. Created in `pages/`
2. Imported into `fixtures.ts`
3. Registered as a fixture
4. Documented in `agents/context/pages.md`

## 3. Spec File Structure — Mandatory

A spec file is a coordinator. Maximum 15 lines per test function body. It calls helpers and asserts — it does NOT contain business logic.

**FORBIDDEN inside any `.spec.ts` file:**

- Function definitions (`async function`, `function`, arrow functions assigned to `const`)
- Interface or type definitions
- Loops (`for`, `while`, `forEach`)
- Conditionals (`if`, `switch`)
- Raw `page.locator()` calls
- Inline navigation logic

**A `.spec.ts` file must contain ONLY:**

- `import` statements
- `test.describe()` blocks
- `test.beforeEach()` / `test.afterEach()` blocks
- `test()` blocks (max 15 lines each)

## 4. Test Structure Template

```typescript
import { test, expect } from '../../fixtures';
import { allure } from 'allure-playwright';
import { setFunctionalAllureMeta, addTestDescription } from '../../helpers/allureLabels';
import logger from '../../logger';

test.describe('@e2e Feature Name', () => {
  test.beforeEach(async ({ cleanPage }) => {
    setFunctionalAllureMeta({
      layer: 'e2e',
      suite: 'Notes',
      subSuite: 'CRUD',
      component: 'NoteList',
      severity: 'critical',
    });
  });

  test('Creates a new note', async ({ cleanPage, noteListPage }) => {
    addTestDescription({
      whatIsTested: 'A user can create a new note and see it in the list.',
      testSteps: ['Click create', 'Enter title', 'Verify appears in list'],
    });

    await allure.step('Create note', async () => {
      await noteListPage.createNewNote('My note');
    });

    await allure.step('Verify in list', async () => {
      await expect(noteListPage.firstNote).toContainText('My note');
    });

    logger.info('Note creation flow completed');
  });
});
```

## 5. Allure Metadata — Required Fields

`setFunctionalAllureMeta` must be called in every test or its `beforeEach`:

```typescript
setFunctionalAllureMeta({
  layer: 'ui' | 'e2e' | 'smoke' | 'visual' | 'a11y',
  suite: string,
  subSuite: string,
  component: string,
  severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial',
});
```

## 6. Locator Priority (preferred → avoid)

1. `getByRole` — first choice
2. `getByTestId` — if data-testid exists
3. `getByText` — for unique visible text
4. `getByLabel` / `getByPlaceholder` — for form inputs
5. CSS with semantic class — last resort
6. XPath — only when nothing else works

## 7. POM Conventions

```typescript
import { Page, Locator } from '@playwright/test';

export class MyPage {
  readonly page: Page;
  readonly someLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.someLocator = page.getByRole('button', { name: 'Click me' });
  }

  async someAction(): Promise<void> {
    await this.someLocator.click();
  }
}
```

No base class. Every POM is standalone.

## 8. Tagging System

Every `test.describe` block carries a feature-area tag that matches its subfolder. This enables targeted runs and clean Allure grouping:

| Tag            | Subfolder                | Purpose               |
| -------------- | ------------------------ | --------------------- |
| `@notes`       | `tests/e2e/notes/`       | Note CRUD operations  |
| `@categories`  | `tests/e2e/categories/`  | Category management   |
| `@search`      | `tests/e2e/search/`      | Search functionality  |
| `@favorites`   | `tests/e2e/favorites/`   | Favorites flow        |
| `@trash`       | `tests/e2e/trash/`       | Trash and restore     |
| `@persistence` | `tests/e2e/persistence/` | localStorage survival |
| `@settings`    | `tests/e2e/settings/`    | Theme, preview toggle |

The tag goes at the start of the describe title: `test.describe('@notes Create a note', ...)`. This lets us run subsets with `--grep @notes` if needed.

## 9. Always Use `cleanPage` Fixture

Every E2E test starts with `cleanPage` from `fixtures.ts`. It navigates to the app and clears localStorage. Never use raw `page` for E2E.

## 10. Forbidden Patterns

```typescript
// ❌ page.waitForTimeout() — use expect.poll() or auto-waiting
await page.waitForTimeout(3000);

// ❌ Hardcoded URLs in tests
await page.goto('https://takenote.dev'); // baseURL is configured

// ❌ Inline locators in test bodies
const btn = page.locator('button.x'); // belongs in POM
```
