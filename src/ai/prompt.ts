import { Config, DiffFile } from '../utils/types.js';

interface PromptContext {
  config: Config;
  diff: string;
  diffFiles: DiffFile[];
}

interface PromptResult {
  contextMessage: string;
  instructions: string;
}

export function buildPrompt({ config, diff, diffFiles }: PromptContext): PromptResult {
  // Build the context message for the user
  const fileList = diffFiles.map(f => `- ${f.filename} (${f.status})`).join('\n');
  const statusSummary = diffFiles.reduce((acc, f) => {
    acc[f.status] = (acc[f.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const statusText = Object.entries(statusSummary)
    .map(([status, count]) => `- ${status}: ${count} file(s)`)
    .join('\n');
  
  const contextMessage = `I have made some changes to my code and need help generating a commit message.
Here are the changes I made:

DIFF:
${diff}

FILES CHANGED:
${fileList}

SUMMARY:
${statusText}`;
  
  // Use the system prompt from config (which includes defaults if not overridden)
  let instructions = config.systemPrompt || '';

  // Dynamic replacement of placeholders in the prompt
  const format = config.model.includes('gpt-4') 
    ? 'Emoji: Description (optional: more details)' 
    : 'Emoji Description';
    
  instructions = instructions.replace('{format}', format);

  return { contextMessage, instructions };
}

export function validatePrompt(response: string): string {
  let message = response.trim();

  // Remove markdown formatting
  message = message.replace(/^```(?:markdown)?\n?/, '').replace(/```$/, '');
  message = message.replace(/^["']|["']$/, '');

  // Remove thinking text
  message = message.replace(/(think|let me|here is|sure|commit message):?\s*/i, '');
  
  // Remove explanatory text at the end
  message = message.replace(/\n*(?:Explain|Reasoning|Notes)[:\s]*\n?/, '');
  message = message.replace(/\n*(?:Why|Context)[:\s]*\n?/i, '');

  // Extract the first meaningful line (the actual commit message)
  const lines = message.split('\n');
  const firstLine = lines.find(line => 
    line.length > 0 && 
    !line.startsWith('-') && 
    !line.startsWith('# ') && 
    !line.startsWith('## ') && 
    !line.startsWith('### ') &&
    !line.match(/^#{2,3}\s/)
  );

  if (firstLine) {
    return firstLine.trim();
  }

  // Fallback: take first few lines
  return lines
    .filter(l => l.length > 0 && !l.startsWith('-') && !l.startsWith('# '))
    .slice(0, 3)
    .join('\n')
    .trim();
}
