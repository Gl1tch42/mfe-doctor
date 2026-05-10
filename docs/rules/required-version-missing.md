# Rule: required-version-missing

## What it is

This rule detects a shared package declaration without `requiredVersion` and without a derivable version from `package.json`.

## Why it matters

Without a version range, Module Federation cannot validate whether the shared version is compatible with the host or remotes.

## How to fix

Add `requiredVersion` to the shared package declaration or ensure the package version is available in the associated `package.json`.

## Example

Invalid:

```js
shared: {
  lodash: { singleton: true }
}
```

Valid:

```js
shared: {
  lodash: { requiredVersion: '^4.17.0' }
}
```
