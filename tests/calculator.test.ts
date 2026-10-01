import { describe, it, expect } from 'vitest';
import { calculateDose } from '../src/utils/calculator';

describe('British Propolis Dose Calculator', () => {
  it('should calculate standard adult dosage for stamina correctly (60kg)', () => {
    const result = calculateDose(60, 'adult', 'stamina');
    expect(result.drops).toBe(6);
    expect(result.frequency).toBe('2 kali sehari');
    expect(result.recommendedProduct).toContain('Dewasa');
  });

  it('should scale drops with body weight for adult (80kg -> 8 drops)', () => {
    const result = calculateDose(80, 'adult', 'stamina');
    expect(result.drops).toBe(8);
  });

  it('should restrict child drops to maximum of 4 and suggest Green Kids', () => {
    const resultChildHighWeight = calculateDose(50, 'child', 'stamina');
    expect(resultChildHighWeight.drops).toBe(4);
    expect(resultChildHighWeight.recommendedProduct).toContain('Green Kids');

    const resultChildLowWeight = calculateDose(20, 'child', 'stamina');
    expect(resultChildLowWeight.drops).toBe(2);
    expect(resultChildLowWeight.frequency).toBe('1-2 kali sehari');
  });

  it('should adjust drops and frequency for recovery purpose', () => {
    const result = calculateDose(60, 'adult', 'recovery');
    expect(result.drops).toBe(8); // 6 + 2
    expect(result.frequency).toContain('3 kali sehari');
  });

  it('should adjust drops and frequency for chronic purpose', () => {
    const result = calculateDose(60, 'adult', 'chronic');
    expect(result.drops).toBe(7); // 6 + 1
    expect(result.frequency).toContain('secara bertahap');
  });
});
