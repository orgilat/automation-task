import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

export async function runOnlyCleanupAgent(): Promise<string> {
  const specFiles = await glob('tests/**/*.spec.ts', { cwd: process.cwd() });
  let filesModified = 0;
  let totalRemoved = 0;
  const report: string[] = [];

  for (const file of specFiles) {
    const filePath = path.resolve(process.cwd(), file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const cleaned = content
      .replace(/test\.only\(/g, 'test(')
      .replace(/test\.describe\.only\(/g, 'test.describe(');

    if (cleaned !== content) {
      const count = (content.match(/test\.only\(|test\.describe\.only\(/g) || []).length;
      fs.writeFileSync(filePath, cleaned, 'utf-8');
      filesModified++;
      totalRemoved += count;
      report.push(`  ${file} — removed ${count} .only`);
    }
  }

  if (filesModified === 0) return 'No stale .only found — all spec files are clean.';
  return [`Removed ${totalRemoved} stale .only across ${filesModified} file(s):`, ...report].join(
    '\n',
  );
}
