// Сайзинг гідроакумулятора (беклог #7 ТЗ). Ортогонально до розрахунку тиску:
// бак не міняє усталений тиск у крані, а визначає запас води й частоту пусків
// насоса. Своя гілка калькулятора зі своїми входами (реле тиску, передзарядка).

/** Атмосферний тиск для переходу до абсолютних тисків, бар. */
const ATM_BAR = 1.013;
const absBar = (gauge: number): number => gauge + ATM_BAR;

/**
 * Рекомендована передзарядка повітря — на ~0.14 бар (2 psi) нижче тиску
 * увімкнення реле. Класичне правило для мембранних баків.
 */
export function prechargeDefault(cutIn: number): number {
  return Math.max(0, cutIn - 0.14);
}

/**
 * Коефіцієнт прийняття (частка об'єму бака, що стає корисним запасом води)
 * за законом Бойля: P_перед·(1/P_увімк − 1/P_вимк), тиски абсолютні.
 */
export function acceptanceFactor(cutIn: number, cutOut: number, precharge: number): number {
  if (cutOut <= cutIn || precharge < 0) return 0;
  return absBar(precharge) * (1 / absBar(cutIn) - 1 / absBar(cutOut));
}

export type TankVerdictLevel = 'good' | 'ok' | 'bad';

export interface TankVerdict {
  level: TankVerdictLevel;
  label: string;
}

/** Вердикт за частотою пусків: мотор малих насосів любить ≤ ~20 пусків/год. */
export function tankVerdict(startsPerHour: number): TankVerdict {
  if (startsPerHour <= 20) return { level: 'good', label: 'Насос вмикатиметься рідко — добре' };
  if (startsPerHour <= 40) return { level: 'ok', label: 'Прийнятно, але бак малуватий' };
  return { level: 'bad', label: 'Часте вмикання — насос швидко зноситься' };
}

export interface TankPerformance {
  precharge: number;
  acceptanceFactor: number;
  /** Корисний запас води між пусками, л. */
  drawdownL: number;
  /** Макс. пусків насоса за годину (найгірший розбір = ½ подачі). */
  startsPerHour: number;
  /** Мін. час роботи насоса за пуск (найгірший випадок), хв. */
  runMinutes: number;
}

/**
 * Прямий режим бака: маю бак V_бака л → який запас і скільки пусків.
 * @param pumpFlowLmin подача насоса в бак (з кривої при тиску вимкнення)
 */
export function tankPerformance(
  tankL: number,
  cutIn: number,
  cutOut: number,
  precharge: number,
  pumpFlowLmin: number,
): TankPerformance {
  const af = acceptanceFactor(cutIn, cutOut, precharge);
  const drawdownL = tankL * af;
  const startsPerHour =
    drawdownL > 0 && pumpFlowLmin > 0 ? (15 * pumpFlowLmin) / drawdownL : Infinity;
  const runMinutes = pumpFlowLmin > 0 ? (2 * drawdownL) / pumpFlowLmin : 0;
  return { precharge, acceptanceFactor: af, drawdownL, startsPerHour, runMinutes };
}

export interface TankRequirement {
  precharge: number;
  acceptanceFactor: number;
  /** Потрібний корисний запас під ліміт пусків, л. */
  requiredDrawdownL: number;
  /** Потрібний повний об'єм бака, л. */
  requiredTankL: number;
}

/** Зворотний режим бака: хочу ≤ N пусків/год → який об'єм бака треба. */
export function requiredTankVolume(
  maxStartsPerHour: number,
  cutIn: number,
  cutOut: number,
  precharge: number,
  pumpFlowLmin: number,
): TankRequirement {
  const requiredDrawdownL =
    maxStartsPerHour > 0 ? (15 * pumpFlowLmin) / maxStartsPerHour : Infinity;
  const af = acceptanceFactor(cutIn, cutOut, precharge);
  const requiredTankL = af > 0 ? requiredDrawdownL / af : Infinity;
  return { precharge, acceptanceFactor: af, requiredDrawdownL, requiredTankL };
}
