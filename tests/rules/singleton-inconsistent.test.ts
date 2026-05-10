import { describe, expect, it } from 'vitest';
import { analyze } from '../../src/core/analyze';
import path from 'node:path';

const invalidConfig1 = path.resolve('tests/fixtures/singleton-inconsistent/invalid/webpack1.config.js');
const invalidConfig2 = path.resolve('tests/fixtures/singleton-inconsistent/invalid/webpack2.config.js');
const validConfig1 = path.resolve('tests/fixtures/singleton-inconsistent/valid/webpack1.config.js');
const validConfig2 = path.resolve('tests/fixtures/singleton-inconsistent/valid/webpack2.config.js');

const invalidPackageJson = path.resolve('tests/fixtures/singleton-inconsistent/invalid/package.json');
const validPackageJson = path.resolve('tests/fixtures/singleton-inconsistent/valid/package.json');

describe('singleton-inconsistent rule', () => {
  it('reports a shared package with inconsistent singleton configurations', async () => {
    const report = await analyze({ configs: [invalidConfig1, invalidConfig2], packageJsons: [invalidPackageJson] });

    expect(report.issues).toHaveLength(1);
    expect(report.issues[0]).toMatchObject({
      ruleId: 'singleton-inconsistent',
      severity: 'warning',
      message: expect.stringContaining('react'),
      message: expect.stringContaining('true'),
      message: expect.stringContaining('false'),
    });
  });

  it('does not report when singleton configurations are consistent', async () => {
    const report = await analyze({ configs: [validConfig1, validConfig2], packageJsons: [validPackageJson] });

    expect(report.issues).toHaveLength(0);
  });
});