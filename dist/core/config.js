import fs from 'fs';
import path from 'path';
import os from 'os';
import { DEFAULT_MAX_DIFF_CHARS, DEFAULT_MAX_SUMMARY_LENGTH } from '../constants/index.js';
const DEFAULT_CONFIG_PATH = path.join(os.homedir(), '.gcairc');
export function getDefaultConfig() {
    return {
        provider: 'heuristic',
        model: 'gemini-3.7-flash',
        maxSummaryLength: DEFAULT_MAX_SUMMARY_LENGTH,
        maxDiffChars: DEFAULT_MAX_DIFF_CHARS,
        autoCopy: false,
        includeBody: true,
        debug: false,
    };
}
export function getConfigPath() {
    return DEFAULT_CONFIG_PATH;
}
export function loadConfig(filePath = DEFAULT_CONFIG_PATH) {
    try {
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf8');
            const parsed = JSON.parse(raw);
            return { ...getDefaultConfig(), ...parsed };
        }
    }
    catch {
        // Return default on parse error
    }
    return getDefaultConfig();
}
export function saveConfig(config, filePath = DEFAULT_CONFIG_PATH) {
    const current = loadConfig(filePath);
    const updated = { ...current, ...config };
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
}
