import { describe, it, expect } from 'vitest';
import {
  prechargeDefault,
  acceptanceFactor,
  tankPerformance,
  requiredTankVolume,
  tankVerdict,
} from './tank';
import { flowAtHead } from './pump';

describe('prechargeDefault', () => {
  it('на 0.14 бар нижче тиску увімкнення', () => {
    expect(prechargeDefault(1.5)).toBeCloseTo(1.36, 5);
  });
});

describe('acceptanceFactor', () => {
  it('реле 1.5/3.0, передзарядка 1.36 → ≈ 0.353', () => {
    expect(acceptanceFactor(1.5, 3.0, 1.36)).toBeCloseTo(0.353, 3);
  });

  it('нульовий, якщо вимкнення не вище увімкнення', () => {
    expect(acceptanceFactor(3.0, 3.0, 1.36)).toBe(0);
  });
});

describe('tankPerformance', () => {
  it('бак 24 л, реле 1.5/3.0, подача 32 л/хв — запас ≈ 8.5 л, пусків ≈ 57/год', () => {
    const r = tankPerformance(24, 1.5, 3.0, 1.36, 32);
    expect(r.drawdownL).toBeCloseTo(8.47, 1);
    expect(r.startsPerHour).toBeCloseTo(56.7, 0);
  });

  it('станція не дотягує до тиску вимкнення (подача 0) → пуски нескінченні', () => {
    const r = tankPerformance(24, 1.5, 3.0, 1.36, 0);
    expect(r.startsPerHour).toBe(Infinity);
  });

  it('більший бак → рідші пуски', () => {
    const small = tankPerformance(24, 1.5, 3.0, 1.36, 32).startsPerHour;
    const big = tankPerformance(80, 1.5, 3.0, 1.36, 32).startsPerHour;
    expect(big).toBeLessThan(small);
  });
});

describe('requiredTankVolume (зворотний)', () => {
  it('під ≤20 пусків/год при подачі 32 л/хв треба ≈ 68 л', () => {
    const r = requiredTankVolume(20, 1.5, 3.0, 1.36, 32);
    expect(r.requiredDrawdownL).toBeCloseTo(24, 1);
    expect(r.requiredTankL).toBeCloseTo(68, 0);
  });

  it('узгодженість: бак цього об’єму дає рівно цільові пуски', () => {
    const need = requiredTankVolume(20, 1.5, 3.0, 1.36, 32);
    const perf = tankPerformance(need.requiredTankL, 1.5, 3.0, 1.36, 32);
    expect(perf.startsPerHour).toBeCloseTo(20, 6);
  });
});

describe('подача в бак із кривої насоса', () => {
  it('станція 43 м / 60 л/хв при тиску вимкнення 3 бар (30.6 м) ≈ 32 л/хв', () => {
    expect(flowAtHead(3.0 * 10.2, 43, 60)).toBeCloseTo(32.2, 1);
  });

  it('станція слабша за тиск вимкнення → подача 0', () => {
    expect(flowAtHead(50, 43, 60)).toBe(0);
  });
});

describe('tankVerdict', () => {
  it('пороги пусків/год', () => {
    expect(tankVerdict(15).level).toBe('good');
    expect(tankVerdict(30).level).toBe('ok');
    expect(tankVerdict(60).level).toBe('bad');
  });
});
