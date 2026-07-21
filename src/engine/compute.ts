// Розрахунок балансу напору вздовж шляху до активного крана (§3.3 ТЗ).
// Один активний кран за раз — повна витрата йде послідовно крізь усі труби шляху.

import type {
  ComputeInput,
  ComputeResult,
  GraphNode,
  Pipe,
  SegmentLoss,
  Verdict,
  Warning,
} from './types';
import { hazenWilliams, darcyWeisbach, velocity } from './headloss';
import { findSource, pathToTap } from './graph';

/** 1 бар = 10.2 м напору. */
export const BAR_TO_M = 10.2;
/** Ліміт всмоктування поверхневої станції, м (§3.4). */
export const SUCTION_LIMIT_M = 7;
/** Поріг «завеликий напір» у зворотному режимі, м (§3.4). */
export const HIGH_HEAD_M = 60;
/** Поріг швидкості потоку, м/с (§3.4). */
export const MAX_VELOCITY_MS = 2;

/** Статичний підйом джерело→кран, м (§3.2). */
export function staticLift(source: GraphNode, tap: GraphNode): number {
  return tap.z - source.z + (source.depthToWater ?? 0);
}

function pipeFriction(pipe: Pipe, qLmin: number, formula: 'hw' | 'dw', tempC: number): number {
  const lEff = pipe.length * (1 + pipe.kFittings);
  return formula === 'dw'
    ? darcyWeisbach(lEff, pipe.dInner, pipe.roughness, qLmin, tempC)
    : hazenWilliams(lEff, pipe.dInner, pipe.c, qLmin);
}

/** Кольоровий вердикт за тиском у крані (перенесено з v0.1). */
export function verdict(bar: number): Verdict {
  if (bar >= 2.5) return { level: 'good', label: 'Комфортний напір' };
  if (bar >= 1.5) return { level: 'ok', label: 'Робочий, але слабкуватий' };
  if (bar >= 0.5) return { level: 'weak', label: 'Цівка — душ мучитиметься' };
  return { level: 'none', label: 'Води практично немає' };
}

/** Повний розрахунок для активного крана. */
export function compute(input: ComputeInput): ComputeResult {
  const { graph, activeTapId, flowLmin, mode, formula = 'hw', waterTempC = 20 } = input;

  const source = findSource(graph);
  const tap = graph.nodes.find((n) => n.id === activeTapId);
  if (!tap) throw new Error(`Немає крана з id ${activeTapId}`);

  const path = pathToTap(graph, activeTapId);
  const segments: SegmentLoss[] = path.map((pipe) => ({
    pipeId: pipe.id,
    label: pipe.label ?? pipe.id,
    hf: pipeFriction(pipe, flowLmin, formula, waterTempC),
    velocity: velocity(pipe.dInner, flowLmin),
  }));

  const frictionTotal = segments.reduce((s, x) => s + x.hf, 0);
  const lift = staticLift(source, tap);
  const maxVelocity = segments.reduce((m, x) => Math.max(m, x.velocity), 0);

  const warnings: Warning[] = [];
  if (source.sourceType === 'surface_station' && (source.depthToWater ?? 0) > SUCTION_LIMIT_M) {
    warnings.push({
      code: 'suction',
      message:
        'Дзеркало глибше 7 м — поверхнева станція фізично не всмокче. Потрібна схема «бак + бустер».',
    });
  }
  if (maxVelocity > MAX_VELOCITY_MS) {
    warnings.push({
      code: 'high-velocity',
      message: `Швидкість ${maxVelocity.toFixed(1)} м/с — труба завузька для цієї витрати: шум, гідроудар, зайві втрати.`,
    });
  }

  const base: ComputeResult = {
    mode,
    staticLift: lift,
    frictionTotal,
    segments,
    maxVelocity,
    warnings,
  };

  if (mode === 'forward') {
    const pumpHead = input.pumpHead ?? 0;
    const pressureBar = (pumpHead - lift - frictionTotal) / BAR_TO_M;
    if (pressureBar < 0) {
      warnings.push({ code: 'negative-pressure', message: 'Води не дійде — тиск у крані відʼємний.' });
    }
    return { ...base, pumpHead, pressureBar, verdict: verdict(pressureBar) };
  }

  const targetBar = input.targetBar ?? 0;
  const requiredHead = targetBar * BAR_TO_M + lift + frictionTotal;
  if (requiredHead > HIGH_HEAD_M) {
    warnings.push({
      code: 'high-head',
      message: 'Потрібен напір понад 60 м — імовірно, труби завузькі, а не насос слабкий.',
    });
  }
  return { ...base, targetBar, requiredHead };
}
