import { describe, expect, it } from 'vitest';
import { analyze } from '../../src/core/analyze';
import path from 'node:path';

const invalidConfig = path.resolve('tests/fixtures/expose-invalid-path/invalid/webpack.config.js');
const validConfig = path.resolve('tests/fixtures/expose-invalid-path/valid/webpack.config.js');

describe('expose-invalid-path rule', () => {
  it('reports a missing expose path', async () => {
    const report = await analyze({ configs: [invalidConfig], packageJsons: [] });

    expect(report.issues).toHaveLength(1);
    expect(report.issues[0]).toMatchObject({
      ruleId: 'expose-invalid-path',
      severity: 'error',
    });
  });

  it('does not report when the exposed file exists', async () => {
    const report = await analyze({ configs: [validConfig], packageJsons: [] });

    expect(report.issues).toHaveLength(0);
  });
});
