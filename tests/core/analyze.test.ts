import { describe, expect, it, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { analyze } from '../../src/core/analyze';

describe('analyze glob discovery', () => {
  let dir: string | undefined;

  afterEach(() => {
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
      dir = undefined;
    }
  });

  it('excludes node_modules from the default recursive glob patterns, avoiding false positives from transitive dependency versions', async () => {
    dir = mkdtempSync(path.join(tmpdir(), 'mfe-doctor-test-'));
    const nodeModulesDir = path.join(dir, 'node_modules', 'some-random-lib');
    mkdirSync(nodeModulesDir, { recursive: true });

    writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'myapp', dependencies: { react: '^18.2.0' } }),
    );
    writeFileSync(
      path.join(dir, 'webpack.config.js'),
      `const { ModuleFederationPlugin } = require('webpack').container;
module.exports = { plugins: [ new ModuleFederationPlugin({ name: 'myapp', shared: { react: { requiredVersion: '^18.2.0', singleton: true } } }) ] };`,
    );
    // A completely unrelated dependency that happens to pin a different react
    // version internally. This must never be treated as part of the app.
    writeFileSync(
      path.join(nodeModulesDir, 'package.json'),
      JSON.stringify({ name: 'some-random-lib', dependencies: { react: '16.4.0' } }),
    );

    const originalCwd = process.cwd();
    process.chdir(dir);
    try {
      const report = await analyze({ configs: ['**/webpack.config.js'], packageJsons: ['**/package.json'] });
      expect(report.issues).toEqual([]);
    } finally {
      process.chdir(originalCwd);
    }
  });
});
