import { CommitMessage, ConventionalCommitType, ParsedDiff } from '../types/index.js';

export function inferScope(filenames: string[]): string | undefined {
  if (!filenames || filenames.length === 0) return undefined;

  const scopes = new Set<string>();

  for (const file of filenames) {
    const parts = file.split(/[\/\\]/);
    if (parts.length > 1) {
      if (parts[0] === 'src' || parts[0] === 'lib' || parts[0] === 'app') {
        if (parts.length > 2) {
          scopes.add(parts[1]);
        }
      } else if (parts[0] === 'packages' || parts[0] === 'apps') {
        if (parts.length > 2) {
          scopes.add(parts[1]);
        }
      } else if (parts[0] === 'tests' || parts[0] === 'test') {
        scopes.add('test');
      } else {
        scopes.add(parts[0]);
      }
    }
  }

  if (scopes.size === 1) {
    return Array.from(scopes)[0];
  }

  return undefined;
}

export function classifyDiff(diff: ParsedDiff, ticketPrefix?: string): CommitMessage {
  const filenames = diff.files.map((f) => f.filename);
  const rawLower = diff.rawDiff.toLowerCase();

  const isBreaking =
    rawLower.includes('breaking change:') ||
    rawLower.includes('breaking:') ||
    rawLower.includes('breaking-change');

  let breakingMessage: string | undefined = undefined;
  if (isBreaking) {
    const match = diff.rawDiff.match(/BREAKING CHANGE:\s*(.+)/i);
    breakingMessage = match ? match[1].trim() : 'Contains breaking API or architectural changes';
  }

  let type: ConventionalCommitType = 'chore';
  let subject = 'update files';

  const isAllTests = filenames.length > 0 && filenames.every(
    (f) => f.includes('test') || f.includes('spec') || f.startsWith('tests/')
  );
  if (isAllTests || rawLower.includes('describe(') || rawLower.includes('it(') || rawLower.includes('expect(')) {
    type = 'test';
    const mainTestFile = filenames[0] || 'test';
    subject = `add/update tests for ${mainTestFile.replace(/^.*[\\\/]/, '')}`;
  } else if (
    filenames.length > 0 &&
    filenames.every((f) => f.endsWith('.md') || f.endsWith('.txt') || f.startsWith('docs/'))
  ) {
    type = 'docs';
    const docFile = filenames[0] || 'documentation';
    subject = `update ${docFile.replace(/^.*[\\\/]/, '')} documentation`;
  } else if (filenames.some((f) => f.startsWith('.github/') || f.includes('docker') || f.includes('.ci'))) {
    type = 'ci';
    subject = 'update continuous integration workflows';
  } else if (
    filenames.some(
      (f) =>
        f.endsWith('package.json') ||
        f.endsWith('tsconfig.json') ||
        f.endsWith('pnpm-lock.yaml') ||
        f.endsWith('package-lock.json') ||
        f.endsWith('vitest.config.ts')
    )
  ) {
    type = 'build';
    subject = 'update dependencies and build configuration';
  } else if (
    rawLower.includes('fix') ||
    rawLower.includes('bug') ||
    rawLower.includes('error') ||
    rawLower.includes('handlefix') ||
    rawLower.includes('null pointer') ||
    rawLower.includes('exception')
  ) {
    type = 'fix';
    const targetFile = filenames[0] ? filenames[0].replace(/^.*[\\\/]/, '') : 'component';
    subject = `resolve issue in ${targetFile}`;
  } else if (diff.files.some((f) => f.status === 'added') || diff.totalAdditions > diff.totalDeletions * 2) {
    type = 'feat';
    const addedFile = diff.files.find((f) => f.status === 'added')?.filename || filenames[0] || 'feature';
    const cleanName = addedFile.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, '');
    subject = `implement ${cleanName} functionality`;
  } else if (diff.totalAdditions > 0 && diff.totalDeletions > 0) {
    type = 'refactor';
    const refactoredFile = filenames[0] ? filenames[0].replace(/^.*[\\\/]/, '') : 'modules';
    subject = `refactor and optimize ${refactoredFile}`;
  } else {
    type = 'chore';
    subject = `maintain repository files (${diff.changedFilesCount} files changed)`;
  }

  if (ticketPrefix && ticketPrefix.trim()) {
    const cleanTicket = ticketPrefix.trim().toUpperCase();
    subject = `[${cleanTicket}] ${subject}`;
  }

  const scope = inferScope(filenames);
  const formattedScope = scope ? `(${scope})` : '';
  const breakingBang = isBreaking ? '!' : '';

  const header = `${type}${formattedScope}${breakingBang}: ${subject}`;
  let formatted = header;
  let body: string | undefined = undefined;

  if (diff.files.length > 0) {
    body = `Changed ${diff.changedFilesCount} file(s) with ${diff.totalAdditions} addition(s) and ${diff.totalDeletions} deletion(s).\nFiles:\n` +
      diff.files.map((f) => `- ${f.status}: ${f.filename} (+${f.additions}/-${f.deletions})`).join('\n');
  }

  if (isBreaking && breakingMessage) {
    formatted += `\n\nBREAKING CHANGE: ${breakingMessage}`;
  }

  return {
    type,
    scope,
    isBreaking,
    subject,
    body,
    breakingMessage,
    formatted,
  };
}
