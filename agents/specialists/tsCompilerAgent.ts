import { execSync } from 'child_process';
import { runAgent } from '../core/runner';
import { TOOLS, executeTool } from '../core/tools';

interface TsCompilerInput {
  filePaths: string[];
}

const SYSTEM_PROMPT = `You are a TypeScript compiler fix agent.

Your job is to fix TypeScript compilation errors in specific files — nothing else.

Rules:
1. Fix only what the compiler complains about
2. Never refactor unrelated code
3. Never touch .only markers
4. Minimal changes only — one fix per error
5. After fixing, verify with run_command: npx tsc --noEmit --skipLibCheck

Return "PASS" if compilation succeeds, "FAIL: <errors>" if it does not.`;

function runTsc(filePaths: string[]): { passed: boolean; output: string } {
  try {
    const output = execSync('npx tsc --noEmit --skipLibCheck', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      timeout: 60_000,
    });
    return { passed: true, output: output || '' };
  } catch (e: any) {
    const stderr: string = e.stdout || e.stderr || e.message || '';
    const relevant = stderr
      .split('\n')
      .filter((line: string) => filePaths.some((fp) => line.includes(fp)))
      .join('\n');
    return { passed: false, output: relevant || stderr };
  }
}

export async function runTsCompilerAgent(input: TsCompilerInput): Promise<boolean> {
  console.log(`🔍 TsCompilerAgent — running tsc...`);
  const { passed, output } = runTsc(input.filePaths);

  if (passed) {
    console.log(`✅ TsCompilerAgent — no errors`);
    return true;
  }

  if (!output.trim()) {
    console.log(`✅ TsCompilerAgent — no relevant errors for these files`);
    return true;
  }

  console.log(`❌ TsCompilerAgent — errors found, invoking fix loop...`);
  const task = `Fix TypeScript compilation errors in these files:
${input.filePaths.map((f) => `- ${f}`).join('\n')}

Errors:
${output}

Read each file, fix the specific errors reported, and write the corrected file back.
Then run: npx tsc --noEmit --skipLibCheck to verify.`;

  await runAgent(SYSTEM_PROMPT, task, TOOLS, executeTool);

  const { passed: passedAfterFix, output: remainingErrors } = runTsc(input.filePaths);
  if (passedAfterFix) {
    console.log(`✅ TsCompilerAgent — errors resolved`);
    return true;
  }

  console.log(`❌ TsCompilerAgent — errors remain:\n${remainingErrors}`);
  return false;
}
