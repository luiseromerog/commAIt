import { execFileSync } from 'node:child_process';
import { DiffFile } from '../utils/types.js';
import { logger } from '../utils/logger.js';

export function isGitRepository(cwd: string): boolean {
  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function getStagedDiff(cwd: string): string {
  try {
    return execFileSync('git', ['diff', '--cached', '--'], { cwd, encoding: 'utf-8' });
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status !== 0) {
      logger.error('No files are staged for commit');
      return '';
    }
    throw error;
  }
}

export function getFileDiff(cwd: string, filePath: string): string {
  try {
    // Try staged first, then unstaged
    let diff = execFileSync('git', ['diff', '--cached', '--', filePath], { cwd, encoding: 'utf-8' });
    if (!diff) {
      diff = execFileSync('git', ['diff', '--', filePath], { cwd, encoding: 'utf-8' });
    }
    return diff;
  } catch (error) {
    logger.error(`Error getting diff for file ${filePath}`);
    return '';
  }
}

export function filterDiff(diff: string, filters: string[]): string {
  const filteredLines: string[] = [];
  const shouldExclude = new Set<string>();

  const defaultFilters = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'package.json',
    '*.svg',
    '*.min.js',
    '*.min.css',
    '*.map',
    'CHANGELOG.md',
    '.gitignore',
    '.editorconfig',
    '.DS_Store',
    'Thumbs.db',
  ];
  const allFilters = [...defaultFilters, ...filters];
  
  const lines = diff.split('\n');
  
  const maxContext = 1000;
  let filteredLineCount = 0;
  
  // Basic filtering implementation
  for (const line of lines) {
    let skip = false;
    for (const filter of allFilters) {
      if (filter.startsWith('*')) {
        if (line.includes(filter.slice(1))) {
          skip = true;
          break;
        }
      } else if (line.includes(filter)) {
        skip = true;
        break;
      }
    }
    
    if (!skip) {
      filteredLines.push(line);
    } else {
      filteredLineCount++;
    }
  }

  if (filteredLines.length > maxContext) {
    filteredLines.length = maxContext;
  }

  return filteredLines.join('\n');
}

export function parseDiffFiles(diff: string): DiffFile[] {
  const files: DiffFile[] = [];
  if (!diff) return files;

  const sections = diff.split('diff --git ');
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    const lines = section.split('\n');
    const header = lines[0];
    
    // Extract filename from "a/path/to/file b/path/to/file"
    // Handle filenames with spaces by looking for the " b/" marker
    const match = header.match(/^a\/(.+?) b\/(.+)$/);
    if (!match) continue;
    
    const filename = match[2];
    
    let status: 'added' | 'modified' | 'deleted' = 'modified';
    if (section.includes('new file mode')) status = 'added';
    if (section.includes('deleted file mode')) status = 'deleted';
    
    const content = lines.filter(l => l.startsWith('+') || l.startsWith('-'));
    
    files.push({
      filename,
      status,
      content
    });
  }

  return files;
}
