import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import https from 'https';

interface AllureResult {
  name: string;
  status: string;
  statusDetails?: {
    message?: string;
    trace?: string;
  };
  testCaseId?: string;
  fullName?: string;
}

interface FailureAnalysis {
  likelyCause: string;
  suggestedFix: string;
}

const ALLURE_DIR = path.resolve(process.cwd(), 'allure-results');
const OUTPUT_FILE = path.resolve(process.cwd(), 'failure-analysis.md');

function loadFailedResults(): Array<{ name: string; file: string; error: string; stack: string }> {
  if (!fs.existsSync(ALLURE_DIR)) {
    console.warn('⚠️  allure-results directory not found');
    return [];
  }

  const jsonFiles = fs
    .readdirSync(ALLURE_DIR)
    .filter((f) => f.endsWith('.json') && !f.includes('container') && !f.includes('categories'));

  const failures: Array<{ name: string; file: string; error: string; stack: string }> = [];

  for (const file of jsonFiles) {
    try {
      const content = fs.readFileSync(path.join(ALLURE_DIR, file), 'utf-8');
      const result = JSON.parse(content) as AllureResult;

      if (result.status === 'failed') {
        failures.push({
          name: result.name || result.fullName || 'Unknown test',
          file: result.fullName?.split('#')[0] || file,
          error: result.statusDetails?.message || 'No error message',
          stack: (result.statusDetails?.trace || '').split('\n').slice(0, 5).join('\n'),
        });
      }
    } catch {
      // Skip malformed JSON files
    }
  }

  return failures;
}

async function analyzeFailure(
  client: Anthropic,
  failure: { name: string; file: string; error: string; stack: string },
): Promise<FailureAnalysis> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Analyze this Playwright test failure and return ONLY valid JSON:

Test: ${failure.name}
File: ${failure.file}
Error: ${failure.error}
Stack:
${failure.stack}

Return exactly:
{"likelyCause": "<one sentence>", "suggestedFix": "<one sentence>"}`,
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as any).text)
    .join('');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      likelyCause: 'Could not parse analysis',
      suggestedFix: 'Review the error message manually',
    };
  }
  return JSON.parse(jsonMatch[0]) as FailureAnalysis;
}

function buildReport(
  failures: Array<{ name: string; file: string; error: string; stack: string }>,
  analyses: FailureAnalysis[],
): string {
  const sections = failures.map((f, i) => {
    const a = analyses[i];
    return `## ${f.name}
**File:** \`${f.file}\`
**Error:** \`${f.error}\`
**Likely cause:** ${a.likelyCause}
**Suggested fix:** ${a.suggestedFix}

---`;
  });

  return `# Failure Analysis\n\n${sections.join('\n\n')}`;
}

function postSlackMessage(webhookUrl: string, text: string): void {
  const body = JSON.stringify({ text });
  const url = new URL(webhookUrl);
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  };
  const req = https.request(options);
  req.write(body);
  req.end();
}

async function main(): Promise<void> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    const failures = loadFailedResults();

    if (failures.length === 0) {
      const report = '# Failure Analysis\n\nNo failed tests found in allure-results.';
      fs.writeFileSync(OUTPUT_FILE, report, 'utf-8');
      console.log('✅ No failures to analyze');
      process.exit(0);
    }

    if (!apiKey) {
      console.warn('⚠️  ANTHROPIC_API_KEY not set — writing placeholder report');
      const report =
        `# Failure Analysis\n\n` +
        failures
          .map((f) => `## ${f.name}\n**File:** \`${f.file}\`\n**Error:** \`${f.error}\``)
          .join('\n\n---\n\n');
      fs.writeFileSync(OUTPUT_FILE, report, 'utf-8');
      process.exit(0);
    }

    const client = new Anthropic({ apiKey });
    console.log(`🔍 Analyzing ${failures.length} failure(s)...`);

    const analyses = await Promise.all(
      failures.map((f) =>
        analyzeFailure(client, f).catch(() => ({
          likelyCause: 'Analysis failed',
          suggestedFix: 'Review manually',
        })),
      ),
    );

    const report = buildReport(failures, analyses);
    fs.writeFileSync(OUTPUT_FILE, report, 'utf-8');
    console.log(`✅ Failure analysis written to ${OUTPUT_FILE}`);

    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackUrl) {
      const runUrl =
        process.env.GITHUB_SERVER_URL && process.env.GITHUB_RUN_ID
          ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
          : 'CI run';
      postSlackMessage(
        slackUrl,
        `❌ ${failures.length} test(s) failed in ${runUrl} — see PR comment for analysis`,
      );
    }
  } catch (err) {
    console.warn(`⚠️  FailureAnalyzerAgent error: ${(err as Error).message}`);
    fs.writeFileSync(
      OUTPUT_FILE,
      '# Failure Analysis\n\nAgent encountered an error. Review CI logs.',
      'utf-8',
    );
  }

  process.exit(0);
}

main();
