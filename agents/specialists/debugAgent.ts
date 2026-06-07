import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { runAgent } from '../core/runner';
import { TOOLS, executeTool } from '../core/tools';
import { runValidationAgent } from './validationAgent';

interface DebugInput {
  filePaths: string[];
  errorLog: string;
  stdout: string;
}

interface Classification {
  classification: 'SYSTEM_BUG' | 'CODE_BUG';
  evidence: string;
  expected: string;
  actual: string;
  recommendation: string;
}

const client = new Anthropic();
const REPORTS_DIR = path.resolve(process.cwd(), 'agents/failure-reports');

const FIX_SYSTEM_PROMPT = `You are a surgical bug fix agent for a Playwright + TypeScript test suite.

Your job is to fix test code bugs — minimal changes only.

Rules:
1. Read each failing file first
2. Apply the smallest possible fix for the reported error
3. Never refactor beyond the fix
4. Never touch .only markers
5. After fixing, confirm the fix makes logical sense

Return a brief description of the fix applied.`;

async function classifyFailure(errorLog: string, stdout: string): Promise<Classification> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Classify this Playwright test failure as exactly one of:
- SYSTEM_BUG: test logic is correct, the app returned unexpected data/behavior
- CODE_BUG: test has wrong logic, wrong selector, wrong assertion, import error

Error log:
${errorLog}

Stdout:
${stdout}

Return ONLY valid JSON matching this schema exactly:
{
  "classification": "SYSTEM_BUG" | "CODE_BUG",
  "evidence": "<exact quote from log>",
  "expected": "<what was expected>",
  "actual": "<what actually happened>",
  "recommendation": "<one sentence fix>"
}`,
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as any).text)
    .join('');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`DebugAgent: could not parse classification JSON\n${text}`);
  return JSON.parse(jsonMatch[0]) as Classification;
}

function saveReport(classification: Classification, timestamp: string): void {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const reportPath = path.join(REPORTS_DIR, `failure-${timestamp}.md`);
  const content = `# Failure Analysis — ${timestamp}

## Classification: ${classification.classification}

**Evidence:** ${classification.evidence}

**Expected:** ${classification.expected}

**Actual:** ${classification.actual}

**Recommendation:** ${classification.recommendation}
`;
  fs.writeFileSync(reportPath, content, 'utf-8');
  console.log(`📋 DebugAgent — report saved to ${reportPath}`);
}

export async function runDebugAgent(input: DebugInput): Promise<boolean> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  console.log(`🔧 DebugAgent — classifying failure...`);

  const classification = await classifyFailure(input.errorLog, input.stdout);
  saveReport(classification, timestamp);

  console.log(`📋 DebugAgent — classification: ${classification.classification}`);
  console.log(`   Evidence: ${classification.evidence}`);

  if (classification.classification === 'SYSTEM_BUG') {
    console.log(`⚠️  DebugAgent — SYSTEM_BUG detected. No code fix applied.`);
    return false;
  }

  console.log(`🔧 DebugAgent — CODE_BUG detected, applying fix...`);

  const task = `Fix this test failure:

Files:
${input.filePaths.map((f) => `- ${f}`).join('\n')}

Error classification: CODE_BUG
Evidence: ${classification.evidence}
Expected: ${classification.expected}
Actual: ${classification.actual}
Recommendation: ${classification.recommendation}

Read each failing file, apply the minimal fix, and write it back.`;

  await runAgent(FIX_SYSTEM_PROMPT, task, TOOLS, executeTool);

  console.log(`🔍 DebugAgent — re-running validation after fix...`);
  const { passed } = await runValidationAgent({ filePaths: input.filePaths });
  return passed;
}
