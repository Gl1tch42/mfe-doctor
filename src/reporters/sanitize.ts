// Strips ASCII control characters (C0 + DEL) other than tab/LF/CR, including
// ANSI/terminal escape sequences (ESC, BEL, CSI, OSC...), from strings that
// ultimately originate from an analyzed repo's webpack.config.js /
// package.json and are not trusted input. This is also the set of C0
// controls the XML 1.0 spec forbids outside of tab/LF/CR.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export function stripControlChars(value: string): string {
  return value.replace(CONTROL_CHARS, '');
}

// Terminal output is expected to be single-line per field: also strip
// tab/LF/CR so a crafted package name can't inject extra lines or use a
// bare CR to overwrite/spoof already-printed output.
// eslint-disable-next-line no-control-regex
const TERMINAL_UNSAFE_CHARS = /[\x00-\x1F\x7F]/g;

export function sanitizeForTerminal(value: string): string {
  return value.replace(TERMINAL_UNSAFE_CHARS, '');
}
