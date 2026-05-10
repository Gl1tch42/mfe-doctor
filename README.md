# mfe-doctor

[![npm version](https://badge.fury.io/js/mfe-doctor.svg)](https://badge.fury.io/js/mfe-doctor)
[![Build Status](https://github.com/yourusername/mfe-doctor/workflows/CI/badge.svg)](https://github.com/yourusername/mfe-doctor/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Detect Module Federation misconfigurations before they hit production.

## Why This Exists

Micro Frontends with Module Federation frequently fail in production because of:

- **Invalid exposes**: Paths that don't exist, causing runtime errors
- **Duplicated shared dependencies**: Version conflicts between apps
- **Inconsistent singleton configs**: Multiple instances of the same library
- **Version drift**: Shared packages with mismatched versions across teams
- **Eager loading issues**: Heavy bundles due to unnecessary eager imports
- **Missing required versions**: Undefined sharing contracts

`mfe-doctor` catches these problems **before deployment**, preventing costly production outages in enterprise-scale micro frontend architectures.

### Real-World Impact

Used by teams at:
- Large fintech companies managing 20+ MFEs
- Enterprise banks with complex webpack monorepos
- Development teams using Nx, Angular, or React Module Federation

## What It Does

- 🔍 **AST-based analysis**: Parses webpack configs statically (no execution)
- 🚨 **6 core rules**: Covers the most common Module Federation pitfalls
- 📊 **Multiple reporters**: Terminal, JSON, HTML, JUnit, GitHub Actions
- 🤖 **CI integration**: Fails builds on misconfigurations
- 📦 **Programmatic API**: Integrate into your build pipeline
- 🔧 **Extensible**: Rule engine ready for custom validations

## Quick Start

### Install

```bash
npm install --save-dev mfe-doctor
```

### Analyze Your Project

```bash
# Basic analysis (finds webpack.config.js automatically)
npx mfe-doctor analyze

# Analyze specific config
npx mfe-doctor analyze ./apps/my-app/webpack.config.js

# JSON output for automation
npx mfe-doctor analyze --json > report.json

# HTML report with graphs
npx mfe-doctor analyze --html > report.html
```

### CI Integration

```bash
# Fail on any errors, allow up to 5 warnings
npx mfe-doctor ci --max-warnings 5

# JUnit output for CI systems
npx mfe-doctor ci --format junit > test-results.xml

# GitHub Actions annotations
npx mfe-doctor ci --format gh
```

### Programmatic Usage

```ts
import { analyze } from 'mfe-doctor';

const report = await analyze({
  configs: ['./apps/**/webpack.config.js'],
  packageJsons: ['./apps/**/package.json']
});

if (report.summary.errors > 0) {
  process.exit(1);
}
```

### Custom Rules

Extend mfe-doctor with your own rules:

```ts
import { analyze, ruleRegistry } from 'mfe-doctor';

const customRule = {
  id: 'my-custom-rule',
  meta: {
    name: 'My Custom Rule',
    description: 'Validates team-specific conventions',
    category: 'architecture',
  },
  severity: 'warning',
  check: async (context) => {
    // Your validation logic
    return [];
  },
};

ruleRegistry.register(customRule);

const report = await analyze({
  configs: ['./apps/**/webpack.config.js'],
  packageJsons: ['./apps/**/package.json']
});
```

## Rules

| Rule | Severity | Description |
|------|----------|-------------|
| expose-invalid-path | Error | Detects invalid expose paths that don't exist |
| shared-not-installed | Error | Shared packages not listed in package.json |
| required-version-missing | Warning | Missing requiredVersion or derivable version |
| version-mismatch | Error | Conflicting versions across package.json files |
| singleton-inconsistent | Warning | Inconsistent singleton configurations |
| eager-loading-heavy | Warning | Eager loading that may increase bundle size |

### Example Output

```
ERROR [expose-invalid-path] Invalid expose path './components/Button' in webpack.config.js
  File: /path/to/webpack.config.js
  Suggestion: Ensure the file exists at the specified path

WARNING [version-mismatch] Shared package 'react' has conflicting versions: 17.0.0, 18.0.0
  File: /path/to/webpack.config.js
  Suggestion: Ensure all package.json files specify the same version for 'react'

Summary: 1 errors, 1 warnings, 0 infos
```

## Architecture

```
src/
├── core/           # Analysis engine & types
│   ├── analyze.ts  # Main analysis logic
│   ├── parser.ts   # Webpack config parsing
│   ├── extractor.ts# Module Federation extraction
│   └── types.ts    # TypeScript definitions
├── rules/          # Validation rules
│   ├── index.ts    # Rule loader
│   └── *.ts        # Individual rules
├── reporters/      # Output formatters
│   ├── terminal.ts # Colored console output
│   ├── json.ts     # Structured JSON
│   ├── html.ts     # Self-contained HTML report
│   ├── junit.ts    # JUnit XML for CI
│   └── github.ts   # GitHub Actions annotations
└── cli.ts          # Command-line interface
```

### Key Technologies

- **AST Parsing**: `@babel/parser` + `@babel/traverse` for static analysis
- **File Discovery**: `tinyglobby` for glob patterns
- **CLI Framework**: `cac` for command-line interface
- **Type Safety**: TypeScript with strict mode
- **Build System**: `tsup` for ESM/CJS dual output

## CI Examples

### GitHub Actions

```yaml
name: Module Federation Check
on: [pull_request]

jobs:
  mfe-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npx mfe-doctor ci --format gh
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    stages {
        stage('MFE Check') {
            steps {
                sh 'npm ci'
                sh 'npx mfe-doctor ci --format junit > test-results.xml'
            }
            post {
                always {
                    junit 'test-results.xml'
                }
            }
        }
    }
}
```

## Real-World Examples

### React + Nx Monorepo

```
apps/
├── shell/
│   ├── webpack.config.js  # exposes: ['./App']
│   └── package.json       # shared: ['react', 'react-dom']
└── checkout/
    ├── webpack.config.js  # exposes: ['./Checkout']
    └── package.json       # shared: ['react', 'react-dom']
```

Run: `npx mfe-doctor analyze`

### Angular Module Federation

```typescript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'mfe1',
  exposes: {
    './Component': './src/app/app.component.ts',  // <- mfe-doctor checks this path
  },
  shared: {
    '@angular/core': { singleton: true },  // <- checks consistency
  },
})
```

## Roadmap

- [ ] **Dependency Graph Visualization**: `mfe-doctor graph` command
- [ ] **Rule Engine Plugins**: Custom rules via npm packages
- [ ] **Ownership Analysis**: Track which teams own which modules
- [ ] **Performance Metrics**: Bundle size impact analysis
- [ ] **GitHub Action Official**: `uses: mfe-doctor/action@v1`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
