import { describe, expect, it } from 'vitest';
import { analyze } from '../../src/core/analyze';
import path from 'node:path';

const invalidConfig = path.resolve('tests/fixtures/eager-loading-heavy/invalid/webpack.config.js');
const invalidPackageJson = path.resolve('tests/fixtures/eager-loading-heavy/invalid/package.json');
const validConfig = path.resolve('tests/fixtures/eager-loading-heavy/valid/webpack.config.js');
const validPackageJson = path.resolve('tests/fixtures/eager-loading-heavy/valid/package.json');

describe('eager-loading-heavy rule', () => {
  it('reports shared packages configured with eager loading', async () => {
    const report = await analyze({ configs: [invalidConfig], packageJsons: [invalidPackageJson] });

    expect(report.issues).toHaveLength(1);
    expect(report.issues[0]).toMatchObject({
      ruleId: 'eager-loading-heavy',
      severity: 'warning',
      message: expect.stringContaining('react'),
      message: expect.stringContaining('eager loading'),
    });
  });

  it('does not report when eager is false', async () => {
    const report = await analyze({ configs: [validConfig], packageJsons: [validPackageJson] });

    expect(report.issues).toHaveLength(0);
  });
});
