import { describe, it, expect } from 'vitest';
import { pumpHeadAtFlow } from './pump';

describe('pumpHeadAtFlow', () => {
  it('при нульовій витраті дає макс. напір', () => {
    expect(pumpHeadAtFlow(0, 43, 60)).toBeCloseTo(43, 6);
  });

  it('при макс. подачі напір падає до 0', () => {
    expect(pumpHeadAtFlow(60, 43, 60)).toBeCloseTo(0, 6);
  });

  it('станція 43 м / 60 л/хв при 10 л/хв ≈ 41.8 м', () => {
    expect(pumpHeadAtFlow(10, 43, 60)).toBeCloseTo(41.806, 2);
  });

  it('монотонно спадає з витратою', () => {
    expect(pumpHeadAtFlow(20, 43, 60)).toBeLessThan(pumpHeadAtFlow(10, 43, 60));
  });

  it('за межею макс. подачі не йде у мінус (кламп на 0)', () => {
    expect(pumpHeadAtFlow(70, 43, 60)).toBe(0);
  });
});
