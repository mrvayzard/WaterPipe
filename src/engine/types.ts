// Типи розрахункового рушія «Напір». Чистий TS, без залежностей від UI.

/** Тип джерела води (§3.0 ТЗ) — керує статичним підйомом і попередженнями. */
export type SourceType = 'surface_station' | 'tank_booster';

/** Роль вузла у схемі. */
export type NodeKind = 'source' | 'tee' | 'tap';

/** Вузол графа-схеми. Висота `z` — над датумом (рівень насоса/станції = 0). */
export interface GraphNode {
  id: string;
  kind: NodeKind;
  /** Висота вузла над датумом, м. Кран 2 поверху ~ +5…7, ввід у будинок ~ 0. */
  z: number;
  label?: string;
  /** Лише для kind==='source'. */
  sourceType?: SourceType;
  /** Лише для source + surface_station: глибина дзеркала нижче станції, м (§3.2). */
  depthToWater?: number;
}

/** Труба — ребро графа з усіма фізичними параметрами ділянки. */
export interface Pipe {
  id: string;
  /** id вузла-початку. */
  from: string;
  /** id вузла-кінця. */
  to: string;
  label?: string;
  /** Геометрична довжина ділянки L, м. */
  length: number;
  /** Внутрішній діаметр, мм. */
  dInner: number;
  /** Коефіцієнт шорсткості Хазена–Вільямса (пластик 150, оцинковка 120, сталь 100). */
  c: number;
  /** Абсолютна шорсткість ε, мм — для Дарсі–Вейсбаха (тест-оракул §5). */
  roughness: number;
  /** Запас на фітинги: частка додаткової еквівалентної довжини (§3.1). L_eff = length·(1+kFittings). */
  kFittings: number;
  /** Ключ пресету матеріалу (для UI). */
  material?: string;
}

/** Схема водопостачання як граф. У v1 — дерево з рівно одним джерелом (§4.0). */
export interface Graph {
  nodes: GraphNode[];
  pipes: Pipe[];
}

export type Formula = 'hw' | 'dw';
export type Mode = 'forward' | 'reverse';

export interface ComputeInput {
  graph: Graph;
  /** id активного крана, до якого рахуємо шлях. */
  activeTapId: string;
  /** Витрата розбору, л/хв. */
  flowLmin: number;
  mode: Mode;
  /** Прямий режим: напір насоса в робочій точці, м. */
  pumpHead?: number;
  /** Зворотний режим: бажаний тиск у крані, бар. */
  targetBar?: number;
  /** Формула тертя. За замовчуванням 'hw' (двигун); 'dw' — оракул. */
  formula?: Formula;
  /** Температура води, °C (впливає лише на 'dw'). */
  waterTempC?: number;
}

export type VerdictLevel = 'good' | 'ok' | 'weak' | 'none';

export interface Verdict {
  level: VerdictLevel;
  label: string;
}

export type WarningCode = 'suction' | 'negative-pressure' | 'high-head' | 'high-velocity';

export interface Warning {
  code: WarningCode;
  message: string;
}

export interface SegmentLoss {
  pipeId: string;
  label: string;
  /** Втрати на тертя на ділянці, м. */
  hf: number;
  /** Швидкість потоку в ділянці, м/с. */
  velocity: number;
}

export interface ComputeResult {
  mode: Mode;
  /** Статичний підйом джерело→кран, м. */
  staticLift: number;
  /** Сумарні втрати на тертя вздовж шляху, м. */
  frictionTotal: number;
  segments: SegmentLoss[];
  /** Максимальна швидкість по ділянках шляху, м/с. */
  maxVelocity: number;
  warnings: Warning[];
  // --- прямий режим ---
  pumpHead?: number;
  /** Тиск у крані, бар. Може бути від'ємним (води не дійде). */
  pressureBar?: number;
  verdict?: Verdict;
  // --- зворотний режим ---
  targetBar?: number;
  /** Потрібний напір насоса, м. */
  requiredHead?: number;
}
