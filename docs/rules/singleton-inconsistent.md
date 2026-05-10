# Rule: singleton-inconsistent

## What it is

This rule detects when a shared package is declared as `singleton: true` in one Module Federation config and not declared as a singleton in another.

## Why it matters

A shared singleton package must be consistently configured across host and remotes to ensure a single runtime instance. Inconsistent singleton settings can cause duplicate versions or runtime conflicts.

## How to fix

Use `singleton: true` consistently for the same shared package across all related configs.

## Example

Invalid:

```js
shared: {
  react: { singleton: true }
}
```

and

```js
shared: {
  react: { singleton: false }
}
```

Valid:

```js
shared: {
  react: { singleton: true }
}
```
