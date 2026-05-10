# Rule: shared-not-installed

## What it is

This rule detects when a shared package is declared in Module Federation but is missing from the relevant `package.json` dependencies.

## Why it matters

A shared package that is not installed can cause runtime failures when webpack tries to resolve the dependency.

## How to fix

Add the package to `dependencies`, `devDependencies`, `peerDependencies`, or `optionalDependencies` in the proper `package.json`.

## Example

Invalid:

```js
shared: {
  rxjs: { singleton: true }
}
```

and `package.json` does not contain `rxjs`.

Valid:

```json
{
  "dependencies": {
    "rxjs": "^7.0.0"
  }
}
```
