import { describe, it, expect } from 'vitest';
import { hazenWilliams, darcyWeisbach, velocity, kinematicViscosity } from './headloss';

describe('hazenWilliams', () => {
  it('нульова/некоректна витрата → 0 втрат', () => {
    expect(hazenWilliams(10, 26, 150, 0)).toBe(0);
    expect(hazenWilliams(10, 0, 150, 10)).toBe(0);
  });

  it('монотонно зростає з витратою і довжиною, спадає з діаметром', () => {
    expect(hazenWilliams(10, 13, 150, 20)).toBeGreaterThan(hazenWilliams(10, 13, 150, 10));
    expect(hazenWilliams(20, 13, 150, 10)).toBeGreaterThan(hazenWilliams(10, 13, 150, 10));
    expect(hazenWilliams(10, 13, 150, 10)).toBeGreaterThan(hazenWilliams(10, 26, 150, 10));
  });

  it('відоме значення: ½" (13 мм), 7 м, C=150, 10 л/хв ≈ 1.074 м', () => {
    expect(hazenWilliams(7, 13, 150, 10)).toBeCloseTo(1.074, 2);
  });
});

describe('velocity', () => {
  it('½" при 10 л/хв ≈ 1.256 м/с', () => {
    expect(velocity(13, 10)).toBeCloseTo(1.256, 2);
  });
});

describe('kinematicViscosity', () => {
  it('при 20 °C ≈ 1.0·10⁻⁶ м²/с', () => {
    expect(kinematicViscosity(20)).toBeCloseTo(1.0e-6, 7);
  });
});

describe('darcyWeisbach', () => {
  it('дає додатні втрати того ж порядку, що й HW', () => {
    const hw = hazenWilliams(7, 13, 150, 10);
    const dw = darcyWeisbach(7, 13, 0.0015, 10);
    expect(dw).toBeGreaterThan(0);
    // На тонких пластикових трубах HW трохи занижує відносно DW (~10–12%).
    expect(dw).toBeGreaterThan(hw);
    expect(Math.abs(dw - hw) / hw).toBeLessThan(0.2);
  });
});
