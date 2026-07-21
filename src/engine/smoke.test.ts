import { describe, it, expect } from 'vitest';

// Тимчасовий тест-заглушка: підтверджує, що Vitest підхоплений і CI його ганяє.
// Замінюється справжніми тестами рушія на Етапі 1.
describe('smoke', () => {
  it('Vitest працює в CI', () => {
    expect(1 + 1).toBe(2);
  });
});
