<script lang="ts">
  import { store } from './store.svelte';
  import { PRESSURE_SWITCH_PRESETS } from '../engine/presets';

  const depth = $derived(store.source.depthToWater ?? 0);
  const switches = Object.entries(PRESSURE_SWITCH_PRESETS);
</script>

<div class="card">
  <h2>Гідроакумулятор</h2>
  <p class="lead">
    Бак не міняє тиск у крані — він задає запас води й частоту вмикання насоса. Подачу в бак
    рушій бере з кривої станції при тиску вимкнення.
  </p>

  <div class="seg-toggle" role="group">
    <button class:on={store.tankMode === 'have'} onclick={() => (store.tankMode = 'have')}>
      Маю бак
    </button>
    <button class:on={store.tankMode === 'need'} onclick={() => (store.tankMode = 'need')}>
      Який бак треба
    </button>
  </div>

  <div class="field">
    <label for="switch">Готові налаштування реле <span class="hint">якщо не знаєш, з чого почати</span></label>
    <select id="switch" onchange={(e) => store.applyPressureSwitch(e.currentTarget.value)}>
      <option value="">— обери пресет —</option>
      {#each switches as [key, p] (key)}
        <option value={key}>{p.label}</option>
      {/each}
    </select>
  </div>

  <div class="row2">
    <div class="field">
      <label for="cutin">Реле: увімкнення <span class="hint">бар</span></label>
      <input id="cutin" type="number" min="0" step="0.1" bind:value={store.cutIn} />
    </div>
    <div class="field">
      <label for="cutout">Реле: вимкнення <span class="hint">бар</span></label>
      <input id="cutout" type="number" min="0" step="0.1" bind:value={store.cutOut} />
    </div>
  </div>

  <p class="guide">
    Для крана на {store.tap.z} м увімкнення варто ставити ≥ <b>{store.recommendedCutIn.toFixed(1)} бар</b>
    (щоб і перед пуском був робочий тиск). Вимкнення — на 1–1.5 бар вище, але не більше ≈
    <b>{store.maxTankBar.toFixed(1)} бар</b> (стільки станція тисне в бак з {depth} м).
  </p>

  <div class="field">
    <label class="check">
      <input type="checkbox" bind:checked={store.prechargeAuto} />
      Передзарядка повітря автоматично <span class="hint">= увімкнення − 0.14 бар</span>
    </label>
    {#if !store.prechargeAuto}
      <input type="number" min="0" step="0.1" bind:value={store.prechargeManual} />
    {/if}
  </div>

  {#if store.tankMode === 'have'}
    <div class="field">
      <label for="vol">Об'єм бака <span class="hint">л · типово 24, 50, 80, 100</span></label>
      <input id="vol" type="number" min="1" step="1" bind:value={store.tankVolumeL} />
    </div>
  {:else}
    <div class="field">
      <label for="starts">Не частіше <span class="hint">пусків/год · 15–30 норма, менше = насос живе довше</span></label>
      <input id="starts" type="number" min="1" step="1" bind:value={store.targetStartsPerHour} />
    </div>
  {/if}

  <p class="pump-note">
    Подача насоса в бак ≈ {store.pumpFlowIntoTank.toFixed(0)} л/хв
    <span class="hint">(з підйомом з {depth} м станція тисне в бак до ≈ {store.maxTankBar.toFixed(1)} бар)</span>
  </p>
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
    margin-bottom: 10px;
  }
  .lead {
    font-size: 12px;
    color: var(--ink-soft);
    margin-bottom: 16px;
  }
  .seg-toggle {
    display: flex;
    gap: 4px;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 4px;
    margin-bottom: 16px;
    width: fit-content;
  }
  .seg-toggle button {
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    border: 0;
    background: transparent;
    color: var(--ink-soft);
    padding: 7px 14px;
    border-radius: 6px;
    cursor: pointer;
  }
  .seg-toggle button.on {
    background: var(--ink);
    color: var(--paper);
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
  label.check {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 400;
    cursor: pointer;
  }
  label.check input {
    width: auto;
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
  .guide {
    font-size: 12px;
    color: var(--ink-soft);
    background: var(--blue-bg);
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 16px;
    line-height: 1.5;
  }
  .guide b {
    color: var(--ink);
    font-weight: 600;
  }
  .pump-note {
    font-size: 12px;
    color: var(--ink-soft);
    margin-top: 4px;
  }
</style>
