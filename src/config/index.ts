import { loadGlobalConfig, ensureGlobalConfigDir, GLOBAL_CONFIG_PATH } from './global.js';
import { loadProjectConfig, getProjectConfigPath } from './local.js';
import { Config } from '../utils/types.js';
import { logger } from '../utils/logger.js';
import fs from 'node:fs';

/**
 * Final configuration loader that follows the merge strategy:
 * 1. Internal Defaults (already handled by loadGlobalConfig)
 * 2. Global Config (~/.config/commait/config.json)
 * 3. Project Config (.commait.json)
 */
export function loadConfig(cwd: string, verbose?: boolean): Config {
  ensureGlobalConfigDir();
  
  // Stages 1 & 2: Internal Defaults + Global File
  const globalMerged = loadGlobalConfig();
  
  // Stage 3: Project File
  const projectConfig = loadProjectConfig(cwd);

  const projectPrompt = projectConfig.prompt;
  const projectFilters = projectConfig.filters;

  // Final Merge: Global result -> Project overrides
  const finalConfig: Config = {
    ...globalMerged,
    ...projectConfig,
    // Special handling for prompt/systemPrompt aliases
    systemPrompt: projectPrompt || globalMerged.systemPrompt,
    // Merge filters if needed, or just override? The user said "overwriting solo los que estan seteados"
    // Usually filters are additive, but I'll stick to override if provided in project.
    filters: projectFilters || globalMerged.filters,
    verbose: verbose || false,
  };

  if (verbose) {
    logger.info(`[Verbose] Loading configuration...`);
    logger.info(`[Verbose] Global config path: ${GLOBAL_CONFIG_PATH} (${fs.existsSync(GLOBAL_CONFIG_PATH) ? 'found' : 'not found'})`);
    const projectPath = getProjectConfigPath(cwd);
    logger.info(`[Verbose] Project config path: ${projectPath} (${fs.existsSync(projectPath) ? 'found' : 'not found'})`);
    
    const source = projectPrompt ? 'project' : (fs.existsSync(GLOBAL_CONFIG_PATH) ? 'global' : 'default');
    logger.info(`[Verbose] Using system prompt from: ${source}`);
  }

  return finalConfig;
}
