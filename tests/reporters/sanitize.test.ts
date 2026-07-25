import { describe, expect, it } from 'vitest';
import { stripControlChars, sanitizeForTerminal } from '../../src/reporters/sanitize';

describe('stripControlChars', () => {
  it('removes ESC/BEL/CSI/OSC control bytes but keeps tab, LF and CR', () => {
    const input = 'pkg\x1b]0;PWNED\x07\x1b[2K name\ttab\nline\rcr';
    expect(stripControlChars(input)).toBe('pkg]0;PWNED[2K name\ttab\nline\rcr');
  });

  it('leaves normal text untouched', () => {
    expect(stripControlChars('@scope/my-pkg@^1.2.3')).toBe('@scope/my-pkg@^1.2.3');
  });
});

describe('sanitizeForTerminal', () => {
  it('also strips tab, LF and CR so a payload cannot spoof multi-line terminal output', () => {
    const input = 'pkg\r\x1b[2K\x1b[1Afake-line\n::error::injected\t.';
    expect(sanitizeForTerminal(input)).toBe('pkg[2K[1Afake-line::error::injected.');
  });
});
