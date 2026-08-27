import { ConfigOptions } from '../types/index.js';
export declare function getDefaultConfig(): ConfigOptions;
export declare function getConfigPath(): string;
export declare function loadConfig(filePath?: string): ConfigOptions;
export declare function saveConfig(config: Partial<ConfigOptions>, filePath?: string): ConfigOptions;
