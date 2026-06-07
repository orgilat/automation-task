import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';
import Anthropic from '@anthropic-ai/sdk';

export const TOOLS: Anthropic.Tool[] = [
  {
    name: 'read_file',
    description: 'Read a file from the project',
    input_schema: {
      type: 'object',
      properties: { path: { type: 'string' } },
      required: ['path'],
    },
  },
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
  {
    name: 'search_in_files',
    description: 'Search for a word or pattern across all project files',
    input_schema: {
      type: 'object',
      properties: {
        pattern: { type: 'string' },
        directory: { type: 'string' },
      },
      required: ['pattern'],
    },
  },
  {
    name: 'run_command',
    description: 'Run a terminal command (allowlist-restricted)',
    input_schema: {
      type: 'object',
      properties: { command: { type: 'string' } },
      required: ['command'],
    },
  },
];

export async function executeTool(name: string, input: any): Promise<string> {
  switch (name) {
    case 'read_file': {
      const fullPath = path.resolve(process.cwd(), input.path);
      if (!fs.existsSync(fullPath)) return `ERROR: file not found: ${input.path}`;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const files = fs.readdirSync(fullPath);
        return `ERROR: path is a directory, not a file. Contents: ${files.join(', ')}`;
      }
      return fs.readFileSync(fullPath, 'utf-8');
    }

    case 'write_file': {
      const fullPath = path.resolve(process.cwd(), input.path);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, input.content, 'utf-8');
      return `OK: written to ${input.path}`;
    }

    case 'search_in_files': {
      const dir = input.directory || '.';
      const files = await glob(`${dir}/**/*.ts`, {
        ignore: ['node_modules/**', 'agents/**', 'dist/**'],
      });
      const matches = files.filter((file) =>
        fs.readFileSync(file, 'utf-8').includes(input.pattern),
      );
      return matches.length ? matches.join('\n') : 'not found';
    }

    case 'run_command': {
      const allowed = ['tsc', 'npx playwright', 'git', 'npm run', 'npm test', 'rm '];
      const isAllowed = allowed.some((cmd) => input.command.startsWith(cmd));
      if (!isAllowed) return `ERROR: command not allowed: ${input.command}`;
      try {
        return (
          execSync(input.command, {
            cwd: process.cwd(),
            encoding: 'utf-8',
            timeout: 60_000,
          }) || 'OK'
        );
      } catch (e: any) {
        return `ERROR: ${e.message}`;
      }
    }

    default:
      return `ERROR: unknown tool: ${name}`;
  }
}
