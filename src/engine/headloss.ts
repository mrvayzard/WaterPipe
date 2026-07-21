// Формули втрат на тертя. Хазен–Вільямс — двигун; Дарсі–Вейсбах — незалежний
// тест-оракул (§5 ТЗ). Обидві — чисті функції за спільною сигнатурою входів.

/** Прискорення вільного падіння, м/с². */
export const G = 9.81;

/** Переведення л/хв → м³/с. */
function toM3s(qLmin: number): number {
  return qLmin / 1000 / 60;
}

/**
 * Втрати на тертя за Хазеном–Вільямсом, м.
 * @param lengthM ефективна довжина L_eff, м
 * @param dMm внутрішній діаметр, мм
 * @param c коефіцієнт Хазена–Вільямса
 * @param qLmin витрата, л/хв
 */
export function hazenWilliams(lengthM: number, dMm: number, c: number, qLmin: number): number {
  if (qLmin <= 0 || dMm <= 0 || c <= 0 || lengthM <= 0) return 0;
  const q = toM3s(qLmin);
  const d = dMm / 1000;
  return (10.67 * lengthM * Math.pow(q, 1.852)) / (Math.pow(c, 1.852) * Math.pow(d, 4.87));
}

/**
 * Кінематична в'язкість води, м²/с, за температурою (°C).
 * Апроксимація; при 20 °C дає ≈1.0·10⁻⁶.
 */
export function kinematicViscosity(tempC: number): number {
  return 1.79e-6 / (1 + 0.03368 * tempC + 0.000221 * tempC * tempC);
}

/** Швидкість потоку в трубі, м/с. */
export function velocity(dMm: number, qLmin: number): number {
  if (dMm <= 0 || qLmin <= 0) return 0;
  const q = toM3s(qLmin);
  const d = dMm / 1000;
  const area = (Math.PI * d * d) / 4;
  return q / area;
}

/** Коефіцієнт тертя Дарсі за Swamee–Jain (турбулентний) / 64·Re⁻¹ (ламінарний). */
export function frictionFactor(re: number, relRoughness: number): number {
  if (re <= 0) return 0;
  if (re < 2300) return 64 / re;
  const denom = Math.log10(relRoughness / 3.7 + 5.74 / Math.pow(re, 0.9));
  return 0.25 / (denom * denom);
}

/**
 * Втрати на тертя за Дарсі–Вейсбахом, м. Оракул для звірки з HW (§5).
 * @param lengthM ефективна довжина L_eff, м
 * @param dMm внутрішній діаметр, мм
 * @param roughnessMm абсолютна шорсткість ε, мм
 * @param qLmin витрата, л/хв
 * @param tempC температура води, °C
 */
export function darcyWeisbach(
  lengthM: number,
  dMm: number,
  roughnessMm: number,
  qLmin: number,
  tempC = 20,
): number {
  if (qLmin <= 0 || dMm <= 0 || lengthM <= 0) return 0;
  const d = dMm / 1000;
  const v = velocity(dMm, qLmin);
  const re = (v * d) / kinematicViscosity(tempC);
  const f = frictionFactor(re, roughnessMm / 1000 / d);
  return (f * (lengthM / d) * (v * v)) / (2 * G);
}
