# Rule: expose-invalid-path

## What it is

This rule detects when a Module Federation `exposes` entry points to a file path that does not exist on disk.

## Why it matters

Invalid expose paths prevent the remote module from being resolved at runtime and can break host/remote integration.

## How to fix

Correct the exposed path or add the missing file to the package so that webpack can resolve it.

## Example

Invalid:

```js
exposes: {
  './Widget': './src/components/Widget.tsx'
}
```

if `./src/components/Widget.tsx` does not exist.

Valid:

```js
exposes: {
  './Widget': './src/components/Widget.tsx'
}
```

and the file is present.
