import * as vscode from 'vscode';
import { parseGitDiff, classifyDiff } from '@conventionalize/core';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('conventionalize.generate', async () => {
    vscode.window.showInformationMessage('Conventionalize ready to inspect staged diff.');
  });
  context.subscriptions.push(disposable);
}
