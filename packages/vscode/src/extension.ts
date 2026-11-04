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
