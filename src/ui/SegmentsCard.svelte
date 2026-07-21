<script lang="ts">
  import { store } from './store.svelte';
  import { PIPE_PRESETS } from '../engine/presets';

  const presets = Object.entries(PIPE_PRESETS);
</script>

<div class="card">
  <h2>Труби від джерела до крана</h2>
  <p class="lead">
    Геометрію ділянок (розгалуження, підйоми) редагуватимеш на схемі-конструкторі —
    Етап 3. Поки що — фізичні параметри лінійного ланцюга §8.
  </p>

  {#each store.graph.pipes as p (p.id)}
    <div class="seg">
      <input class="seg-name" bind:value={p.label} aria-label="Назва ділянки" />
      <div class="seg-grid">
        <div>
          <label for="len-{p.id}">Довжина, м</label>
          <input id="len-{p.id}" type="number" min="0" step="0.5" bind:value={p.length} />
        </div>
        <div>
          <label for="mat-{p.id}">Труба</label>
          <select id="mat-{p.id}" value={p.material} onchange={(e) => store.setPipeMaterial(p.id, e.currentTarget.value)}>
            {#each presets as [key, preset] (key)}
              <option value={key}>{preset.label}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="d-{p.id}">Внутр. Ø, мм</label>
          <input id="d-{p.id}" type="number" min="1" step="0.5" bind:value={p.dInner} />
        </div>
        <div>
          <label for="k-{p.id}">Фітинги, +частка</label>
          <input id="k-{p.id}" type="number" min="0" max="1" step="0.05" bind:value={p.kFittings} />
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 20px;
  }
  h2 {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ink-soft);
    margin-bottom: 10px;
  }
  .lead {
    font-size: 12px;
    color: var(--ink-soft);
    margin-bottom: 16px;
  }
  .seg {
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    background: #fff;
  }
  .seg-name {
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    border: 0;
    border-bottom: 1px dashed transparent;
    background: transparent;
    padding: 2px 0;
    margin-bottom: 10px;
    width: 100%;
  }
  .seg-name:focus {
    outline: 0;
    border-bottom-color: var(--line-strong);
  }
  .seg-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .seg-grid label {
    display: block;
    font-size: 11px;
    color: var(--ink-soft);
    margin-bottom: 3px;
  }
  .seg-grid :global(input),
  .seg-grid :global(select) {
    font-size: 13px;
    padding: 6px 8px;
  }
</style>
