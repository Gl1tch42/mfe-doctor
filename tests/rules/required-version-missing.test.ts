import { describe, expect, it } from 'vitest';
import { analyze } from '../../src/core/analyze';
import path from 'node:path';

const invalidConfig = path.resolve('tests/fixtures/required-version-missing/invalid/webpack.config.js');
const validConfig = path.resolve('tests/fixtures/required-version-missing/valid/webpack.config.js');
const validPackageJson = path.resolve('tests/fixtures/required-version-missing/valid/package.json');

describe('required-version-missing rule', () => {
  it('reports a shared package without requiredVersion and without package.json version', async () => {
    const report = await analyze({ configs: [invalidConfig], packageJsons: [] });

    expect(report.issues).toHaveLength(1);
    expect(report.issues[0]).toMatchObject({
      ruleId: 'required-version-missing',
      severity: 'warning',
    });
  });

  it('does not report when package.json provides the package version', async () => {
    const report = await analyze({ configs: [validConfig], packageJsons: [validPackageJson] });

    expect(report.issues).toHaveLength(0);
  });
});
