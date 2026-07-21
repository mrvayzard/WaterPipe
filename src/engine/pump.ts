// Модель кривої насоса (беклог #1 ТЗ, мінімальна форма на 2 точки з паспортної
// таблички). Насос дає не один напір, а криву: при нульовій витраті — максимум
// (H_max, «макс. висота підйому»), при максимальній подачі (Q_max) — падає до 0.
//
//   H(Q) = H_max · (1 − (Q / Q_max)²)
//
// Це знімає незрозуміле «напір у робочій точці»: користувач вводить два числа
// прямо з коробки станції, а робочу точку рушій рахує сам.

/** Напір насоса при заданій витраті, м. Обидва паспортні числа в л/хв та м. */
export function pumpHeadAtFlow(qLmin: number, maxHead: number, maxFlow: number): number {
  if (maxFlow <= 0) return Math.max(0, maxHead);
  const ratio = qLmin / maxFlow;
  return Math.max(0, maxHead * (1 - ratio * ratio));
}

/**
 * Обернена задача: витрата, яку насос дає при заданому напорі, л/хв.
 * Q = Q_max · √(1 − H/H_max). Якщо напір недосяжний (H ≥ H_max) → 0
 * (насос не подужає такий тиск).
 */
export function flowAtHead(headM: number, maxHead: number, maxFlow: number): number {
  if (maxHead <= 0 || maxFlow <= 0) return 0;
  const inside = 1 - headM / maxHead;
  return inside > 0 ? maxFlow * Math.sqrt(inside) : 0;
}
