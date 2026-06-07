import fs from 'fs';
import path from 'path';
import { runAgent } from '../core/runner';
import { TOOLS, executeTool } from '../core/tools';

interface TestBuilderInput {
  description: string;
  pomsInvolved: string[];
  tags: string[];
}

const CONTEXT_DIR = path.resolve(process.cwd(), 'agents/context');

function loadContext(): string {
  const patterns = fs.readFileSync(path.join(CONTEXT_DIR, 'patterns.md'), 'utf-8');
  const appCtx = fs.readFileSync(path.join(CONTEXT_DIR, 'app-context.md'), 'utf-8');
  const pages = fs.readFileSync(path.join(CONTEXT_DIR, 'pages.md'), 'utf-8');
  return `## patterns.md\n${patterns}\n\n## app-context.md\n${appCtx}\n\n## pages.md\n${pages}`;
}

const SYSTEM_PROMPT = `You are a test builder agent for a Playwright + TypeScript test suite targeting TakeNote.

Your job is to create spec files following strict structural conventions. Read patterns.md carefully — every rule is enforced.

Critical rules:
1. ALWAYS import from '../../fixtures' not from '@playwright/test'
2. Every test body is ≤ 15 lines
3. Every test is wrapped in allure.step() for logical blocks
4. setFunctionalAllureMeta in beforeEach
5. addTestDescription at top of each test
6. NO raw page.locator() — only via POM methods
7. NO loops, conditionals, or function definitions inside test bodies
8. File name is kebab-case: create-note.spec.ts
9. Check for existing similar tests first — if exists, return JSON: {"status": "EXISTS", "file": "<path>"}
10. Tags go at the START of the describe title: test.describe('@notes Create a note', ...)

Output: newline-separated list of created file paths`;

export async function runTestBuilderAgent(input: TestBuilderInput): Promise<string> {
  const context = loadContext();
  const task = `${context}

---

Build a test for the following requirement:

Description: ${input.description}
POMs involved: ${input.pomsInvolved.join(', ')}
Tags: ${input.tags.join(', ')}

First check if a similar test already exists using search_in_files.
If not, determine the correct subfolder under tests/e2e/ based on the tags.
Write the spec file following all conventions from patterns.md.
Return the created file path(s), one per line.`;

  console.log(`📋 TestBuilderAgent — building test...`);
  const result = await runAgent(SYSTEM_PROMPT, task, TOOLS, executeTool);
  console.log(`✅ TestBuilderAgent — test written`);
  return result;
}
