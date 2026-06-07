import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ValidationResult {
  passed: boolean;
  errorLog: string;
  stdout: string;
}

interface ValidationInput {
  filePaths: string[];
}

export async function runValidationAgent(input: ValidationInput): Promise<ValidationResult> {
  // Write file paths to handoff file for prAgent
  const handoffPath = path.resolve(process.cwd(), 'agents/context/modified-files.txt');
  fs.writeFileSync(handoffPath, input.filePaths.join('\n'), 'utf-8');

  const fileArgs = input.filePaths.join(' ');
  console.log(`🔍 ValidationAgent — running playwright on ${input.filePaths.length} file(s)...`);

  try {
    const stdout = execSync(`npx playwright test ${fileArgs} --reporter=list`, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      timeout: 120_000,
    });
    console.log(`✅ ValidationAgent — all tests passed`);
    return { passed: true, errorLog: '', stdout };
  } catch (e: any) {
    const stdout: string = e.stdout || '';
    const stderr: string = e.stderr || '';
    const errorLog = `${stdout}\n${stderr}`.trim();
    console.log(`❌ ValidationAgent — tests failed`);
    return { passed: false, errorLog, stdout };
  }
}
