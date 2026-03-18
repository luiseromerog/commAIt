import fetch from 'node-fetch';
import { Config, PromptResult } from '../utils/types.js';
import { logger } from '../utils/logger.js';
import { buildPrompt } from './prompt.js';

export async function generateCommitMessage(config: Config, prompt: string | PromptResult): Promise<string> {
  const url = `${config.baseUrl}/chat/completions`;
  
  // Build the prompt with context and instructions
  const _promptResult = buildPrompt({ config, diff: '', diffFiles: [] });
  const promptResult = typeof prompt === 'string' ? { contextMessage: prompt, instructions: '' } : prompt;
  
  const requestBody = {
    model: config.model,
    messages: [
      {
        role: 'system',
        content: promptResult.instructions,
      },
      {
        role: 'user',
        content: promptResult.contextMessage,
      },
    ],
    temperature: config.temperature ?? 0.7,
    max_tokens: config.maxTokens ?? 4096,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data: any = await response.json();
    const content = data.choices[0].message.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    return cleanCommitMessage(content);
  } catch (error) {
    logger.error(`Failed to generate commit message: ${error instanceof Error ? error.message : error}`);
    throw error;
  }
}

function cleanCommitMessage(content: string): string {
  let message = content.trim();

  // Remove markdown code blocks
  message = message.replace(/^```(?:markdown)?\n?/, '').replace(/```$/, '');

  // Remove leading/trailing quotes
  message = message.replace(/^["']|["']$/, '');

  // Remove thinking text before the message
  message = message.replace(/(think|let me|here is|sure|commit message):?\s*?/i, '');

  // Extract just the commit message (first line or first meaningful part)
  const lines = message.split('\n');
  const firstLine = lines.find(line => 
    line.length > 0 && 
    !line.startsWith('-') && 
    !line.startsWith('##') && 
    !line.startsWith('###')
  );

  if (firstLine) {
    return firstLine.trim();
  }

  // If no single line found, take first few lines
  return lines.slice(0, 2).join('\n').trim();
}