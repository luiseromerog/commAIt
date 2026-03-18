import fs from 'fs';
import path from 'path';
import { ProjectConfig } from '../utils/types.js';

export function getProjectConfigPath(cwd: string): string {
  return path.join(cwd, '.commait.json');
}

export function loadProjectConfig(cwd: string): ProjectConfig & { configPath?: string } {
  const configPath = getProjectConfigPath(cwd);

  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return { ...(config as ProjectConfig), configPath };
  } catch (error) {
    console.error('Error loading project config:', error);
    return {};
  }
}