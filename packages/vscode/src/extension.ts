import * as vscode from 'vscode';
import {
  parseGitDiff,
  classifyDiff,
  generateCommitMessage,
  parseRawLLMResponse,
  ConfigOptions,
} from '@conventionalize/core';
import { getGitAPI, getActiveRepository, Repository } from './git-provider.js';

export function activate(context: vscode.ExtensionContext) {
  // Command 1: Generate commit message into SCM input box
  const generateCmd = vscode.commands.registerCommand(
    'conventionalize.generate',
    async (sourceControlArg?: any) => {
      await handleGenerateCommit(sourceControlArg, false);
    }
  );

  // Command 2: Generate commit message and execute commit immediately
  const generateAndCommitCmd = vscode.commands.registerCommand(
    'conventionalize.generateAndCommit',
    async (sourceControlArg?: any) => {
      await handleGenerateCommit(sourceControlArg, true);
    }
  );

  // Command 3: Open Conventionalize settings
  const openSettingsCmd = vscode.commands.registerCommand('conventionalize.openSettings', () => {
    vscode.commands.executeCommand('workbench.action.openSettings', 'conventionalize');
  });

  context.subscriptions.push(generateCmd, generateAndCommitCmd, openSettingsCmd);
}

export function deactivate() {}

async function handleGenerateCommit(sourceControlArg: any, shouldCommitImmediately: boolean) {
  const git = getGitAPI();
  if (!git) {
    vscode.window.showErrorMessage('VS Code Git extension is not active or available.');
    return;
  }

  const targetUri = sourceControlArg?.rootUri || sourceControlArg?._rootUri;
  const repo = getActiveRepository(git, targetUri);

  if (!repo) {
    vscode.window.showWarningMessage('No active Git repository detected in the current workspace.');
    return;
  }

  // Check staged changes
  const stagedChanges = repo.state.indexChanges;
  let useStaged = true;

  if (!stagedChanges || stagedChanges.length === 0) {
    const workingTreeChanges = repo.state.workingTreeChanges;
    if (!workingTreeChanges || workingTreeChanges.length === 0) {
      vscode.window.showInformationMessage('No changes detected in repository (staged or unstaged).');
      return;
    }

    const choice = await vscode.window.showWarningMessage(
      'No staged changes found. Would you like to generate from unstaged changes?',
      'Yes, use unstaged',
      'Cancel'
    );
    if (choice !== 'Yes, use unstaged') {
      return;
    }
    useStaged = false;
  }

  // Configuration options
  const vsConfig = vscode.workspace.getConfiguration('conventionalize');
  const provider = vsConfig.get<'heuristic' | 'vscode-lm' | 'gemini' | 'openai'>('provider') || 'heuristic';
  const apiKey =
    provider === 'gemini'
      ? vsConfig.get<string>('geminiApiKey')
      : provider === 'openai'
      ? vsConfig.get<string>('openaiApiKey')
      : undefined;
  const model = vsConfig.get<string>('model');
  const ticketPrefix = vsConfig.get<string>('ticketPrefix');
  const defaultScope = vsConfig.get<string>('defaultScope');
  const includeBody = vsConfig.get<boolean>('includeBody') ?? false;
  const autoCommitConfig = vsConfig.get<boolean>('autoCommit') ?? false;
  const maxDiffChars = vsConfig.get<number>('maxDiffChars') ?? 6000;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Conventionalize: Analyzing git diff...',
      cancellable: false,
    },
    async (progress) => {
      try {
        progress.report({ message: 'Reading diff patch...' });
        const rawDiff = await repo.diff(useStaged);
        const parsedDiff = parseGitDiff(rawDiff);

        if (parsedDiff.files.length === 0) {
          vscode.window.showWarningMessage('Empty diff returned from git.');
          return;
        }

        let formattedMessage = '';

        // Provider 1: Built-in VS Code Language Model (GitHub Copilot integration)
        if (provider === 'vscode-lm') {
          progress.report({ message: 'Querying VS Code Language Model...' });
          formattedMessage = await generateWithVSCodeLM(parsedDiff, ticketPrefix, maxDiffChars);
        } else {
          // Provider 2, 3, 4: Heuristic or Gemini or OpenAI via core engine
          progress.report({ message: `Generating message (${provider})...` });
          const coreConfig: ConfigOptions = {
            provider,
            apiKey,
            model,
            ticketPrefix,
            defaultScope,
            includeBody,
            maxDiffChars,
            maxSummaryLength: 72,
            autoCopy: false,
          };

          const result = await generateCommitMessage(parsedDiff, coreConfig);
          formattedMessage = result.formatted;
        }

        if (includeBody && parsedDiff.files.length > 0) {
          const body =
            `\n\nChanged ${parsedDiff.changedFilesCount} file(s) (+${parsedDiff.totalAdditions}/-${parsedDiff.totalDeletions}):\n` +
            parsedDiff.files.map((f) => `- ${f.status}: ${f.filename}`).join('\n');
          formattedMessage += body;
        }

        // Populate VS Code Source Control input box!
        repo.inputBox.value = formattedMessage;

        const doCommit = shouldCommitImmediately || autoCommitConfig;
        if (doCommit) {
          progress.report({ message: 'Committing staged changes...' });
          await repo.commit(formattedMessage);
          vscode.window.showInformationMessage(`✔ Committed: "${formattedMessage.split('\n')[0]}"`);
        } else {
          vscode.window.showInformationMessage(`✔ Suggested: "${formattedMessage.split('\n')[0]}"`);
        }
      } catch (err) {
        vscode.window.showErrorMessage(`Conventionalize error: ${(err as Error).message}`);
      }
    }
  );
}

async function generateWithVSCodeLM(
  diff: any,
  ticketPrefix?: string,
  maxDiffChars = 6000
): Promise<string> {
  // Check if vscode.lm API is available in this VS Code runtime
  if (typeof (vscode as any).lm?.selectChatModels !== 'function') {
    const fallback = classifyDiff(diff, ticketPrefix);
    return fallback.formatted;
  }

  try {
    const models = await (vscode as any).lm.selectChatModels();
    if (!models || models.length === 0) {
      const fallback = classifyDiff(diff, ticketPrefix);
      return fallback.formatted;
    }

    const selectedModel = models[0];
    const prompt =
      'You are a Git commit expert. Generate a single-line Conventional Commit header ' +
      '(type(scope): concise subject) based on this git diff:\n\n' +
      diff.rawDiff.slice(0, maxDiffChars);

    const messages = [vscode.LanguageModelChatMessage.User(prompt)];
    const response = await selectedModel.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);

    let rawText = '';
    for await (const fragment of response.text) {
      rawText += fragment;
    }

    const parsed = parseRawLLMResponse(rawText.trim(), diff, ticketPrefix);
    return parsed.formatted;
  } catch {
    const fallback = classifyDiff(diff, ticketPrefix);
    return fallback.formatted;
  }
}
