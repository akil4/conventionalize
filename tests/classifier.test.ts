import { describe, it, expect } from 'vitest';
import { classifyDiff, inferScope, ParsedDiff } from '@conventionalize/core';

describe('inferScope', () => {
  it('extracts folder name as scope from standard src structure', () => {
    expect(inferScope(['src/core/parser.ts'])).toBe('core');
    expect(inferScope(['src/utils/helpers.ts', 'src/utils/string.ts'])).toBe('utils');
  });

  it('extracts top-level module name for package files', () => {
    expect(inferScope(['packages/ui/Button.tsx'])).toBe('ui');
  });

  it('returns undefined if files span multiple unrelated scopes', () => {
    expect(inferScope(['src/core/parser.ts', 'src/cli/index.ts', 'docs/README.md'])).toBeUndefined();
  });
});

describe('classifyDiff', () => {
  it('classifies test files as test type', () => {
    const mockDiff: ParsedDiff = {
      files: [
        {
          filename: 'tests/parser.test.ts',
          status: 'added',
          additions: 20,
          deletions: 0,
          patch: '+++ b/tests/parser.test.ts\n+ describe("test", () => {})',
        },
      ],
      totalAdditions: 20,
      totalDeletions: 0,
      changedFilesCount: 1,
      rawDiff: '+++ b/tests/parser.test.ts\n+ describe("test", () => {})',
    };

    const commit = classifyDiff(mockDiff);
    expect(commit.type).toBe('test');
    expect(commit.formatted.startsWith('test')).toBe(true);
  });

  it('classifies documentation changes as docs type', () => {
    const mockDiff: ParsedDiff = {
      files: [
        {
          filename: 'README.md',
          status: 'modified',
          additions: 10,
          deletions: 2,
          patch: '+++ b/README.md\n+ # Documentation',
        },
      ],
      totalAdditions: 10,
      totalDeletions: 2,
      changedFilesCount: 1,
      rawDiff: '+++ b/README.md\n+ # Documentation',
    };

    const commit = classifyDiff(mockDiff);
    expect(commit.type).toBe('docs');
    expect(commit.formatted).toContain('docs:');
  });

  it('classifies bug fixes correctly', () => {
    const mockDiff: ParsedDiff = {
      files: [
        {
          filename: 'src/core/parser.ts',
          status: 'modified',
          additions: 5,
          deletions: 2,
          patch: '+++ b/src/core/parser.ts\n- if (err) throw err;\n+ if (err) return handleFix(err);',
        },
      ],
      totalAdditions: 5,
      totalDeletions: 2,
      changedFilesCount: 1,
      rawDiff: 'fix null pointer exception error in diff parser',
    };

    const commit = classifyDiff(mockDiff);
    expect(commit.type).toBe('fix');
    expect(commit.scope).toBe('core');
    expect(commit.formatted).toContain('fix(core):');
  });

  it('classifies new features when files are added', () => {
    const mockDiff: ParsedDiff = {
      files: [
        {
          filename: 'src/services/auth.ts',
          status: 'added',
          additions: 50,
          deletions: 0,
          patch: '+++ b/src/services/auth.ts\n+ export function loginUser() {}',
        },
      ],
      totalAdditions: 50,
      totalDeletions: 0,
      changedFilesCount: 1,
      rawDiff: 'add new login functionality and token validation',
    };

    const commit = classifyDiff(mockDiff);
    expect(commit.type).toBe('feat');
    expect(commit.scope).toBe('services');
  });

  it('detects breaking changes correctly', () => {
    const mockDiff: ParsedDiff = {
      files: [
        {
          filename: 'src/api.ts',
          status: 'modified',
          additions: 5,
          deletions: 10,
          patch: 'BREAKING CHANGE: remove deprecated v1 API endpoint',
        },
      ],
      totalAdditions: 5,
      totalDeletions: 10,
      changedFilesCount: 1,
      rawDiff: 'BREAKING CHANGE: remove deprecated v1 API endpoint',
    };

    const commit = classifyDiff(mockDiff);
    expect(commit.isBreaking).toBe(true);
    expect(commit.formatted).toContain('!');
    expect(commit.formatted).toContain('BREAKING CHANGE:');
  });
});
