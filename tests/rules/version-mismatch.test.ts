import { describe, expect, it } from 'vitest';
import { analyze } from '../../src/core/analyze';
import path from 'node:path';

const invalidConfig = path.resolve('tests/fixtures/version-mismatch/invalid/webpack.config.js');
const invalidPackageJson1 = path.resolve('tests/fixtures/version-mismatch/invalid/package1.json');
const invalidPackageJson2 = path.resolve('tests/fixtures/version-mismatch/invalid/package2.json');
const validConfig = path.resolve('tests/fixtures/version-mismatch/valid/webpack.config.js');
const validPackageJson1 = path.resolve('tests/fixtures/version-mismatch/valid/package1.json');
const validPackageJson2 = path.resolve('tests/fixtures/version-mismatch/valid/package2.json');

describe('version-mismatch rule', () => {
  it('reports a shared package with conflicting versions', async () => {
    const report = await analyze({ configs: [invalidConfig], packageJsons: [invalidPackageJson1, invalidPackageJson2] });

    expect(report.issues).toHaveLength(1);
    expect(report.issues[0]).toMatchObject({
      ruleId: 'version-mismatch',
      severity: 'error',
      message: expect.stringContaining('react'),
      message: expect.stringContaining('17.0.0'),
      message: expect.stringContaining('18.0.0'),
    });
  });

  it('does not report when shared package versions match', async () => {
    const report = await analyze({ configs: [validConfig], packageJsons: [validPackageJson1, validPackageJson2] });

    expect(report.issues).toHaveLength(0);
  });
});