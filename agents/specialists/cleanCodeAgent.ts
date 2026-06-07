import fs from 'fs';
import path from 'path';
import { runAgent } from '../core/runner';
import { TOOLS, executeTool } from '../core/tools';

interface CleanCodeInput {
  filePaths: string[];
}

const CONTEXT_DIR = path.resolve(process.cwd(), 'agents/context');

function loadContext(): string {
  const patterns = fs.readFileSync(path.join(CONTEXT_DIR, 'patterns.md'), 'utf-8');
  return `## patterns.md\n${patterns}`;
}

const SYSTEM_PROMPT = `You are a clean code enforcement agent for a Playwright + TypeScript test suite.

Your job is to read spec files and enforce every rule in patterns.md. You fix violations automatically where possible.

What you check and fix:
1. Forbidden patterns in spec files: function definitions, loops, conditionals, raw page.locator() calls
2. Missing Allure metadata (setFunctionalAllureMeta, addTestDescription)
3. Wrong import source (must be from '../../fixtures', not '@playwright/test')
4. Test bodies exceeding 15 lines — refactor to helper or POM
5. Unauthorized files — remove with run_command
6. Add // ⚠️ WARNING: comments for violations you cannot fix automatically

What you NEVER do:
- Remove .only markers (the orchestrator handles that)
- Modify tests that existed before this pipeline run
- Refactor beyond what patterns.md requires

Output: Markdown summary of what was changed, one section per file.`;

export async function runCleanCodeAgent(input: CleanCodeInput): Promise<string> {
  const context = loadContext();
  const task = `${context}

---

Enforce patterns.md compliance on these files:
${input.filePaths.map((f) => `- ${f}`).join('\n')}

For each file:
1. Read the file using read_file
2. Check every rule in patterns.md
3. Fix violations — write the corrected file using write_file
4. Document what was changed

Return a Markdown summary of all changes made.`;

  console.log(`🧹 CleanCodeAgent — checking ${input.filePaths.length} file(s)...`);
  const result = await runAgent(SYSTEM_PROMPT, task, TOOLS, executeTool);
  console.log(`✅ CleanCodeAgent — review complete`);
  return result;
}
