import { describe, it, expect } from 'vitest';
import { parseGitDiff } from '../src/core/parser.js';

describe('parseGitDiff', () => {
  it('returns empty parsed diff when raw diff is empty', () => {
    const result = parseGitDiff('');
    expect(result.files).toHaveLength(0);
    expect(result.totalAdditions).toBe(0);
    expect(result.totalDeletions).toBe(0);
    expect(result.changedFilesCount).toBe(0);
  });

  it('correctly parses diff with modified files', () => {
    const rawDiff = `diff --git a/src/index.ts b/src/index.ts
index 1234567..89abcde 100644
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,3 +1,5 @@
 import fs from 'fs';
+import path from 'path';

 console.log('hello');
+console.log('world');
-console.log('old');
`;

    const result = parseGitDiff(rawDiff);
    expect(result.changedFilesCount).toBe(1);
    expect(result.files[0].filename).toBe('src/index.ts');
    expect(result.files[0].status).toBe('modified');
    expect(result.files[0].additions).toBe(2);
    expect(result.files[0].deletions).toBe(1);
    expect(result.totalAdditions).toBe(2);
    expect(result.totalDeletions).toBe(1);
  });

  it('correctly identifies newly added files', () => {
    const rawDiff = `diff --git a/src/utils/helpers.ts b/src/utils/helpers.ts
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/src/utils/helpers.ts
@@ -0,0 +1,3 @@
+export function add(a: number, b: number) {
+  return a + b;
+}
`;

    const result = parseGitDiff(rawDiff);
    expect(result.changedFilesCount).toBe(1);
    expect(result.files[0].filename).toBe('src/utils/helpers.ts');
    expect(result.files[0].status).toBe('added');
    expect(result.files[0].additions).toBe(3);
    expect(result.files[0].deletions).toBe(0);
  });

  it('correctly identifies deleted files', () => {
    const rawDiff = `diff --git a/src/old.ts b/src/old.ts
deleted file mode 100644
index 1234567..0000000
--- a/src/old.ts
+++ /dev/null
@@ -1,2 +0,0 @@
-const deprecated = true;
-export default deprecated;
`;

    const result = parseGitDiff(rawDiff);
    expect(result.changedFilesCount).toBe(1);
    expect(result.files[0].filename).toBe('src/old.ts');
    expect(result.files[0].status).toBe('deleted');
    expect(result.files[0].deletions).toBe(2);
  });
});
