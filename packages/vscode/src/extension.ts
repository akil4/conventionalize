import * as vscode from 'vscode';
// Spike: attempt direct import from existing CLI code
// import { startInteractiveCommit } from '../../src/cli/interactive.js';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('conventionalize.generate', async () => {
    vscode.window.showInformationMessage('Conventionalize prototype running...');
  });
  context.subscriptions.push(disposable);
}
