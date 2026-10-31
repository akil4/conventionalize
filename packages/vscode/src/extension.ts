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
