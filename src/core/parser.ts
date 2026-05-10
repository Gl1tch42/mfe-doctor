import { readFile } from 'node:fs/promises';
import { parse } from '@babel/parser';
import type { ParsedConfig } from './types';
import { extractFederationConfig } from './extractor';

export async function parseWebpackConfig(filePath: string): Promise<ParsedConfig> {
  const source = await readFile(filePath, 'utf8');
  const ast = parse(source, {
    sourceType: 'unambiguous',
    plugins: [
      'typescript',
      'jsx',
      'classProperties',
      'classPrivateProperties',
      'objectRestSpread',
      'dynamicImport',
      'optionalChaining',
      'nullishCoalescingOperator',
    ],
  });

  return extractFederationConfig(ast, filePath);
}
