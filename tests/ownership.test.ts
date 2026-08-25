import { describe, expect, it } from 'vitest';
import { assertOwnership } from '@/lib/ownership';

describe('stack ownership guard', () => {
  it('allows the authenticated owner', () => {
    expect(() => assertOwnership('user-a', 'user-a')).not.toThrow();
  });
  it('rejects user A reading or mutating user B resources', () => {
    expect(() => assertOwnership('user-b', 'user-a')).toThrow('NOT_FOUND');
  });
});
