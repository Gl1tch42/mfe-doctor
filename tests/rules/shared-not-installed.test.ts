import { describe, expect, it } from 'vitest';
import { analyze } from '../../src/core/analyze';
import path from 'node:path';

const invalidConfig = path.resolve('tests/fixtures/shared-not-installed/invalid/webpack.config.js');
const invalidPackageJson = path.resolve('tests/fixtures/shared-not-installed/invalid/package.json');
const validConfig = path.resolve('tests/fixtures/shared-not-installed/valid/webpack.config.js');
const validPackageJson = path.resolve('tests/fixtures/shared-not-installed/valid/package.json');

describe('shared-not-installed rule', () => {
  it('reports a shared package that is not listed in package.json', async () => {
    const report = await analyze({ configs: [invalidConfig], packageJsons: [invalidPackageJson] });

    expect(report.issues).toHaveLength(1);
    expect(report.issues[0]).toMatchObject({
      ruleId: 'shared-not-installed',
      severity: 'error',
    });
  });

  it('does not report when the shared package exists in package.json', async () => {
    const report = await analyze({ configs: [validConfig], packageJsons: [validPackageJson] });

    expect(report.issues).toHaveLength(0);
  });
});
