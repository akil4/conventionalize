import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function installGitHook(cwd = process.cwd()): { success: boolean; message: string } {
  try {
    const gitDir = execSync('git rev-parse --git-dir', { cwd, encoding: 'utf8' }).trim();
    const hooksDir = path.join(gitDir, 'hooks');

    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    const hookFile = path.join(hooksDir, 'prepare-commit-msg');

    const hookContent = `#!/bin/sh
# GitCommit AI prepare-commit-msg hook
COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Only run if user didn't specify message via -m or template
if [ -z "$COMMIT_SOURCE" ]; then
  npx gcai --raw > "$COMMIT_MSG_FILE.tmp" 2>/dev/null
  if [ -s "$COMMIT_MSG_FILE.tmp" ]; then
    cat "$COMMIT_MSG_FILE.tmp" > "$COMMIT_MSG_FILE"
  fi
  rm -f "$COMMIT_MSG_FILE.tmp"
fi
`;

    fs.writeFileSync(hookFile, hookContent, { mode: 0o755 });
    return { success: true, message: `Installed prepare-commit-msg hook at ${hookFile}` };
  } catch (err) {
    return { success: false, message: `Failed to install git hook: ${(err as Error).message}` };
  }
}

export function uninstallGitHook(cwd = process.cwd()): { success: boolean; message: string } {
  try {
    const gitDir = execSync('git rev-parse --git-dir', { cwd, encoding: 'utf8' }).trim();
    const hookFile = path.join(gitDir, 'hooks', 'prepare-commit-msg');

    if (fs.existsSync(hookFile)) {
      fs.unlinkSync(hookFile);
      return { success: true, message: `Removed git hook at ${hookFile}` };
    }
    return { success: true, message: 'No git hook was installed.' };
  } catch (err) {
    return { success: false, message: `Failed to uninstall git hook: ${(err as Error).message}` };
  }
}
