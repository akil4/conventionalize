import { describe, it, expect } from 'vitest';
import { getLicenseInfo } from '@conventionalize/core';

describe('License System', () => {
  it('returns open-source MIT license info', () => {
    const info = getLicenseInfo();
    expect(info.name).toBe('conventionalize');
    expect(info.type).toBe('MIT License');
  });
});
