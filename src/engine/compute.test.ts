import { describe, it, expect } from 'vitest';
import { compute, staticLift, BAR_TO_M } from './compute';
import { defaultHouse } from './scenarios';
import { findSource } from './graph';
import type { ComputeInput } from './types';

const forward = (over: Partial<ComputeInput> = {}): ComputeInput => ({
  graph: defaultHouse(),
  activeTapId: 'tap',
  flowLmin: 10,
  mode: 'forward',
  pumpHead: 25,
  ...over,
});

describe('golden §8: дефолтний будинок, прямий режим, HW', () => {
  const r = compute(forward());

  it('статичний підйом = дзеркало 6 + стояк 7 = 13 м', () => {
    expect(r.staticLift).toBe(13);
  });

  it('сумарне тертя ≈ 1.80 м (звірено з v0.1, kFittings=0)', () => {
    expect(r.frictionTotal).toBeCloseTo(1.8, 2);
  });

  it('тиск у крані ≈ 1.00 бар', () => {
    expect(r.pressureBar).toBeCloseTo(1.0, 2);
  });

  it('вердикт — слабкий напір', () => {
    expect(r.verdict?.level).toBe('weak');
  });

  it('шлях містить 4 ділянки, домінує стояк', () => {
    expect(r.segments).toHaveLength(4);
    const riser = r.segments.find((s) => s.pipeId === 'p3')!;
    expect(riser.hf).toBeCloseTo(1.074, 2);
  });

  it('без попереджень (дзеркало 6 м, швидкість < 2 м/с)', () => {
    expect(r.warnings).toHaveLength(0);
    expect(r.maxVelocity).toBeLessThan(2);
  });
});

describe('зворотний режим', () => {
  it('потрібний напір = target·10.2 + підйом + тертя', () => {
    const r = compute(forward({ mode: 'reverse', targetBar: 1.5, pumpHead: undefined }));
    expect(r.requiredHead).toBeCloseTo(1.5 * BAR_TO_M + r.staticLift + r.frictionTotal, 5);
  });

  it('прямий і зворотний узгоджені: напір, потрібний під тиск, дає той самий тиск', () => {
    const rev = compute(forward({ mode: 'reverse', targetBar: 2.0, pumpHead: undefined }));
    const fwd = compute(forward({ pumpHead: rev.requiredHead }));
    expect(fwd.pressureBar).toBeCloseTo(2.0, 6);
  });
});

describe('попередження (§3.4)', () => {
  it('дзеркало глибше 7 м → попередження про всмоктування', () => {
    const g = defaultHouse();
    findSource(g).depthToWater = 8;
    const r = compute(forward({ graph: g }));
    expect(r.warnings.some((w) => w.code === 'suction')).toBe(true);
  });

  it('бак+бустер ігнорує глибину: без попередження, підйом без дзеркала', () => {
    const g = defaultHouse();
    const src = findSource(g);
    src.sourceType = 'tank_booster';
    src.depthToWater = 0;
    const r = compute(forward({ graph: g }));
    expect(r.warnings.some((w) => w.code === 'suction')).toBe(false);
    expect(r.staticLift).toBe(7);
  });

  it('замалий напір → відʼємний тиск і попередження', () => {
    const r = compute(forward({ pumpHead: 10 }));
    expect(r.pressureBar!).toBeLessThan(0);
    expect(r.warnings.some((w) => w.code === 'negative-pressure')).toBe(true);
  });

  it('висока швидкість (тонка труба, велика витрата) → попередження', () => {
    const r = compute(forward({ flowLmin: 25 }));
    expect(r.maxVelocity).toBeGreaterThan(2);
    expect(r.warnings.some((w) => w.code === 'high-velocity')).toBe(true);
  });
});

describe('запас на фітинги збільшує тертя (R2)', () => {
  it('kFittings=0.25 дає більше тертя, ніж 0', () => {
    const base = compute(forward()).frictionTotal;
    const withFittings = compute(forward({ graph: defaultHouse(0.25) })).frictionTotal;
    expect(withFittings).toBeCloseTo(base * 1.25, 5);
  });
});

describe('верифікація HW↔DW (§5, ризик R3)', () => {
  it('сумарне тертя двох формул сходиться в межах 15%; DW дещо вище', () => {
    const hw = compute(forward({ formula: 'hw' })).frictionTotal;
    const dw = compute(forward({ formula: 'dw' })).frictionTotal;
    expect(dw).toBeGreaterThan(hw);
    expect(Math.abs(dw - hw) / hw).toBeLessThan(0.15);
  });
});

describe('staticLift', () => {
  it('пряма формула z_tap − z_source + depth', () => {
    expect(
      staticLift(
        { id: 's', kind: 'source', z: 0, depthToWater: 6 },
        { id: 't', kind: 'tap', z: 7 },
      ),
    ).toBe(13);
  });
});
