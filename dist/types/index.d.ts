export type ConventionalCommitType = 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'build' | 'ci' | 'chore' | 'revert';
export interface FileDiff {
    filename: string;
    status: 'added' | 'modified' | 'deleted' | 'renamed';
    additions: number;
    deletions: number;
    patch: string;
}
export interface ParsedDiff {
    files: FileDiff[];
    totalAdditions: number;
    totalDeletions: number;
    changedFilesCount: number;
    rawDiff: string;
}
export interface CommitMessage {
    type: ConventionalCommitType;
    scope?: string;
    isBreaking: boolean;
    subject: string;
    body?: string;
    breakingMessage?: string;
    formatted: string;
}
export interface ConfigOptions {
    apiKey?: string;
    provider: 'heuristic' | 'openai' | 'gemini' | 'ollama';
    model?: string;
    defaultScope?: string;
    ticketPrefix?: string;
    maxSummaryLength: number;
    maxDiffChars: number;
    autoCopy: boolean;
    includeBody: boolean;
    debug?: boolean;
    customTypeRules?: Record<string, string[]>;
}
export interface LoggedCommit {
    id: string;
    repoName: string;
    repoPath: string;
    timestamp: string;
    type: ConventionalCommitType;
    scope?: string;
    subject: string;
    formatted: string;
    filesChanged: number;
    additions: number;
    deletions: number;
}
export interface UserHistoryStore {
    commits: LoggedCommit[];
}
