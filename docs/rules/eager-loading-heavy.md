# Rule: eager-loading-heavy

## What it is

This rule detects `eager: true` on large shared packages that are typically not suited for eager loading.

## Why it matters

Eager loading large libraries defeats code-splitting and can increase initial bundle size, reducing the performance benefit of Module Federation.

## How to fix

Remove `eager: true` from shared declarations for large dependencies, or restrict eager loading to lightweight packages.

## Example

Invalid:

```js
shared: {
  react: { eager: true, singleton: true }
}
```

Valid:

```js
shared: {
  react: { singleton: true }
}
```
