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
    } catch {
      // file not found or invalid, try next
    }
  }
  return {};
}

export function defineConfig(config: MfeDoctorConfig): MfeDoctorConfig {
  return config;
}
