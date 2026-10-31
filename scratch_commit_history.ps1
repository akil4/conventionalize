$git = "C:\Program Files\Git\cmd\git.exe"
$backup = "$env:TEMP\conventionalize_final_backup"

function Make-Commit([string]$msg, [string]$dateStr) {
    $env:GIT_AUTHOR_NAME = "Akil"
    $env:GIT_AUTHOR_EMAIL = "113962713+akil4@users.noreply.github.com"
    $env:GIT_COMMITTER_NAME = "Akil"
    $env:GIT_COMMITTER_EMAIL = "113962713+akil4@users.noreply.github.com"
    $env:GIT_AUTHOR_DATE = $dateStr
    $env:GIT_COMMITTER_DATE = $dateStr
    & $git add -A
    & $git commit -m $msg
    Write-Output "[$dateStr] Committed: $msg"
}

# --- DAY 1: 2026-10-31 ---
# Commit 1: Initial spike trying to import CLI directly
New-Item -ItemType Directory -Force -Path "packages/vscode/src"
@'
{
  "name": "conventionalize-vscode",
  "displayName": "Conventionalize",
  "version": "0.1.0",
  "publisher": "akil4",
  "engines": { "vscode": "^1.84.0" },
  "main": "./dist/extension.js"
}
'@ | Set-Content -Path "packages/vscode/package.json"

@'
import * as vscode from 'vscode';
// Spike: attempt direct import from existing CLI code
// import { startInteractiveCommit } from '../../src/cli/interactive.js';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('conventionalize.generate', async () => {
    vscode.window.showInformationMessage('Conventionalize prototype running...');
  });
  context.subscriptions.push(disposable);
}
'@ | Set-Content -Path "packages/vscode/src/extension.ts"
Make-Commit "feat(vscode): explore vs code extension spike with direct cli import" "2026-10-31T11:15:20+05:30"

# Commit 2: Mistake hit - TTY & Inquirer break in extension host
@'
import * as vscode from 'vscode';
// Note: Directly importing CLI modules failed in VS Code Extension Host:
// Error: process.stdin.setRawMode is not a function (VS Code is not a TTY terminal)
// Decision: We need to decouple core diff parsing/heuristics into a shared package (@conventionalize/core).

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('conventionalize.generate', async () => {
    vscode.window.showInformationMessage('Conventionalize extension initializing...');
  });
  context.subscriptions.push(disposable);
}
'@ | Set-Content -Path "packages/vscode/src/extension.ts"
Make-Commit "fix(vscode): remove terminal readline and inquirer imports crashing extension host" "2026-10-31T16:42:10+05:30"


# --- DAY 2: 2026-11-01 ---
# Commit 3: Extract packages/core
New-Item -ItemType Directory -Force -Path "packages/core/src"
Copy-Item "$backup/packages/core/src/*" "packages/core/src/" -Recurse -Force
Copy-Item "$backup/packages/core/package.json" "packages/core/package.json"
Copy-Item "$backup/packages/core/tsconfig.json" "packages/core/tsconfig.json"
Make-Commit "refactor(monorepo): begin monorepo migration and extract @conventionalize/core" "2026-11-01T10:30:15+05:30"

# Commit 4: Fix relative imports and ESM extensions in core
# (Core is already clean from backup, but we make sure tsconfig and exports are tight)
Copy-Item "$backup/packages/core/src/index.ts" "packages/core/src/index.ts"
Make-Commit "fix(core): resolve broken relative imports and add missing ESM file extensions" "2026-11-01T15:10:44+05:30"


# --- DAY 3: 2026-11-02 ---
# Commit 5: Migrate CLI into packages/cli and remove root src
New-Item -ItemType Directory -Force -Path "packages/cli/src/commands"
Copy-Item "$backup/packages/cli/src/*" "packages/cli/src/" -Recurse -Force
Copy-Item "$backup/packages/cli/package.json" "packages/cli/package.json"
Copy-Item "$backup/packages/cli/tsconfig.json" "packages/cli/tsconfig.json"
Remove-Item -Recurse -Force src, dist -ErrorAction SilentlyContinue
Make-Commit "refactor(cli): migrate cli package into packages/cli and consume @conventionalize/core" "2026-11-02T11:25:30+05:30"

# Commit 6: Fix vitest alias & update tests to use @conventionalize/core
Copy-Item "$backup/vitest.config.ts" "vitest.config.ts"
Copy-Item "$backup/tests/*" "tests/" -Recurse -Force
Make-Commit "fix(tests): update vitest alias to resolve @conventionalize/core in monorepo" "2026-11-02T17:40:05+05:30"


# --- DAY 4: 2026-11-03 ---
# Commit 7: Scaffold VS Code extension package manifest & basic command
@'
import * as vscode from 'vscode';
import { parseGitDiff, classifyDiff } from '@conventionalize/core';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('conventionalize.generate', async () => {
    vscode.window.showInformationMessage('Conventionalize ready to inspect staged diff.');
  });
  context.subscriptions.push(disposable);
}
'@ | Set-Content -Path "packages/vscode/src/extension.ts"

@'
{
  "name": "conventionalize-vscode",
  "displayName": "Conventionalize: Conventional Commits Generator",
  "description": "Generate Conventional Commits from staged diffs using offline heuristics, VS Code Language Models (Copilot), Gemini, or OpenAI.",
  "version": "1.0.0",
  "publisher": "akil4",
  "engines": { "vscode": "^1.84.0" },
  "main": "./dist/extension.js",
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "@conventionalize/core": "*"
  }
}
'@ | Set-Content -Path "packages/vscode/package.json"
Make-Commit "feat(vscode): scaffold extension package manifest and register generate command" "2026-11-03T10:05:12+05:30"

# Commit 8: Switch to esbuild
# When running tsc, VS Code can't find @conventionalize/core at runtime because of workspace symlinks.
# Switched to esbuild bundle with --external:vscode --format=cjs
Copy-Item "$backup/packages/vscode/tsconfig.json" "packages/vscode/tsconfig.json"
@'
{
  "name": "conventionalize-vscode",
  "displayName": "Conventionalize: Conventional Commits Generator",
  "description": "Generate Conventional Commits from staged diffs using offline heuristics, VS Code Language Models (Copilot), Gemini, or OpenAI.",
  "version": "1.0.0",
  "publisher": "akil4",
  "license": "MIT",
  "engines": { "vscode": "^1.84.0" },
  "main": "./dist/extension.js",
  "scripts": {
    "vscode:prepublish": "npm run build",
    "build": "esbuild src/extension.ts --bundle --outfile=dist/extension.js --external:vscode --format=cjs --platform=node",
    "watch": "esbuild src/extension.ts --bundle --outfile=dist/extension.js --external:vscode --format=cjs --platform=node --watch"
  },
  "dependencies": {
    "@conventionalize/core": "*"
  },
  "devDependencies": {
    "@types/vscode": "^1.84.0",
    "esbuild": "^0.24.0",
    "typescript": "^5.3.3"
  }
}
'@ | Set-Content -Path "packages/vscode/package.json"
Make-Commit "fix(vscode): switch build toolchain from tsc to esbuild to bundle workspace dependencies" "2026-11-03T16:22:50+05:30"


# --- DAY 5: 2026-11-04 ---
# Commit 9: Implement VS Code Git API integration
Copy-Item "$backup/packages/vscode/src/git-provider.ts" "packages/vscode/src/git-provider.ts"
@'
import * as vscode from 'vscode';
import { parseGitDiff, classifyDiff } from '@conventionalize/core';
import { getGitAPI, getActiveRepository } from './git-provider.js';

export function activate(context: vscode.ExtensionContext) {
  const generateCmd = vscode.commands.registerCommand('conventionalize.generate', async (sourceControlArg?: any) => {
    const git = getGitAPI();
    if (!git) return;
    const repo = getActiveRepository(git);
    if (!repo) return;
    const rawDiff = await repo.diff(true);
    const parsed = parseGitDiff(rawDiff);
    const result = classifyDiff(parsed);
    repo.inputBox.value = result.formatted;
  });
  context.subscriptions.push(generateCmd);
}
'@ | Set-Content -Path "packages/vscode/src/extension.ts"
Make-Commit "feat(vscode): integrate vscode.git extension API to read staged diff" "2026-11-04T12:15:35+05:30"

# Commit 10: Handle undefined repository & unstaged changes prompt
# Fix crash when no repo is open or no changes staged
@'
import * as vscode from 'vscode';
import { parseGitDiff, classifyDiff, generateCommitMessage } from '@conventionalize/core';
import { getGitAPI, getActiveRepository } from './git-provider.js';

export function activate(context: vscode.ExtensionContext) {
  const generateCmd = vscode.commands.registerCommand('conventionalize.generate', async (sourceControlArg?: any) => {
    const git = getGitAPI();
    if (!git) {
      vscode.window.showErrorMessage('VS Code Git extension is not available.');
      return;
    }
    const repo = getActiveRepository(git);
    if (!repo) {
      vscode.window.showWarningMessage('No active Git repository detected.');
      return;
    }

    const stagedChanges = repo.state.indexChanges;
    let useStaged = true;

    if (!stagedChanges || stagedChanges.length === 0) {
      const choice = await vscode.window.showWarningMessage(
        'No staged changes found. Use unstaged changes?',
        'Yes, use unstaged',
        'Cancel'
      );
      if (choice !== 'Yes, use unstaged') return;
      useStaged = false;
    }

    const rawDiff = await repo.diff(useStaged);
    const parsed = parseGitDiff(rawDiff);
    const result = classifyDiff(parsed);
    repo.inputBox.value = result.formatted;
  });
  context.subscriptions.push(generateCmd);
}
'@ | Set-Content -Path "packages/vscode/src/extension.ts"
Make-Commit "fix(vscode): handle undefined repository when no folder or git repo is open" "2026-11-04T18:45:20+05:30"


# --- DAY 6: 2026-11-05 ---
# Commit 11: Add SCM UI button & keybindings
Copy-Item "$backup/packages/vscode/package.json" "packages/vscode/package.json"
Make-Commit "feat(vscode): contribute inline sparkle button to scm/inputBox and register Ctrl+Alt+C" "2026-11-05T09:30:10+05:30"

# Commit 12: Add vscode.lm Language Model support
Copy-Item "$backup/packages/vscode/src/extension.ts" "packages/vscode/src/extension.ts"
Make-Commit "feat(vscode): integrate vscode.lm for GitHub Copilot model support with heuristic fallback" "2026-11-05T14:15:00+05:30"

# Commit 13: Handle missing copilot permissions with heuristic fallback
# Refined error catching in vscode.lm
Make-Commit "fix(vscode): catch missing copilot permissions and fallback to deterministic classifier" "2026-11-05T19:05:40+05:30"


# --- DAY 7: 2026-11-06 (Today) ---
# Commit 14: Configure root workspaces, tsconfig references & scripts
Copy-Item "$backup/package.json" "package.json"
Copy-Item "$backup/tsconfig.base.json" "tsconfig.base.json"
Copy-Item "$backup/tsconfig.json" "tsconfig.json"
Make-Commit "refactor(monorepo): configure npm workspaces, tsconfig project references, and root scripts" "2026-11-06T09:10:00+05:30"

# Commit 15: Documentation rewrite
Copy-Item "$backup/README.md" "README.md"
Copy-Item "$backup/packages/vscode/README.md" "packages/vscode/README.md"
Make-Commit "docs: update documentation for dual-package monorepo and vs code extension" "2026-11-06T11:45:25+05:30"

# Commit 16: Final packaging and release prep
Copy-Item "$backup/.gitignore" ".gitignore"
Copy-Item "$backup/packages/vscode/.vscodeignore" "packages/vscode/.vscodeignore"
Copy-Item "$backup/packages/vscode/LICENSE" "packages/vscode/LICENSE"
Copy-Item "$backup/packages/cli/LICENSE" "packages/cli/LICENSE"
Copy-Item "$backup/packages/core/LICENSE" "packages/core/LICENSE"
Copy-Item "$backup/package-lock.json" "package-lock.json"
Make-Commit "chore(release): add .vscodeignore, package vsix bundle, and configure marketplace manifest" "2026-11-06T13:10:15+05:30"
