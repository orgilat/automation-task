import { runDebugAgent } from './specialists/debugAgent';

async function main(): Promise<void> {
  const result = await runDebugAgent({
    filePaths: ['tests/e2e/persistence/persistence.spec.ts'],
    errorLog: `
Only 3 persistence tests are still failing. 24 tests pass.

Fix only tests/e2e/persistence/persistence.spec.ts.

Failures:
1. Note content survives reload:
   Expected editor content to contain "Persist me" after reload, received "".

2. Note count survives reload:
   Expected note count 3 after reload, received 1.

3. Trashed note stays in Trash after reload:
   Expected Trash count 1 after reload, received 0.

Context:
Before removing the old localStorage helper setup, these persistence tests passed.
Do NOT restore helpers/localStorage.ts.
Do NOT restore helpers/waitForApp.ts.
Do NOT reintroduce cleanPage.
Do NOT edit POM files.

Likely cause:
The test reloads too quickly after create/type/delete, before the app has persisted state.

Required approach:
- Keep beforeEach using page.goto('/app') and domcontentloaded.
- Add explicit Playwright waits after each state-changing action and before reload.
- After editorPage.typeContent('Persist me'), wait until editorPage.getContent() contains "Persist me" before reload.
- After creating 3 notes, wait until noteListPage.getNoteCount() is 3 before reload.
- After deleting note, wait until active note list state is updated before reload.
- After page.reload(), wait for domcontentloaded.
- Then wait/assert using expect.poll instead of immediate expect where needed.

Use patterns like:
await expect.poll(async () => await editorPage.getContent()).toContain('Persist me');

await expect.poll(async () => await noteListPage.getNoteCount()).toBe(3);

Do not:
- Change test names.
- Add new tests.
- Change POM files.
- Change app code.
- Restore localStorage helpers.
- Restore waitForApp helper.
- Reintroduce cleanPage.

Acceptance:
- npx tsc --noEmit passes.
- npx playwright test --project=chromium passes with 27 passed.
`,
    stdout: '',
  });

  console.log(result);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});