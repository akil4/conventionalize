import { FileDiff, ParsedDiff } from './types.js';

export function parseGitDiff(rawDiff: string): ParsedDiff {
  if (!rawDiff || !rawDiff.trim()) {
    return {
      files: [],
      totalAdditions: 0,
      totalDeletions: 0,
      changedFilesCount: 0,
      rawDiff: '',
    };
  }

  const files: FileDiff[] = [];
  let totalAdditions = 0;
  let totalDeletions = 0;

  const rawFileDiffs = rawDiff.split(/^diff --git /m).filter(Boolean);

  for (const rawFileDiff of rawFileDiffs) {
    const lines = rawFileDiff.split('\n');
    const headerLine = lines[0] || '';
    const match = headerLine.match(/a\/(.+) b\/(.+)/);
    const filename = match ? match[2] : headerLine.split(' ').pop() || 'unknown';

    let status: 'added' | 'modified' | 'deleted' | 'renamed' = 'modified';
    if (rawFileDiff.includes('new file mode')) {
      status = 'added';
    } else if (rawFileDiff.includes('deleted file mode')) {
      status = 'deleted';
    } else if (rawFileDiff.includes('similarity index')) {
      status = 'renamed';
    }

    let additions = 0;
    let deletions = 0;

    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        additions++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        deletions++;
      }
    }

    totalAdditions += additions;
    totalDeletions += deletions;

    files.push({
      filename,
      status,
      additions,
      deletions,
      patch: rawFileDiff,
    });
  }

  return {
    files,
    totalAdditions,
    totalDeletions,
    changedFilesCount: files.length,
    rawDiff,
  };
}
