<script lang="ts">
  import { store } from './store.svelte';
  import { FIXTURE_PRESETS } from '../engine/presets';
  import type { SourceType } from '../engine/types';

  const sourceTypes: { value: SourceType; label: string }[] = [
    { value: 'surface_station', label: 'Поверхнева станція (всмоктує з глибини)' },
    { value: 'tank_booster', label: 'Бак + бустер (насос у будинку)' },
  ];

  const fixtures = Object.entries(FIXTURE_PRESETS);
</script>

<div class="card">
  <h2>Джерело та розбір</h2>

  <div class="field">
    <label for="src-type">Тип джерела</label>
    <select id="src-type" bind:value={store.source.sourceType}>
      {#each sourceTypes as s (s.value)}
        <option value={s.value}>{s.label}</option>
      {/each}
    </select>
  </div>

  <div class="row2">
    {#if store.source.sourceType === 'surface_station'}
      <div class="field">
        <label for="depth">Дзеркало води <span class="hint">м нижче станції</span></label>
        <input id="depth" type="number" min="0" step="0.5" bind:value={store.source.depthToWater} />
      </div>
    {/if}
    <div class="field">
      <label for="taph">Висота точки розбору <span class="hint">м над вводом</span></label>
      <input id="taph" type="number" min="0" step="0.5" bind:value={store.tap.z} />
    </div>
  </div>

  {#if store.mode === 'forward'}
    <div class="row2">
      <div class="field">
        <label for="flow">Витрата <span class="hint">л/хв</span></label>
        <input id="flow" type="number" min="1" step="1" bind:value={store.flowLmin} />
      </div>
      <div class="field">
        <label for="pump">Напір станції <span class="hint">м, у робочій точці</span></label>
        <input id="pump" type="number" min="0" step="1" bind:value={store.pumpHead} />
      </div>
    </div>
  {:else}
    <div class="field">
      <label for="fixture">Прилад</label>
      <select id="fixture" value={store.fixtureKey} onchange={(e) => store.applyFixture(e.currentTarget.value)}>
        {#each fixtures as [key, f] (key)}
          <option value={key}>{f.label} — {f.bar} бар, {f.flowLmin} л/хв</option>
        {/each}
        <option value="custom">Свій варіант</option>
      </select>
    </div>
    <div class="row2">
      <div class="field">
        <label for="target">Бажаний тиск <span class="hint">бар</span></label>
        <input id="target" type="number" min="0.5" step="0.1" bind:value={store.targetBar} />
      </div>
      <div class="field">
        <label for="flow-r">Витрата <span class="hint">л/хв</span></label>
        <input id="flow-r" type="number" min="1" step="1" bind:value={store.flowLmin} />
      </div>
    </div>
  {/if}
</div>

<style>
  .card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 20px;
  }
  h2 {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ink-soft);
    margin-bottom: 16px;
  }
  .field {
    margin-bottom: 16px;
  }
  .field:last-child {
    margin-bottom: 0;
  }
  label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 6px;
  }
  label .hint {
    color: var(--ink-soft);
    font-weight: 400;
  }
  .row2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
</style>
