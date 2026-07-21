<script lang="ts">
  import { store } from './store.svelte';
  import { FIXTURE_PRESETS } from '../engine/presets';
  import type { SourceType } from '../engine/types';

  const sourceTypes: { value: SourceType; label: string }[] = [
    { value: 'surface_station', label: 'Поверхнева станція (всмоктує з глибини)' },
    { value: 'tank_booster', label: 'Бак + бустер (насос у будинку)' },
  ];

  const fixtures = Object.entries(FIXTURE_PRESETS);

  // Паспортна подача на коробці — у л/год; усередині рушій рахує в л/хв.
  const maxFlowLh = $derived(Math.round(store.pumpMaxFlow * 60));
  function setMaxFlowLh(lh: number) {
    store.pumpMaxFlow = lh / 60;
  }
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
        <label for="depth">Глибина до води <span class="hint">м нижче насоса</span></label>
        <input id="depth" type="number" min="0" step="0.5" bind:value={store.source.depthToWater} />
      </div>
    {/if}
    <div class="field">
      <label for="taph">Кран вище насоса на <span class="hint">м · 2 поверх ≈ 5–7</span></label>
      <input id="taph" type="number" min="0" step="0.5" bind:value={store.tap.z} />
    </div>
  </div>

  <div class="field">
    <label for="fixture">Що вмикаємо <span class="hint">підставить типову витрату</span></label>
    <select
      id="fixture"
      value={store.fixtureKey}
      onchange={(e) => store.applyFixture(e.currentTarget.value)}
    >
      {#each fixtures as [key, f] (key)}
        <option value={key}>{f.label} — {f.flowLmin} л/хв</option>
      {/each}
      <option value="custom">Свій варіант</option>
    </select>
  </div>

  {#if store.mode === 'forward'}
    <div class="field">
      <label for="flow">Витрата розбору <span class="hint">л/хв</span></label>
      <input id="flow" type="number" min="1" step="1" bind:value={store.flowLmin} />
    </div>
    <div class="pump-block">
      <div class="block-title">Станція — два числа з коробки</div>
      <div class="row2">
        <div class="field">
          <label for="pmax">Макс. напір <span class="hint">м · «висота підйому»</span></label>
          <input id="pmax" type="number" min="0" step="1" bind:value={store.pumpMaxHead} />
        </div>
        <div class="field">
          <label for="qmax">Макс. подача <span class="hint">л/год</span></label>
          <input
            id="qmax"
            type="number"
            min="0"
            step="100"
            value={maxFlowLh}
            oninput={(e) => setMaxFlowLh(+e.currentTarget.value)}
          />
        </div>
      </div>
      <p class="pump-note">Робочу точку на кривій рушій знайде сам — «напір у робочій точці» вводити не треба.</p>
    </div>
  {:else}
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
  .pump-block {
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 12px;
    background: #fff;
  }
  .block-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-soft);
    margin-bottom: 10px;
  }
  .pump-block .field:last-child {
    margin-bottom: 0;
  }
  .pump-note {
    font-size: 11px;
    color: var(--ink-soft);
    margin-top: 4px;
  }
</style>
