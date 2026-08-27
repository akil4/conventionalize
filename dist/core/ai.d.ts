import { ConfigOptions, CommitMessage, ParsedDiff } from '../types/index.js';
export declare function generateCommitMessage(diff: ParsedDiff, config: ConfigOptions): Promise<CommitMessage>;
