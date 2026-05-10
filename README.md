# mfe-doctor

Detect Module Federation misconfigurations before they hit production.

This tool starts by doing one specific thing well: detecting Module Federation misconfigurations. It is not — yet — a full architectural analysis platform. The direction of evolution will come from the community.

## What it does

- Finds misconfigured `ModuleFederationPlugin` declarations in webpack configs.
- Flags shared package issues, singleton mismatches, missing versions, eager loading problems, and bad expose paths.
- Offers both CLI and programmatic usage for automation and custom workflows.

## Quick start

Install:

```bash
npm install --save-dev mfe-doctor
```

Run analysis:

```bash
npx mfe-doctor analyze
```

Run CI mode:

```bash
npx mfe-doctor ci
```

## Rules

- [version-mismatch](docs/rules/version-mismatch.md)
- [singleton-inconsistent](docs/rules/singleton-inconsistent.md)
- [required-version-missing](docs/rules/required-version-missing.md)
- [eager-loading-heavy](docs/rules/eager-loading-heavy.md)
- [shared-not-installed](docs/rules/shared-not-installed.md)
- [expose-invalid-path](docs/rules/expose-invalid-path.md)

## CLI options

```bash
mfe-doctor analyze [--json] [--html]
mfe-doctor ci [--max-warnings <n>] [--format <junit|gh>]
mfe-doctor --help
mfe-doctor --version
```

### Behavior

- `analyze`: analyzes found webpack configs and package.json files.
- `--json`: prints a structured JSON report.
- `--html`: prints a self-contained HTML report.
- `ci`: exits with non-zero status when errors are present.
- `--max-warnings`: configures warning threshold for CI (default: 0).
- `--format junit`: outputs JUnit XML (default for CI).
- `--format gh`: outputs GitHub Actions annotations.

## Programmatic API

```ts
import { analyze } from 'mfe-doctor';

const report = await analyze({
  configs: ['./host/webpack.config.js', './remotes/*/webpack.config.js'],
  packageJsons: ['./host/package.json', './remotes/*/package.json'],
});

console.log(report.summary);
```

## Roadmap

This project is intentionally small and focused. Future enhancements may include additional Module Federation rules, support for richer config discovery, and expanded reporter integrations. Support for other bundlers, runtime SDKs, or non-webpack environments is out of scope for the MVP and may come from community contributions.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
