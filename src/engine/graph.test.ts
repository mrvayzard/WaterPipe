import { describe, it, expect } from 'vitest';
import { validateTree, pathToTap, findSource } from './graph';
import { defaultHouse } from './scenarios';
import type { Graph } from './types';

describe('validateTree', () => {
  it('дефолтний будинок — валідне дерево', () => {
    expect(validateTree(defaultHouse()).ok).toBe(true);
  });

  it('відхиляє два джерела', () => {
    const g = defaultHouse();
    g.nodes.push({ id: 'src2', kind: 'source', z: 0, sourceType: 'tank_booster' });
    const r = validateTree(g);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('джерело'))).toBe(true);
  });

  it('відхиляє цикл', () => {
    const g = defaultHouse();
    g.pipes.push({ id: 'loop', from: 'tap', to: 'entry', length: 1, dInner: 13, c: 150, roughness: 0.0015, kFittings: 0 });
    const r = validateTree(g);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('цикл'))).toBe(true);
  });

  it('відхиляє незвʼязний вузол', () => {
    const g = defaultHouse();
    g.nodes.push({ id: 'orphan', kind: 'tap', z: 3 });
    expect(validateTree(g).ok).toBe(false);
  });

  it('відхиляє трубу з неіснуючим вузлом', () => {
    const g = defaultHouse();
    g.pipes.push({ id: 'bad', from: 'tap', to: 'ghost', length: 1, dInner: 13, c: 150, roughness: 0.0015, kFittings: 0 });
    expect(validateTree(g).ok).toBe(false);
  });
});

describe('pathToTap', () => {
  it('повертає всі 4 ділянки у порядку джерело→кран', () => {
    const path = pathToTap(defaultHouse(), 'tap');
    expect(path.map((p) => p.id)).toEqual(['p1', 'p2', 'p3', 'p4']);
  });

  it('кидає для недосяжного крана', () => {
    const g: Graph = {
      nodes: [
        { id: 'src', kind: 'source', z: 0, sourceType: 'tank_booster' },
        { id: 'lonely', kind: 'tap', z: 2 },
      ],
      pipes: [],
    };
    expect(() => pathToTap(g, 'lonely')).toThrow();
  });
});

describe('findSource', () => {
  it('знаходить єдине джерело', () => {
    expect(findSource(defaultHouse()).id).toBe('src');
  });
});
