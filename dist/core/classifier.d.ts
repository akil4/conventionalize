import { CommitMessage, ParsedDiff } from '../types/index.js';
export declare function inferScope(filenames: string[]): string | undefined;
export declare function classifyDiff(diff: ParsedDiff, ticketPrefix?: string): CommitMessage;
