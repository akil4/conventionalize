import { describe, it, expect } from 'vitest';
import { getLicenseInfo } from '../src/core/license.js';

describe('License System', () => {
  it('returns open-source MIT license info', () => {
    const info = getLicenseInfo();
    expect(info.name).toBe('conventionalize');
    expect(info.type).toBe('MIT License');
  });
});
