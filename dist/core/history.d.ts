import { CommitMessage, LoggedCommit, UserHistoryStore } from '../types/index.js';
export declare function getHistoryPath(): string;
export declare function getHistory(filePath?: string): UserHistoryStore;
export declare function saveHistory(store: UserHistoryStore, filePath?: string): void;
export declare function logCommit(commit: CommitMessage, repoName: string, repoPath: string, filesChanged: number, additions: number, deletions: number, filePath?: string): LoggedCommit;
export declare function getCommitStats(commits: LoggedCommit[]): {
    totalCommits: number;
    byType: Record<string, number>;
    totalAdditions: number;
    totalDeletions: number;
    totalFiles: number;
};
export declare function exportChangelog(commits: LoggedCommit[]): string;
