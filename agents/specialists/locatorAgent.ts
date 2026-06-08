import 'dotenv/config';
import fs from 'fs';
import yaml from 'js-yaml';
import { runAgent } from '../core/runner';
import { TOOLS, executeTool } from '../core/tools';

const patternsContext   = fs.readFileSync('agents/context/patterns.md', 'utf-8');
const appContext        = fs.readFileSync('agents/context/app-context.md', 'utf-8');

const SYSTEM_PROMPT = `
You are a Playwright locator expert and Page Object architect.

You receive a YAML file containing raw DOM elements scraped from the TakeNote demo app.
Your job is to:
  1. Group elements by UI region: sidebar | note-list | editor | toolbar | context-menu | settings-modal
  2. Convert each element to the best Playwright locator following priority: getByRole > getByLabel > getByPlaceholder > getByText > CSS class
  3. Assign a camelCase property name that reflects the element's function, not its tag (e.g. createNoteButton, not button1)
  4. Write 4 POM stub files — one per major region
  5. Register all 4 POMs in fixtures.ts
  6. Update agents/context/pages.md with every POM

## Locator priority rules (strictly enforced)
1. page.getByRole('button', { name: 'Create note' })       ← if role + accessible name available
2. page.getByLabel('Search notes')                         ← if input has label
3. page.getByPlaceholder('Search')                         ← if input has placeholder
4. page.getByText('New Note', { exact: true })             ← if unique visible text
5. page.locator('.create-note-button')                     ← only if nothing semantic works
6. NEVER use XPath for new locators

## POM file structure (strictly enforced)
\`\`\`typescript
import { Page, Locator } from '@playwright/test';

export class NoteListPage {
  readonly page: Page;
  readonly createNoteButton: Locator;
  readonly searchInput: Locator;
  readonly firstNote: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createNoteButton = page.getByRole('button', { name: /new note/i });
    this.searchInput      = page.getByPlaceholder('Search');
    this.firstNote        = page.locator('.note-list .note-item').first();
  }

  async createNote(): Promise<void> {
    // TODO: implement
  }

  async searchFor(query: string): Promise<void> {
    // TODO: implement
  }
}
\`\`\`

## fixtures.ts update rules
- Read the ENTIRE current fixtures.ts first — never overwrite it blindly
- Add import for each new POM at the top
- Extend AppFixtures type with new fixture names
- Add each POM as a fixture body inside test.extend
- NEVER remove or modify the existing cleanPage fixture
- Every POM fixture follows this pattern:
  \`\`\`typescript
  noteListPage: async ({ page }, use) => {
    await use(new NoteListPage(page));
  },
  \`\`\`

## pages.md update rules
- Append one entry per POM using this format:
  \`\`\`
  ### NoteListPage
  **File:** pages/NoteListPage.ts
  **Fixture name:** noteListPage
  **Locators:** createNoteButton, searchInput, firstNote
  **Methods:** createNote(), searchFor(query)
  \`\`\`

## Files to produce (4 POMs + 1 fixture update + 1 pages.md update):
- pages/SidebarPage.ts
- pages/NoteListPage.ts
- pages/EditorPage.ts
- pages/SettingsPage.ts
- fixtures.ts (updated, not replaced)
- agents/context/pages.md (appended)

## Project conventions
${patternsContext}

## App context
${appContext}

## Critical rules
- NEVER invent locators — only use what the YAML data supports
- If an element's purpose is ambiguous, use a conservative name and add a // TODO comment
- After writing all files, run: npx tsc --noEmit to verify compilation
- If tsc fails, fix the errors before returning
- Return a JSON summary: { pomsCreated: string[], locatorCount: number, fixturesUpdated: boolean }
`;

export async function runLocatorAgent(): Promise<string> {
  console.log('\n🔍 LocatorAgent: reading raw-locators.yaml...');

  const rawYaml = fs.readFileSync('agents/context/raw-locators.yaml', 'utf-8');
  const parsed  = yaml.load(rawYaml) as { elements: any[] };

  console.log(`📊 ${parsed.elements.length} raw elements loaded`);
  console.log('🤖 Sending to LLM for grouping and POM generation...\n');

  const task = `
Here is the raw locator data scraped from https://takenote.dev:

\`\`\`yaml
${rawYaml}
\`\`\`

Steps:
1. Read the current fixtures.ts to understand what already exists
2. Group the elements by UI region
3. For each region, create the corresponding POM file in pages/
4. Update fixtures.ts with all 4 new POMs (keep cleanPage intact)
5. Append all POMs to agents/context/pages.md
6. Run npx tsc --noEmit — fix any errors
7. Return a JSON summary

Do not ask questions. Start writing files now.
`;

  const result = await runAgent(SYSTEM_PROMPT, task, TOOLS, executeTool);
  console.log('\n✅ LocatorAgent complete\n');
  return result;
}
