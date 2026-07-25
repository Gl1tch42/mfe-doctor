import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Rule } from '../rules/rule-interface';

export interface MfeDoctorConfig {
  extraRules?: Rule[];
  disable?: string[];
}

const CONFIG_FILES = [
  'mfe-doctor.config.js',
  'mfe-doctor.config.mjs',
  'mfe-doctor.config.cjs',
  '.mfe-doctor.config.js',
];

export async function loadConfig(cwd = process.cwd()): Promise<MfeDoctorConfig> {
  for (const filename of CONFIG_FILES) {
    const filePath = path.join(cwd, filename);
    try {
      const mod = await import(pathToFileURL(filePath).href);
      return (mod?.default ?? mod) as MfeDoctorConfig;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT' && code !== 'MODULE_NOT_FOUND') {
        console.warn(`[mfe-doctor] Failed to load config file "${filename}": ${(error as Error).message}`);
      }
    }
  }
  return {};
}

export function defineConfig(config: MfeDoctorConfig): MfeDoctorConfig {
  return config;
}
