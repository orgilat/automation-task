import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

/**
 * Core agentic loop — sends a task to Claude, handles tool calls until end_turn.
 * @param systemPrompt — role/context for the agent
 * @param task — the user instruction to execute
 * @param tools — tool definitions the agent can call
 * @param toolExecutor — maps tool name + input to a result string
 */
export async function runAgent(
  systemPrompt: string,
  task: string,
  tools: Anthropic.Tool[],
  toolExecutor: (name: string, input: any) => Promise<string>,
): Promise<string> {
  const messages: any[] = [{ role: 'user', content: task }];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8096,
      system: systemPrompt,
      tools,
      messages,
    });

    if (response.stop_reason === 'end_turn') {
      return response.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('\n');
    }

    const results: any[] = [];
    for (const block of response.content) {
      if (block.type === 'tool_use') {
        const result = await toolExecutor(block.name, block.input);
        results.push({ type: 'tool_result', tool_use_id: block.id, content: result });
      }
    }

    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: results });
  }
}
