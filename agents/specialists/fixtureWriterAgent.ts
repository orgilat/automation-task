import fs from 'fs';
import path from 'path';
import { runAgent } from '../core/runner';
import { TOOLS, executeTool } from '../core/tools';

interface FixtureWriterInput {
  pageName: string;
  fixtureName: string;
}

const CONTEXT_DIR = path.resolve(process.cwd(), 'agents/context');

function loadContext(): string {
  const pages = fs.readFileSync(path.join(CONTEXT_DIR, 'pages.md'), 'utf-8');
  const fixturesContent = fs.readFileSync(path.resolve(process.cwd(), 'fixtures.ts'), 'utf-8');
  return `## pages.md\n${pages}\n\n## Current fixtures.ts\n${fixturesContent}`;
}

const SYSTEM_PROMPT = `You are a fixture writer agent for a Playwright + TypeScript test suite.

Your job is to register new Page Object Models as fixtures in fixtures.ts without breaking existing fixtures.

Rules:
1. Read the entire current fixtures.ts first using read_file
2. Add the import at the top alongside existing POM imports
3. Extend the AppFixtures type with the new fixture
4. Add the fixture body inside test.extend
5. Preserve every existing fixture exactly — do not modify or remove anything
6. The fixture body: async ({ page }, use) => { await use(new PageName(page)); }

Output format (respond with JSON only after writing the file):
{"status": "added" | "exists", "fixtureName": "<name>"}`;

export async function runFixtureWriterAgent(input: FixtureWriterInput): Promise<string> {
  const context = loadContext();
  const task = `${context}

---

Register this Page Object as a fixture in fixtures.ts:

Page class name: ${input.pageName}
Fixture name: ${input.fixtureName}
Import path: ./pages/${input.pageName}

Read the current fixtures.ts, add the new fixture, and write it back.
Return JSON: {"status": "added", "fixtureName": "${input.fixtureName}"}`;

  console.log(`🔧 FixtureWriterAgent — registering ${input.fixtureName}...`);
  const result = await runAgent(SYSTEM_PROMPT, task, TOOLS, executeTool);
  console.log(`✅ FixtureWriterAgent — ${input.fixtureName} registered`);
  return result;
}
