import * as vscode from 'vscode';

export interface GitExtension {
  getAPI(version: 1): GitAPI;
}

export interface GitAPI {
  repositories: Repository[];
  getRepository(uri: vscode.Uri): Repository | null;
}

export interface Repository {
  rootUri: vscode.Uri;
  inputBox: {
    value: string;
  };
  state: {
    indexChanges: Change[];
    workingTreeChanges: Change[];
  };
  diff(staged?: boolean): Promise<string>;
  commit(message: string): Promise<void>;
}

export interface Change {
  uri: vscode.Uri;
  status: number;
}

export function getGitAPI(): GitAPI | undefined {
  const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git');
  if (!gitExtension) {
    return undefined;
  }
  return gitExtension.exports.getAPI(1);
}

export function getActiveRepository(git: GitAPI, sourceControlUri?: vscode.Uri): Repository | undefined {
  if (sourceControlUri) {
    const repo = git.getRepository(sourceControlUri);
    if (repo) return repo;
  }

  // Active text editor workspace repository
  if (vscode.window.activeTextEditor) {
    const docUri = vscode.window.activeTextEditor.document.uri;
    const repo = git.getRepository(docUri);
    if (repo) return repo;
  }

  // Default to the first open repository
  return git.repositories[0];
}
