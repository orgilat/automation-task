import { runAgent } from '../core/runner';
import { TOOLS, executeTool } from '../core/tools';
import Anthropic from '@anthropic-ai/sdk';

interface YamlWriterInput {
  request: string;
}

const WRITE_ONLY_TOOLS: Anthropic.Tool[] = [
  {
    name: 'write_file',
    description: 'Write or create a file in the project',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['path', 'content'],
    },
  },
];

const SYSTEM_PROMPT = `You are a YAML generation agent for a Playwright test automation pipeline.

Your job is to convert a natural-language test request into a valid agents/input.yaml file.

YAML schema to produce:
\`\`\`yaml
description: |
  Full multi-line description of what to test
pomsInvolved:
  - NoteListPage
  - EditorPage
tags:
  - "@e2e"
generateReport: false
runDebug: true
\`\`\`

Rules:
1. description must be detailed enough for testBuilderAgent to generate accurate tests
2. pomsInvolved lists the Page Object classes needed (PascalCase)
3. tags always include "@e2e" at minimum
4. Write the YAML to agents/input.yaml using write_file
5. Do not include any explanation — just write the file`;

export async function runYamlWriterAgent(input: YamlWriterInput): Promise<string> {
  const task = `Convert this request into a valid agents/input.yaml:

"${input.request}"

Write the YAML to agents/input.yaml.`;

  console.log(`📝 YamlWriterAgent — generating input.yaml...`);
  const result = await runAgent(SYSTEM_PROMPT, task, WRITE_ONLY_TOOLS, executeTool);
  console.log(`✅ YamlWriterAgent — agents/input.yaml written`);
  return result;
}
