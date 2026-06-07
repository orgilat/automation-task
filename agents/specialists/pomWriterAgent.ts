import fs from 'fs';
import path from 'path';
import { runAgent } from '../core/runner';
import { TOOLS, executeTool } from '../core/tools';

interface PomElement {
  name: string;
  role?: string;
  testid?: string;
  text?: string;
  selector?: string;
}

interface PomWriterInput {
  pageName: string;
  description: string;
  elements: PomElement[];
}

const CONTEXT_DIR = path.resolve(process.cwd(), 'agents/context');

function loadContext(): string {
  const patterns = fs.readFileSync(path.join(CONTEXT_DIR, 'patterns.md'), 'utf-8');
  const appCtx = fs.readFileSync(path.join(CONTEXT_DIR, 'app-context.md'), 'utf-8');
  const pages = fs.readFileSync(path.join(CONTEXT_DIR, 'pages.md'), 'utf-8');
  return `## patterns.md\n${patterns}\n\n## app-context.md\n${appCtx}\n\n## pages.md\n${pages}`;
}

const SYSTEM_PROMPT = `You are a POM (Page Object Model) writer agent for a Playwright + TypeScript test suite.

Your job is to create Page Object files following strict conventions. Read the project context carefully.

Rules:
1. Use strict POM convention: readonly page, readonly locators, constructor assigns all locators, all methods are async
2. Locator priority: getByRole → getByTestId → getByText → getByLabel/getByPlaceholder → CSS → XPath
3. No business logic in POMs — only DOM interactions
4. Every public method has a JSDoc one-liner
5. After writing the POM file, append a new entry to agents/context/pages.md with locators and methods
6. Output only valid TypeScript — no explanations outside the files you write

Output format (respond with JSON only after writing files):
{"pageFile": "<path>", "fixtureName": "<camelCase>", "methods": ["<method1>", "<method2>"]}`;

export async function runPomWriterAgent(input: PomWriterInput): Promise<string> {
  const context = loadContext();
  const task = `${context}

---

Create a Page Object Model for the following UI region:

Page name: ${input.pageName}
Description: ${input.description}
Elements to include:
${input.elements.map((e) => `- ${e.name}: ${JSON.stringify(e)}`).join('\n')}

Write the file to pages/${input.pageName}.ts following all conventions.
Then update agents/context/pages.md with the new POM entry.
Return JSON: {"pageFile": "pages/${input.pageName}.ts", "fixtureName": "${input.pageName.charAt(0).toLowerCase() + input.pageName.slice(1)}", "methods": [<list of method names>]}`;

  console.log(`🏗️  PomWriterAgent — creating ${input.pageName}...`);
  const result = await runAgent(SYSTEM_PROMPT, task, TOOLS, executeTool);
  console.log(`✅ PomWriterAgent — ${input.pageName} written`);
  return result;
}
