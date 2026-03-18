import chalk from 'chalk';

export const logger = {
  info: (message: string) => {
    console.log(chalk.cyan(`[CommAIt] ${message}`));
  },

  success: (message: string) => {
    console.log(chalk.green(`✓ ${message}`));
  },

  warning: (message: string) => {
    console.log(chalk.yellow(`⚠ ${message}`));
  },

  error: (message: string) => {
    console.log(chalk.red(`✗ ${message}`));
  },

  diff: (message: string) => {
    console.log(chalk.gray(`• ${message}`));
  },

  thinking: (message: string) => {
    console.log(chalk.magenta(`✨ ${message}`));
  },
};