import { CommitMessage, ConfigOptions, ParsedDiff } from '../types/index.js';
export declare function startInteractiveCommit(diff: ParsedDiff, initialCommit: CommitMessage, config: ConfigOptions): Promise<void>;
