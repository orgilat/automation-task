import Anthropic from '@anthropic-ai/sdk';

interface LogFilterInput {
  rawLog: string;
}

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a log filter agent for Playwright test output.

Your job is to extract only failure-relevant information from noisy test logs.

Output format — use ONLY these blocks, one per failure:
TEST: <test name>
ERROR: <error message>
DETAIL: <stack or context line>

If there are no failures, output exactly: NO_FAILURES

Rules:
1. No introduction, no conclusion, no explanation
2. Strip all progress bars, timing lines, browser setup output
3. Keep error messages verbatim
4. Maximum 3 DETAIL lines per failure`;

export async function runLogFilterAgent(input: LogFilterInput): Promise<string> {
  const truncated = input.rawLog.slice(0, 80_000);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Filter this log:\n\n${truncated}` }],
  });

  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as any).text)
    .join('');
}
