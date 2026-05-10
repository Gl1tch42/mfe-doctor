#!/usr/bin/env node

import { analyze } from './dist/index.js';
import { ruleRegistry } from './dist/rules/rule-interface.js';
import { loadRules } from './dist/rules/index.js';

// Example: Custom rule registration
const customRule = {
  id: 'custom-example',
  meta: {
    name: 'Custom Example Rule',
    description: 'An example of how to register custom rules',
    category: 'architecture',
  },
  severity: 'info',
  check: async (context) => {
    // Custom logic here
    return [{
      ruleId: 'custom-example',
      severity: 'info',
      message: 'This is a custom rule example',
      file: context.configs[0]?.filePath || 'unknown',
      suggestion: 'This is just an example',
    }];
  },
};

// Register custom rule
ruleRegistry.register(customRule);

// Load built-in rules
await loadRules();

console.log('Available rules:', ruleRegistry.list().map(r => r.id));

// Run analysis
const report = await analyze({
  configs: ['./test/fixtures/webpack.config.js'],
  packageJsons: ['./test/fixtures/package.json'],
});

console.log('Analysis complete:', report.summary);