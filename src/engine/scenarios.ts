// Готові схеми. Дефолтний будинок = приклад для перевірки §8 ТЗ:
// свердловина 10 м від дому, стояк ½" на 2 поверх. Використовується і в
// тестах (golden), і як стартовий стан UI.

import type { Graph } from './types';
import { PIPE_PRESETS, DEFAULT_K_FITTINGS } from './presets';

/** Створює трубу з пресета матеріалу. */
function pipe(
  id: string,
  from: string,
  to: string,
  label: string,
  length: number,
  material: keyof typeof PIPE_PRESETS,
  kFittings = DEFAULT_K_FITTINGS,
) {
  const p = PIPE_PRESETS[material];
  return {
    id,
    from,
    to,
    label,
    length,
    dInner: p.dInner,
    c: p.c,
    roughness: p.roughness,
    kFittings,
    material,
  };
}

/**
 * Дефолтний будинок (§8). Тип джерела — поверхнева станція, дзеркало 6 м.
 * Стояк на 2 поверх (+7 м). За замовчуванням без запасу на фітинги
 * (kFittings=0), щоб числа збігалися з прототипом v0.1.
 */
export function defaultHouse(kFittings = 0): Graph {
  return {
    nodes: [
      { id: 'src', kind: 'source', z: 0, label: 'Свердловина + станція', sourceType: 'surface_station', depthToWater: 6 },
      { id: 'station', kind: 'tee', z: 0, label: 'Станція' },
      { id: 'entry', kind: 'tee', z: 0, label: 'Ввід у будинок' },
      { id: 'riser-top', kind: 'tee', z: 7, label: 'Верх стояка (2 пов.)' },
      { id: 'tap', kind: 'tap', z: 7, label: 'Змішувач душа' },
    ],
    pipes: [
      pipe('p1', 'src', 'station', 'Всмоктування зі свердловини', 12, 'pnd32', kFittings),
      pipe('p2', 'station', 'entry', 'Станція → ввід у будинок', 10, 'pnd32', kFittings),
      pipe('p3', 'entry', 'riser-top', 'Стояк на 2 поверх', 7, 'ppr20', kFittings),
      pipe('p4', 'riser-top', 'tap', 'Гілка до змішувача', 4, 'ppr20', kFittings),
    ],
  };
}
