// Операції над графом-схемою: пошук джерела, шлях до крана, валідація «дерево».

import type { Graph, GraphNode, Pipe } from './types';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/** Повертає єдиний вузол-джерело або кидає, якщо його немає / їх кілька. */
export function findSource(graph: Graph): GraphNode {
  const sources = graph.nodes.filter((n) => n.kind === 'source');
  if (sources.length !== 1) {
    throw new Error(`Очікується рівно одне джерело, знайдено ${sources.length}`);
  }
  return sources[0]!;
}

/**
 * Перевіряє топологію v1: рівно одне джерело, коректні кінці труб, зв'язність,
 * відсутність циклів (дерево). Повертає список помилок, не кидає.
 */
export function validateTree(graph: Graph): ValidationResult {
  const errors: string[] = [];
  const { nodes, pipes } = graph;
  const ids = new Set(nodes.map((n) => n.id));

  if (ids.size !== nodes.length) errors.push('Дублікати id вузлів');

  const sourceCount = nodes.filter((n) => n.kind === 'source').length;
  if (sourceCount !== 1) errors.push(`Має бути рівно одне джерело (зараз ${sourceCount})`);

  for (const p of pipes) {
    if (!ids.has(p.from) || !ids.has(p.to)) {
      errors.push(`Труба ${p.id}: посилання на неіснуючий вузол`);
    }
    if (p.from === p.to) errors.push(`Труба ${p.id}: петля на одному вузлі`);
  }

  // Union-Find для виявлення циклів і підрахунку компонент зв'язності.
  const parent = new Map<string, string>();
  nodes.forEach((n) => parent.set(n.id, n.id));
  const find = (x: string): string => {
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root)!;
    while (parent.get(x) !== root) {
      const next = parent.get(x)!;
      parent.set(x, root);
      x = next;
    }
    return root;
  };

  let cyclic = false;
  for (const p of pipes) {
    if (!ids.has(p.from) || !ids.has(p.to) || p.from === p.to) continue;
    const a = find(p.from);
    const b = find(p.to);
    if (a === b) {
      cyclic = true;
    } else {
      parent.set(a, b);
    }
  }
  if (cyclic) errors.push('Схема містить цикл — у v1 дозволено лише дерево');

  if (nodes.length > 0) {
    const roots = new Set(nodes.map((n) => find(n.id)));
    if (roots.size > 1 && !cyclic) errors.push('Схема незвʼязна — є відокремлені вузли');
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Єдиний шлях (список труб у порядку проходження) від джерела до крана.
 * Спирається на деревність графа. Кидає, якщо шляху немає.
 */
export function pathToTap(graph: Graph, tapId: string): Pipe[] {
  const source = findSource(graph);
  if (!graph.nodes.some((n) => n.id === tapId)) {
    throw new Error(`Немає вузла з id ${tapId}`);
  }

  // Список суміжності: вузол → [{сусід, труба}].
  const adj = new Map<string, { to: string; pipe: Pipe }[]>();
  for (const n of graph.nodes) adj.set(n.id, []);
  for (const p of graph.pipes) {
    adj.get(p.from)?.push({ to: p.to, pipe: p });
    adj.get(p.to)?.push({ to: p.from, pipe: p });
  }

  // BFS від джерела; відновлюємо шлях по попередниках.
  const prevPipe = new Map<string, Pipe>();
  const visited = new Set<string>([source.id]);
  const queue: string[] = [source.id];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur === tapId) break;
    for (const { to, pipe } of adj.get(cur) ?? []) {
      if (visited.has(to)) continue;
      visited.add(to);
      prevPipe.set(to, pipe);
      queue.push(to);
    }
  }

  if (tapId !== source.id && !prevPipe.has(tapId)) {
    throw new Error(`Кран ${tapId} недосяжний від джерела`);
  }

  // Розкручуємо шлях від крана до джерела, потім реверс.
  const path: Pipe[] = [];
  let node = tapId;
  while (node !== source.id) {
    const pipe = prevPipe.get(node)!;
    path.push(pipe);
    node = pipe.from === node ? pipe.to : pipe.from;
  }
  path.reverse();
  return path;
}
