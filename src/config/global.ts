import fs from 'fs';
import path from 'path';
import { Config } from '../utils/types.js';
import { INTERNAL_DEFAULTS } from './defaults.js';

export const GLOBAL_CONFIG_PATH = path.join(
  process.env.HOME || '',
  '.config',
  'commait',
  'config.json'
);

export function loadGlobalConfig(): Config {
  try {
    let envApiKey = process.env.OPENAI_API_KEY;
    
    if (!fs.existsSync(GLOBAL_CONFIG_PATH)) {
      return {
        ...INTERNAL_DEFAULTS,
        apiKey: envApiKey || INTERNAL_DEFAULTS.apiKey,
      };
    }

    const configFileContent = fs.readFileSync(GLOBAL_CONFIG_PATH, 'utf-8');
    const userGlobalConfig = JSON.parse(configFileContent);
    
    // Merge Strategy: Internal -> Global Config File
    const merged: Config = {
      ...INTERNAL_DEFAULTS,
      ...userGlobalConfig,
    };

    // Environment variables take precedence over config files for secrets
    if (envApiKey) {
      merged.apiKey = envApiKey;
    }

    return merged;
  } catch (error) {
    console.error('Error loading global config:', error);
    return INTERNAL_DEFAULTS;
  }
}

export function ensureGlobalConfigDir(): void {
  const dir = path.dirname(GLOBAL_CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
