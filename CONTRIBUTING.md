# Contributing to mfe-doctor

Thank you for helping improve `mfe-doctor`.

## Setup

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Run tests:

```bash
npm test
```

4. Build the project:

```bash
npm run build
```

## How to add a new rule

The extensibility model is the heart of the project. A new rule should be added without modifying the existing rule runner.

1. Create a new rule file in `src/rules/`.
2. Export a default `Rule` object from that file.
3. Add fixture configs under `tests/fixtures/<rule-id>/`.
4. Add tests in `tests/rules/<rule-id>.test.ts`.
5. Add documentation in `docs/rules/<rule-id>.md`.
6. Update the rule registry in `src/rules/index.ts` if needed.
7. Verify the rule with `npm test`.

### Example: new rule

If you want to add a `shared-scopes` rule:

- Create `src/rules/shared-scopes.ts`.
- Implement `id`, `severity`, `description`, and `check(context)`.
- Add invalid and valid fixtures to `tests/fixtures/shared-scopes/`.
- Write `tests/rules/shared-scopes.test.ts`.
- Add docs in `docs/rules/shared-scopes.md`.
- Run tests and ensure the new rule is detected when the analyzer runs.

## Reporting bugs or proposing rules

If you want to propose a new rule, use the template in `.github/ISSUE_TEMPLATE/new-rule.md`.

## Style

- Keep implementations small and focused.
- Favor clear English messages for issues.
- Avoid adding unrelated functionality in a rule.

## Code review

- Ensure tests cover both valid and invalid cases.
- Keep `Rule` behavior consistent with the other rules.
- Document the problem, the fix, and the rule rationale.
