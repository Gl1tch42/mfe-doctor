# mfe-doctor

[![npm version](https://badge.fury.io/js/mfe-doctor.svg)](https://www.npmjs.com/package/mfe-doctor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js >= 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](package.json)

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

### Real focus

- companies managing 20+ MFEs
- Enterprise with complex webpack monorepos
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
# Basic analysis (recursively finds every webpack.config.js under the cwd)
npx mfe-doctor analyze

# Analyze specific config
npx mfe-doctor analyze ./apps/my-app/webpack.config.js

# JSON output for automation
npx mfe-doctor analyze --json > report.json

# HTML report with graphs
npx mfe-doctor analyze --html > report.html

# Disable specific rules
npx mfe-doctor analyze --disable eager-loading-heavy,singleton-inconsistent

# Load custom rules from a directory (.js/.mjs/.cjs files)
npx mfe-doctor analyze --rules-dir ./mfe-doctor-rules

# Use an explicit config file
npx mfe-doctor analyze --config ./mfe-doctor.config.js
```

### CI Integration

```bash
# Fail on any errors, allow up to 5 warnings
npx mfe-doctor ci --max-warnings 5

# JUnit output for CI systems (default format)
npx mfe-doctor ci --format junit > test-results.xml

# GitHub Actions annotations
npx mfe-doctor ci --format gh

# Combine with rule customization, same flags as `analyze`
npx mfe-doctor ci --disable eager-loading-heavy --rules-dir ./mfe-doctor-rules
```

`ci` fails the process (`exit 1`) when there is at least one error, or when the warning count exceeds `--max-warnings` (default `0`).

#### CLI reference

| Flag | Commands | Description |
|------|----------|-------------|
| `--json` | `analyze` | Print the report as JSON to stdout |
| `--html` | `analyze` | Print a self-contained HTML report to stdout |
| `--format <junit\|gh>` | `ci` | Output format for CI mode (default `junit`) |
| `--max-warnings <n>` | `ci` | Warning threshold before the run fails (default `0`) |
| `--rules-dir <dir>` | `analyze`, `ci` | Directory of custom rule files (`.js`, `.mjs`, `.cjs`) to load in addition to the built-in rules |
| `--config <path>` | `analyze`, `ci` | Explicit path to `mfe-doctor.config.js` (see [Configuration File](#configuration-file)) |
| `--disable <rules>` | `analyze`, `ci` | Comma-separated rule IDs to skip |

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

### Configuration File

Drop an `mfe-doctor.config.js` (`.mjs`/`.cjs`, or `.mfe-doctor.config.js`) in your project root to set defaults picked up automatically by both `analyze` and `ci` (or point at one explicitly with `--config`):

```js
// mfe-doctor.config.js
import { defineConfig } from 'mfe-doctor';
import myTeamRule from './rules/my-team-rule.js';

export default defineConfig({
  // Rule IDs to skip, same effect as --disable
  disable: ['eager-loading-heavy'],
  // Rule objects to register in addition to the built-ins
  extraRules: [myTeamRule],
});
```

CLI `--disable` flags are merged with (not replaced by) the config file's `disable` list.

### Custom Rules

There are three ways to add a rule, in increasing order of reuse:

1. **Programmatic API** — register a rule at runtime before calling `analyze`:

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

2. **`extraRules` in `mfe-doctor.config.js`** — see [Configuration File](#configuration-file) above, useful for rules committed to the repo.
3. **`--rules-dir`** — point the CLI at a directory of standalone `.js`/`.mjs`/`.cjs` files, each with a `default` export matching the `Rule` shape (`id`, `meta`, `severity`, `check`). See [examples/custom-rule.js](examples/custom-rule.js) for a working example.

## Rules

| Rule | Severity | Description | Docs |
|------|----------|-------------|------|
| expose-invalid-path | Error | Detects invalid expose paths that don't exist | [docs](docs/rules/expose-invalid-path.md) |
| shared-not-installed | Error | Shared packages not listed in package.json | [docs](docs/rules/shared-not-installed.md) |
| required-version-missing | Warning | Missing requiredVersion or derivable version | [docs](docs/rules/required-version-missing.md) |
| version-mismatch | Error | Conflicting versions across package.json files | [docs](docs/rules/version-mismatch.md) |
| singleton-inconsistent | Warning | Inconsistent singleton configurations | [docs](docs/rules/singleton-inconsistent.md) |
| eager-loading-heavy | Warning | Eager loading that may increase bundle size | [docs](docs/rules/eager-loading-heavy.md) |

Every rule can be turned off via `--disable` or the config file's `disable` list (see [CLI reference](#cli-reference) and [Configuration File](#configuration-file)).

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

### Known Limitations

- **`expose-invalid-path` does not resolve extensions.** Unlike webpack's module resolution, this rule checks the `exposes` path literally with `fs.access` — it does not try `.ts`, `.tsx`, `.js`, etc. If your `ModuleFederationPlugin` config omits the extension (e.g. `'./Button': './src/Button'`, common in real-world configs), the rule will report a false positive unless the exact literal path exists on disk. Write extension-less exposes with the real extension included, or expect this rule to flag them.

### Security

- **Reporter output is escaped and sanitized.** Package names, versions, and paths extracted from the analyzed `webpack.config.js`/`package.json` are attacker-controlled input when you run `mfe-doctor` against a repo you don't fully trust (e.g. an external PR in CI). All five reporters neutralize this data for their output format: `html` and `junit` HTML/XML-escape it, `gh` (GitHub Actions annotations) escapes `%`/`\r`/`\n` and the property delimiters `:`/`,` per the workflow command spec, and the default `terminal` reporter strips ANSI/control-byte sequences so a crafted package name can't spoof output or hijack your terminal (title-bar injection, line overwrites, etc.). A malicious package name can't inject HTML/JS into a report, break a JUnit XML parser, forge extra `::error::`/`::warning::` annotations, or manipulate your terminal.
- **`node_modules` is excluded from the default recursive scan.** `analyze`/`ci` without an explicit path search `**/webpack.config.js` and `**/package.json`, which now skip `node_modules` and `.git`. Without this, a transitive dependency's own internal version pin (e.g. a vendored `react` version deep in `node_modules`) could get misread as part of your app and trigger false `version-mismatch`/`shared-not-installed` results — and scanning thousands of vendored `package.json` files made every default run slow.
- **Config and rule loading execute arbitrary code, by design.** `mfe-doctor.config.js` and any file under `--rules-dir` are `import()`-ed and run as JavaScript, the same trust model as `eslint.config.js` or `jest.config.js`. Only point `--rules-dir` at rules you've reviewed, and don't run `mfe-doctor` with a repo-supplied config against untrusted checkouts (e.g. PRs from forks) unless you've reviewed that config first.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full pipeline diagram and design principles.

```
src/
├── core/                  # Analysis engine & types
│   ├── analyze.ts         # Main analysis logic
│   ├── parser.ts          # Webpack config parsing
│   ├── extractor.ts       # Module Federation extraction
│   ├── graph.ts           # Builds the shared federation graph (host/remotes/shared)
│   ├── config.ts          # mfe-doctor.config.js loading + defineConfig
│   ├── ci-policy.ts       # Pass/fail decision for `ci`
│   └── types.ts           # TypeScript definitions
├── rules/                 # Validation rules
│   ├── rule-interface.ts  # Rule contract + ruleRegistry
│   ├── index.ts           # Built-in + --rules-dir loading
│   └── *.ts               # Individual rules
├── reporters/             # Output formatters
│   ├── terminal.ts        # Colored console output
│   ├── json.ts            # Structured JSON
│   ├── html.ts            # Self-contained HTML report
│   ├── junit.ts           # JUnit XML for CI
│   ├── github.ts          # GitHub Actions annotations
│   └── sanitize.ts        # Shared output-escaping helpers
└── cli.ts                 # Command-line interface
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

[MIT](LICENSE)
