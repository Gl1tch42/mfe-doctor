import { describe, expect, it } from 'vitest';
import { shouldFailCi } from '../../src/core/ci-policy';

describe('shouldFailCi', () => {
  it('fails when there is at least one error, regardless of maxWarnings', () => {
    expect(shouldFailCi({ errors: 1, warnings: 0, infos: 0 }, 100)).toBe(true);
  });

  it('passes when warnings are within the allowed threshold', () => {
    expect(shouldFailCi({ errors: 0, warnings: 3, infos: 0 }, 5)).toBe(false);
  });

  it('fails when warnings exceed the allowed threshold', () => {
    expect(shouldFailCi({ errors: 0, warnings: 3, infos: 0 }, 2)).toBe(true);
  });

  it('fails on any warning when maxWarnings is the default of 0', () => {
    expect(shouldFailCi({ errors: 0, warnings: 1, infos: 0 }, 0)).toBe(true);
  });

  it('passes when there are no issues at all', () => {
    expect(shouldFailCi({ errors: 0, warnings: 0, infos: 0 }, 0)).toBe(false);
  });
});
