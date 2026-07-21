<script lang="ts">
  import { store } from './store.svelte';

  const M_PER_BAR = 10.2;
  const pumpMaxBar = $derived(store.pumpMaxHead / M_PER_BAR);
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
      <label for="vol">Об'єм бака <span class="hint">л</span></label>
      <input id="vol" type="number" min="1" step="1" bind:value={store.tankVolumeL} />
    </div>
  {:else}
    <div class="field">
      <label for="starts">Не частіше <span class="hint">пусків/год</span></label>
      <input id="starts" type="number" min="1" step="1" bind:value={store.targetStartsPerHour} />
    </div>
  {/if}

  <p class="pump-note">
    Подача насоса в бак ≈ {store.pumpFlowIntoTank.toFixed(0)} л/хв
    <span class="hint">(станція {store.pumpMaxHead} м / {Math.round(store.pumpMaxFlow * 60)} л/год, тобто до ≈ {pumpMaxBar.toFixed(1)} бар)</span>
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
  .pump-note {
    font-size: 12px;
    color: var(--ink-soft);
    margin-top: 4px;
  }
</style>
