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
