#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { program } from 'commander';
import { loadConfig } from './config/index.js';
import { isGitRepository, getStagedDiff, getFileDiff, parseDiffFiles } from './git/index.js';
import { generateCommitMessage } from './ai/client.js';
import { buildPrompt } from './ai/prompt.js';
import { logger } from './utils/logger.js';
import { installGitHook } from './hook/index.js';
import readline from 'node:readline';
import { CommitAction } from './utils/types.js';

program
  .name('commait')
  .description('AI-powered Git commit message generator with emojis')
  .version('1.0.0')
  .option('-p, --project', 'Use project-specific configuration')
  .option('-g, --global', 'Use global configuration only')
  .option('-v, --verbose', 'Show verbose output');

program
  .command('commit')
  .description('Generate commit message from staged changes')
  .option('-m, --message <msg>', 'Use custom message (bypass AI)')
  .action(async (options) => {
    await ensureGitRepo();
    const globalOptions = program.opts();
    await handleCommit({ ...options, verbose: globalOptions.verbose });
  });

program
  .command('generate')
  .description('Generate commit message for specific files or diff')
  .option('-d, --diff <file>', 'Analyze a specific file diff')
  .action(async (options) => {
    await ensureGitRepo();
    const globalOptions = program.opts();
    await handleGenerate({ ...options, verbose: globalOptions.verbose });
  });

program
  .command('install-hook')
  .description('Install CommAIt as a Git hook')
  .option('-f, --force', 'Force overwrite existing hook')
  .action(async (options) => {
    await ensureGitRepo();
    installGitHook();
  });

async function ensureGitRepo() {
  const cwd = process.cwd();
  if (!isGitRepository(cwd)) {
    logger.error('Please run this command inside a Git repository');
    process.exit(1);
  }
}

async function handleCommit(options: any) {
  const config = loadConfig(process.cwd(), options.verbose);

  if (!config.apiKey) {
    logger.error('API key not found. Please set the OPENAI_API_KEY environment variable or configure it in ~/.config/commait/config.json');
    process.exit(1);
  }

  if (options.message) {
    logger.info(`Using custom message: ${options.message}`);
    execSync(`git commit -m "${options.message}"`, { stdio: 'inherit' });
    return;
  }

  const diff = getStagedDiff(process.cwd());
  const diffFiles = parseDiffFiles(diff);
  const files = diffFiles.map(f => f.filename);

  const hasChanges = diffFiles.some(file => file.content.length > 0);

  if (!hasChanges) {
    logger.warning('No changes found in staged files');
    logger.info('Use "git add <file>" to stage files with changes, then run "commait commit" again');
    process.exit(0);
  }

  logger.info(`Found ${files.length} file(s) with changes to commit`);
  logger.info('\nFiles:\n' + files.map(f => `  - ${f}`).join('\n'));

  const promptResult = buildPrompt({ config, diff, diffFiles });
  const message = await generateCommitMessage(config, promptResult);

  logger.success('Commit message generated!');
  logger.info('\n' + message);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const action = await new Promise<CommitAction>((resolve) => {
    rl.question('\nAccept (y/n), edit (e), regenerate (r), or quit (q)? ', (answer) => {
      rl.close();
      const ans = answer.toLowerCase().trim();
      if (ans === 'y' || ans === 'yes' || ans === '') {
        resolve('accept');
      } else if (ans === 'e' || ans === 'edit') {
        resolve('edit');
      } else if (ans === 'r' || ans === 'regenerate') {
        resolve('regenerate');
      } else {
        resolve('cancel');
      }
    });
  });

  switch (action) {
    case 'accept':
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
      break;
    case 'edit':
      execSync('git commit', { stdio: 'inherit' });
      break;
    case 'regenerate':
      logger.info('Regenerating commit message...');
      const newPromptResult = buildPrompt({ config, diff, diffFiles });
      const newMessage = await generateCommitMessage(config, newPromptResult);
      logger.info('\n' + newMessage);

      const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const action2 = await new Promise<'accept' | 'edit' | 'cancel'>((resolve) => {
        rl2.question('Accept (y/n) or edit (e)? ', (answer) => {
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
        execSync(`git commit -m "${newMessage}"`, { stdio: 'inherit' });
      } else if (action2 === 'edit') {
        execSync('git commit', { stdio: 'inherit' });
      }
      break;
    case 'cancel':
      logger.warning('Commit cancelled.');
      break;
  }
}

async function handleGenerate(options: any) {
  const config = loadConfig(process.cwd(), options.verbose);

  if (!config.apiKey) {
    logger.error('API key not found. Please set the OPENAI_API_KEY environment variable or configure it in ~/.config/commait/config.json');
    process.exit(1);
  }

  let diff = '';
  let diffFiles: any[] = [];

  if (options.diff) {
    logger.info(`Analyzing diff for file: ${options.diff}`);
    diff = getFileDiff(process.cwd(), options.diff);
    diffFiles = parseDiffFiles(diff);
  } else {
    logger.info('Analyzing staged changes...');
    diff = getStagedDiff(process.cwd());
    diffFiles = parseDiffFiles(diff);
  }

  if (!diff || diffFiles.length === 0) {
    logger.warning('No changes found to generate a message for');
    return;
  }

  const promptResult = buildPrompt({ config, diff, diffFiles });
  const message = await generateCommitMessage(config, promptResult);

  logger.success('Generated commit message:');
  logger.info('\n' + message);
}

program.parse();
