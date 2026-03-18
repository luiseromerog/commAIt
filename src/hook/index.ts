import { execSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { loadConfig } from '../config/index.js';
import { generateCommitMessage } from '../ai/client.js';
import { logger } from '../utils/logger.js';
import { buildPrompt } from '../ai/prompt.js';
import { parseDiffFiles } from '../git/index.js';
import { CommitAction } from '../utils/types.js';
// import { Config } from '../utils/types.js';
import readline from 'node:readline';

export async function generateCommitMessageHook(): Promise<{ message: string; action: CommitAction }> {
  const cwd = process.cwd();
  const config = loadConfig(cwd);

  if (!config.apiKey) {
    logger.error('API key not found. Please set the OPENAI_API_KEY environment variable or configure it in ~/.config/commait/config.json');
    return { message: '', action: 'cancel' };
  }

  logger.info('Analyzing staged changes...');
  const diff = execSync('git diff --cached', { cwd, encoding: 'utf-8' });
  const diffFiles = parseDiffFiles(diff);
  const files = diffFiles.map(f => f.filename);

  // Validate that there are actual changes to commit
  const hasChanges = diffFiles.some(file => file.content.length > 0);

  if (!hasChanges) {
    logger.warning('No changes found in staged files');
    logger.info('All staged files have no actual changes (empty or identical to HEAD)');
    logger.info('Use "git add <file>" to stage files with changes, then run "commait commit" again');
    return { message: '', action: 'cancel' };
  }

  logger.info(`Found ${files.length} file(s) with changes to commit`);

  const promptResult = buildPrompt({ config, diff, diffFiles });
  
  logger.thinking('Generating commit message with AI...');
  
  const message = await generateCommitMessage(config, promptResult);
  
  logger.success('Commit message generated!');
  logger.info(message);

  return { message, action: 'accept' };
}

export async function handleCommitHook(cwd: string): Promise<void> {
  const config = loadConfig(cwd);

  if (!config.apiKey) {
    logger.error('API key not found. Please set the OPENAI_API_KEY environment variable or configure it in ~/.config/commait/config.json');
    return;
  }

  try {
    const { message } = await generateCommitMessageHook();

    if (!message || message === 'No significant changes') {
      logger.warning('No commit message generated. Proceeding with empty message.');
      execSync('git commit --allow-empty', { cwd, stdio: 'inherit' });
      return;
    }

    const editPrompt = '\n\nPress Enter to accept or "e" to edit, "r" to regenerate, "q" to quit: ';
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const action = await new Promise<CommitAction>((resolve) => {
      rl.question(editPrompt, (answer: string) => {
        rl.close();
        const ans = answer.toLowerCase().trim();
        
        if (ans === 'e' || ans === 'edit') {
          resolve('edit');
        } else if (ans === 'r' || ans === 'regenerate') {
          resolve('regenerate');
        } else if (ans === 'q' || ans === 'quit' || ans === '') {
          resolve('cancel');
        } else {
          resolve('accept');
        }
      });
    });

    switch (action) {
      case 'accept':
        execSync(`git commit -m "${message}"`, { cwd, stdio: 'inherit' });
        break;

      case 'edit':
        execSync('git commit', { cwd, stdio: 'inherit' });
        break;

      case 'regenerate':
        logger.info('Regenerating commit message...');
        const { message: newMessage } = await generateCommitMessageHook();
        logger.info(newMessage);
        
        const rl2 = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const action2 = await new Promise<CommitAction>((resolve) => {
          rl2.question('Accept (y/n) or edit (e)? ', (answer: string) => {
            rl2.close();
            const ans = answer.toLowerCase().trim();
            
            if (ans === 'y' || ans === 'yes' || ans === '') {
              resolve('accept');
            } else if (ans === 'e' || ans === 'edit') {
              resolve('edit');
            } else {
              resolve('cancel');
            }
          });
        });
        
        if (action2 === 'accept') {
          execSync(`git commit -m "${newMessage}"`, { cwd, stdio: 'inherit' });
        } else if (action2 === 'edit') {
          execSync('git commit', { cwd, stdio: 'inherit' });
        }
        break;

      case 'cancel':
        logger.warning('Commit cancelled.');
        execSync('git reset --mixed', { cwd, stdio: 'inherit' });
        break;
    }
  } catch (error) {
    logger.error(`Failed to generate commit message: ${error instanceof Error ? error.message : error}`);
    logger.info('Proceeding without AI-assisted commit message.');
    execSync('git commit', { cwd, stdio: 'inherit' });
  }
}

export function installGitHook(): void {
  const cwd = process.cwd();

  if (!isGitRepository(cwd)) {
    logger.error('Not a Git repository');
    return;
  }

  const hooksDir = path.join(cwd, '.git', 'hooks');

  if (!fs.existsSync(hooksDir)) {
    logger.error('Git hooks directory not found');
    return;
  }

  const hookPath = path.join(hooksDir, 'prepare-commit-msg');

  if (fs.existsSync(hookPath)) {
    const existingContent = fs.readFileSync(hookPath, 'utf-8');
    const existingHookType = existingContent.includes('prepare-commit-msg') ? 'prepare-commit-msg' : 'commit-msg';
    
    logger.info(`Found existing ${existingHookType} hook. Use --force to overwrite.`);
    
    const force = process.argv.includes('--force');
    if (!force) {
      logger.info('Use "commait install-hook --force" to overwrite existing hook');
      return;
    }
  }

  const hookScript = `#!/bin/bash
# CommAIt Git Hook
# This hook generates AI-assisted commit messages

cd "$(dirname "$0")/.."
node "${path.join(cwd, 'node_modules', '@lerg96', 'commait', 'dist', 'index.js')}" commit`;

  fs.writeFileSync(hookPath, hookScript);
  fs.chmodSync(hookPath, 0o755);

  logger.success('Git hook installed successfully!');
  logger.info('Run "git commit" to use CommAIt');
}

function isGitRepository(cwd: string): boolean {
  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}