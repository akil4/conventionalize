import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { loadConfig, saveConfig, getDefaultConfig } from '../src/core/config.js';

describe('Config Manager', () => {
  const tempDir = path.join(os.tmpdir(), `gcai-test-config-${Date.now()}`);
  const tempConfigFile = path.join(tempDir, '.gcairc');

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

  it('returns default configuration when no file exists', () => {
    const config = getDefaultConfig();
    expect(config.provider).toBe('heuristic');
    expect(config.autoCopy).toBe(false);
    expect(config.maxSummaryLength).toBe(72);
  });

  it('saves and loads custom configuration accurately', () => {
    const customConfig = {
      ...getDefaultConfig(),
      apiKey: 'sk-test-12345',
      provider: 'openai' as const,
      autoCopy: true,
      defaultScope: 'core',
    };

    saveConfig(customConfig, tempConfigFile);
    expect(fs.existsSync(tempConfigFile)).toBe(true);

    const loaded = loadConfig(tempConfigFile);
    expect(loaded.apiKey).toBe('sk-test-12345');
    expect(loaded.provider).toBe('openai');
    expect(loaded.autoCopy).toBe(true);
    expect(loaded.defaultScope).toBe('core');
  });
});
