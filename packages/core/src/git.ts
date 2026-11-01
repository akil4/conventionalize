import { execSync } from 'child_process';
import { parseGitDiff } from './parser.js';
import { ParsedDiff } from './types.js';
import { MAX_GIT_BUFFER_BYTES } from './constants.js';

export function isGitRepository(cwd = process.cwd()): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function getStagedDiff(cwd = process.cwd()): ParsedDiff {
  try {
    const rawDiff = execSync('git diff --staged', {
      cwd,
      encoding: 'utf8',
      maxBuffer: MAX_GIT_BUFFER_BYTES,
    });
    return parseGitDiff(rawDiff);
  } catch (error) {
    throw new Error(`Failed to read staged git diff: ${(error as Error).message}`);
  }
}

export function getUnstagedDiff(cwd = process.cwd()): ParsedDiff {
  try {
    const rawDiff = execSync('git diff', {
      cwd,
      encoding: 'utf8',
      maxBuffer: MAX_GIT_BUFFER_BYTES,
    });
    return parseGitDiff(rawDiff);
  } catch (error) {
    throw new Error(`Failed to read unstaged git diff: ${(error as Error).message}`);
  }
}

export function executeCommit(commitMessage: string, cwd = process.cwd()): void {
  try {
    execSync('git commit -m ' + JSON.stringify(commitMessage), {
      cwd,
      stdio: 'inherit',
    });
  } catch (error) {
    throw new Error(`Git commit failed: ${(error as Error).message}`);
  }
}

export function getRepoInfo(cwd = process.cwd()): { name: string; path: string } {
  try {
    const repoPath = execSync('git rev-parse --show-toplevel', { cwd, encoding: 'utf8' }).trim();
    const parts = repoPath.split(/[\/\\]/);
    const name = parts[parts.length - 1] || 'unknown-repo';
    return { name, path: repoPath };
  } catch {
    return { name: 'current-repo', path: cwd };
  }
}
