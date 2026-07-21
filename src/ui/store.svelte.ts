// Реактивний стан застосунку поверх рушія. На Етапі 2 граф — фіксований
// дефолтний будинок §8 (лінійний ланцюг); редагується через панелі, canvas
// зʼявиться на Етапі 3.

import { defaultHouse } from '../engine/scenarios';
import { compute } from '../engine/compute';
import { flowAtHead } from '../engine/pump';
import {
  prechargeDefault,
  tankPerformance,
  requiredTankVolume,
  type TankPerformance,
  type TankRequirement,
} from '../engine/tank';
import { FIXTURE_PRESETS, PIPE_PRESETS } from '../engine/presets';
import type { ComputeResult, Formula, Graph, GraphNode, Mode } from '../engine/types';

/** Верхня вкладка: два режими тиску + гілка гідробака. */
export type Tab = 'forward' | 'reverse' | 'tank';

const M_PER_BAR = 10.2;

class AppStore {
  graph = $state<Graph>(defaultHouse(0.25));
  tab = $state<Tab>('forward');
  activeTapId = $state('tap');
  flowLmin = $state(10);
  /** Паспортні числа станції з коробки (§ крива насоса). */
  pumpMaxHead = $state(43);
  pumpMaxFlow = $state(60);
  targetBar = $state(1.5);
  fixtureKey = $state<string>('custom');
  formula = $state<Formula>('hw');

  // --- гідробак (Етап 2.6) ---
  tankMode = $state<'have' | 'need'>('have');
  tankVolumeL = $state(24);
  cutIn = $state(1.5);
  cutOut = $state(3.0);
  prechargeAuto = $state(true);
  prechargeManual = $state(1.36);
  targetStartsPerHour = $state(20);

  /** Режим тиску для рушія (гілка бака не рахує тиск). */
  get mode(): Mode {
    return this.tab === 'reverse' ? 'reverse' : 'forward';
  }

  result = $derived<ComputeResult>(
    compute({
      graph: this.graph,
      activeTapId: this.activeTapId,
      flowLmin: this.flowLmin,
      mode: this.mode,
      pumpMaxHead: this.pumpMaxHead,
      pumpMaxFlow: this.pumpMaxFlow,
      targetBar: this.targetBar,
      formula: this.formula,
    }),
  );

  precharge = $derived(this.prechargeAuto ? prechargeDefault(this.cutIn) : this.prechargeManual);

  /**
   * Подача насоса в бак = витрата з кривої при напорі, який насос долає під час
   * наповнення: тиск вимкнення + підйом води з глибини. Тертя у фідері поки
   * знехтуване (малий член при цих витратах). Для «бак+бустер» глибина = 0.
   */
  pumpFlowIntoTank = $derived(
    flowAtHead(
      this.cutOut * M_PER_BAR + (this.source.depthToWater ?? 0),
      this.pumpMaxHead,
      this.pumpMaxFlow,
    ),
  );

  tankPerf = $derived<TankPerformance>(
    tankPerformance(this.tankVolumeL, this.cutIn, this.cutOut, this.precharge, this.pumpFlowIntoTank),
  );

  tankReq = $derived<TankRequirement>(
    requiredTankVolume(
      this.targetStartsPerHour,
      this.cutIn,
      this.cutOut,
      this.precharge,
      this.pumpFlowIntoTank,
    ),
  );

  get source(): GraphNode {
    return this.graph.nodes.find((n) => n.id === 'src')!;
  }

  get tap(): GraphNode {
    return this.graph.nodes.find((n) => n.id === this.activeTapId)!;
  }

  /** Пресет приладу підставляє і бажаний тиск, і типову витрату (§4.1). */
  applyFixture(key: string): void {
    this.fixtureKey = key;
    const f = FIXTURE_PRESETS[key];
    if (f) {
      this.targetBar = f.bar;
      this.flowLmin = f.flowLmin;
    }
  }

  /** Зміна матеріалу труби переносить діаметр, C і шорсткість із пресету. */
  setPipeMaterial(pipeId: string, material: string): void {
    const p = this.graph.pipes.find((x) => x.id === pipeId);
    const preset = PIPE_PRESETS[material];
    if (p && preset) {
      p.material = material;
      p.dInner = preset.dInner;
      p.c = preset.c;
      p.roughness = preset.roughness;
    }
  }
}

export const store = new AppStore();
