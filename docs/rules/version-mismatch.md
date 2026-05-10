# Rule: version-mismatch

## What it is

This rule detects when the same shared package is declared with incompatible `requiredVersion` constraints across host and remote Module Federation configs.

## Why it matters

If host and remote require different versions that cannot satisfy the same package range, the federation runtime may load an unexpected version or fail to resolve the shared module.

## How to fix

Align the `requiredVersion` constraints for the shared package, or pin the package version consistently in the related `package.json` files.

## Example

Invalid:

```js
shared: {
  react: { singleton: true, requiredVersion: '^18.0.0' }
}
```

and

```js
shared: {
  react: { singleton: true, requiredVersion: '^17.0.0' }
}
```

Valid:

```js
shared: {
  react: { singleton: true, requiredVersion: '^18.0.0' }
}
```
