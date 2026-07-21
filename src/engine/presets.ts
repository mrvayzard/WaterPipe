// Пресети матеріалів труб і приладів. Числа перенесені з прототипу v0.1
// (napir.html) + додано абсолютну шорсткість ε для Дарсі–Вейсбаха.

export interface PipePreset {
  /** Внутрішній діаметр, мм. */
  dInner: number;
  /** Хазен–Вільямс C. */
  c: number;
  /** Абсолютна шорсткість ε, мм (для DW-оракула). */
  roughness: number;
  label: string;
}

/** Шорсткість за матеріалом, мм. */
const EPS_PLASTIC = 0.0015; // ПНД/ППР — дуже гладкі
const EPS_STEEL_OLD = 0.15; // стара сталь
const EPS_GALVANIZED = 0.15; // оцинковка

export const PIPE_PRESETS: Record<string, PipePreset> = {
  pnd32: { dInner: 26, c: 150, roughness: EPS_PLASTIC, label: 'ПНД 32 (внутр. 26)' },
  ppr20: { dInner: 13, c: 150, roughness: EPS_PLASTIC, label: 'ППР 20 (внутр. 13)' },
  ppr25: { dInner: 16.5, c: 150, roughness: EPS_PLASTIC, label: 'ППР 25 (внутр. 16.5)' },
  ppr32: { dInner: 21, c: 150, roughness: EPS_PLASTIC, label: 'ППР 32 (внутр. 21)' },
  steel12: { dInner: 12, c: 100, roughness: EPS_STEEL_OLD, label: 'Сталь ½" стара' },
  steel34: { dInner: 20, c: 100, roughness: EPS_STEEL_OLD, label: 'Сталь ¾" стара' },
  gi12: { dInner: 12, c: 120, roughness: EPS_GALVANIZED, label: 'Оцинковка ½"' },
  custom: { dInner: 16, c: 140, roughness: 0.05, label: 'Свій діаметр' },
};

/**
 * Дефолтний запас на фітинги (§3.1, ризик R2 плану): частка додаткової
 * еквівалентної довжини. Свідомо консервативний і показується в UI явно,
 * а не ховається як константа.
 */
export const DEFAULT_K_FITTINGS = 0.25;

export interface FixturePreset {
  label: string;
  /** Типовий потрібний тиск, бар. */
  bar: number;
  /** Типова витрата приладу, л/хв. */
  flowLmin: number;
}

/** Пресети приладів для зворотного режиму (§4.1 ТЗ). */
export const FIXTURE_PRESETS: Record<string, FixturePreset> = {
  shower: { label: 'Душ (комфорт)', bar: 1.5, flowLmin: 8 },
  hygienic: { label: 'Гігієнічний душ / змішувач', bar: 1.0, flowLmin: 6 },
  washer: { label: 'Пральна / посудомийна', bar: 1.0, flowLmin: 10 },
  garden: { label: 'Полив / шланг', bar: 2.0, flowLmin: 15 },
};
