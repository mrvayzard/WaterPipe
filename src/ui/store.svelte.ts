// Реактивний стан застосунку поверх рушія. На Етапі 2 граф — фіксований
// дефолтний будинок §8 (лінійний ланцюг); редагується через панелі, canvas
// зʼявиться на Етапі 3.

import { defaultHouse } from '../engine/scenarios';
import { compute } from '../engine/compute';
import { FIXTURE_PRESETS, PIPE_PRESETS } from '../engine/presets';
import type { ComputeResult, Formula, Graph, GraphNode, Mode } from '../engine/types';

class AppStore {
  graph = $state<Graph>(defaultHouse(0.25));
  mode = $state<Mode>('forward');
  activeTapId = $state('tap');
  flowLmin = $state(10);
  pumpHead = $state(25);
  targetBar = $state(1.5);
  fixtureKey = $state<string>('custom');
  formula = $state<Formula>('hw');

  result = $derived<ComputeResult>(
    compute({
      graph: this.graph,
      activeTapId: this.activeTapId,
      flowLmin: this.flowLmin,
      mode: this.mode,
      pumpHead: this.pumpHead,
      targetBar: this.targetBar,
      formula: this.formula,
    }),
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
