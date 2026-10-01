import { describe, it, expect } from 'vitest';
import { formatRupiah, validateIndonesianPhone, escapeHTML } from '../src/utils/formatters';

describe('Formatters and Validators', () => {
  it('should format numbers according to Indonesian currency standards', () => {
    expect(formatRupiah(265000)).toMatch(/265[.,]000/);
    expect(formatRupiah(35000000)).toMatch(/35[.,]000[.,]000/);
    expect(formatRupiah(0)).toBe('0');
  });

  it('should properly escape HTML entities to prevent XSS', () => {
    expect(escapeHTML('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
    expect(escapeHTML("Tom & Jerry's")).toBe('Tom &amp; Jerry&#039;s');
  });

  it('should validate Indonesian phone numbers correctly', () => {
    // Valid numbers
    expect(validateIndonesianPhone('081234567890')).toBe(true);
    expect(validateIndonesianPhone('6281234567890')).toBe(true);
    expect(validateIndonesianPhone('+6281234567890')).toBe(true);
    expect(validateIndonesianPhone('0857 1234 5678')).toBe(true);
    expect(validateIndonesianPhone('+62 899 1234 5678')).toBe(true);

    // Invalid numbers
    expect(validateIndonesianPhone('0217654321')).toBe(false); // Landline
    expect(validateIndonesianPhone('12345')).toBe(false); // Too short
    expect(validateIndonesianPhone('0812abc3456')).toBe(false); // Characters
    expect(validateIndonesianPhone('+18001234567')).toBe(false); // Non-Indonesian
    expect(validateIndonesianPhone('')).toBe(false);
  });
});
