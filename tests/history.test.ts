import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  logCommit,
  getHistory,
  getCommitStats,
  exportChangelog,
  CommitMessage,
  LoggedCommit,
} from '@conventionalize/core';

describe('Commit History & Analytics', () => {
  const tempDir = path.join(os.tmpdir(), `gcai-test-history-${Date.now()}`);
  const tempHistoryFile = path.join(tempDir, 'history.json');

  beforeEach(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('logs commits and retrieves history correctly', () => {
    const mockCommit: CommitMessage = {
      type: 'feat',
      scope: 'core',
      isBreaking: false,
      subject: 'add user authentication',
      formatted: 'feat(core): add user authentication',
    };

    logCommit(mockCommit, 'my-repo', '/path/to/my-repo', 3, 100, 20, tempHistoryFile);

    const history = getHistory(tempHistoryFile);
    expect(history.commits).toHaveLength(1);
    expect(history.commits[0].repoName).toBe('my-repo');
    expect(history.commits[0].type).toBe('feat');
    expect(history.commits[0].scope).toBe('core');
  });

  it('computes commit statistics breakdown', () => {
    const commits: LoggedCommit[] = [
      {
        id: '1',
        repoName: 'repo1',
        repoPath: '/r1',
        timestamp: new Date().toISOString(),
        type: 'feat',
        subject: 'feature 1',
        formatted: 'feat: feature 1',
        filesChanged: 2,
        additions: 10,
        deletions: 2,
      },
      {
        id: '2',
        repoName: 'repo1',
        repoPath: '/r1',
        timestamp: new Date().toISOString(),
        type: 'fix',
        subject: 'fix bug',
        formatted: 'fix: fix bug',
        filesChanged: 1,
        additions: 5,
        deletions: 1,
      },
      {
        id: '3',
        repoName: 'repo2',
        repoPath: '/r2',
        timestamp: new Date().toISOString(),
        type: 'feat',
        subject: 'feature 2',
        formatted: 'feat: feature 2',
        filesChanged: 4,
        additions: 50,
        deletions: 5,
      },
    ];

    const stats = getCommitStats(commits);
    expect(stats.totalCommits).toBe(3);
    expect(stats.byType.feat).toBe(2);
    expect(stats.byType.fix).toBe(1);
    expect(stats.totalAdditions).toBe(65);
    expect(stats.totalDeletions).toBe(8);
  });

  it('exports formatted Markdown changelog', () => {
    const commits: LoggedCommit[] = [
      {
        id: '1',
        repoName: 'my-app',
        repoPath: '/app',
        timestamp: '2026-08-30T10:00:00.000Z',
        type: 'feat',
        scope: 'auth',
        subject: 'add oauth2 login',
        formatted: 'feat(auth): add oauth2 login',
        filesChanged: 5,
        additions: 120,
        deletions: 10,
      },
      {
        id: '2',
        repoName: 'my-app',
        repoPath: '/app',
        timestamp: '2026-08-30T11:00:00.000Z',
        type: 'fix',
        scope: 'api',
        subject: 'fix memory leak in request queue',
        formatted: 'fix(api): fix memory leak in request queue',
        filesChanged: 2,
        additions: 15,
        deletions: 8,
      },
    ];

    const markdown = exportChangelog(commits);
    expect(markdown).toContain('# Changelog');
    expect(markdown).toContain('### Features');
    expect(markdown).toContain('add oauth2 login');
    expect(markdown).toContain('### Bug Fixes');
    expect(markdown).toContain('fix memory leak in request queue');
  });
});
