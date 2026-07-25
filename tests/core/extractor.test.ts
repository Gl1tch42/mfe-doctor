import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { parse } from '@babel/parser';
import { parseWebpackConfig } from '../../src/core/parser';
import { extractFederationConfig } from '../../src/core/extractor';

describe('parseWebpackConfig', () => {
  it('extracts every ModuleFederationPlugin instance in a multi-compiler config file', async () => {
    const configPath = path.resolve('tests/fixtures/multi-plugin/webpack.config.js');

    const configs = await parseWebpackConfig(configPath);

    expect(configs).toHaveLength(2);
    expect(configs.map((c) => c.name)).toEqual(['client', 'server']);
    expect(configs[0].exposes).toEqual([{ exposeName: './A', path: './src/A.js' }]);
    expect(configs[1].exposes).toEqual([{ exposeName: './B', path: './src/B.js' }]);
  });
});

describe('extractFederationConfig', () => {
  it('returns a single empty config when no ModuleFederationPlugin is present', () => {
    const ast = parse('module.exports = { plugins: [] };', { sourceType: 'unambiguous' });

    const configs = extractFederationConfig(ast, 'webpack.config.js');

    expect(configs).toEqual([
      { filePath: 'webpack.config.js', exposes: [], remotes: [], shared: [] },
    ]);
  });
});
