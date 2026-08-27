import { ParsedDiff } from '../types/index.js';
export declare function isGitRepository(cwd?: string): boolean;
export declare function getStagedDiff(cwd?: string): ParsedDiff;
export declare function getUnstagedDiff(cwd?: string): ParsedDiff;
export declare function executeCommit(commitMessage: string, cwd?: string): void;
export declare function getRepoInfo(cwd?: string): {
    name: string;
    path: string;
};
