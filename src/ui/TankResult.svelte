<script lang="ts">
  import { store } from './store.svelte';
  import { tankVerdict, type TankVerdictLevel } from '../engine/tank';

  const M_PER_BAR = 10.2;

  const perf = $derived(store.tankPerf);
  const req = $derived(store.tankReq);
  const stationTooWeak = $derived(store.pumpFlowIntoTank <= 0);
  const cutoutInvalid = $derived(store.cutOut <= store.cutIn);

  const verdictClass: Record<TankVerdictLevel, string> = {
    good: 'v-good',
    ok: 'v-ok',
    bad: 'v-bad',
  };
  const v = $derived(tankVerdict(perf.startsPerHour));
  const startsText = $derived(Number.isFinite(perf.startsPerHour) ? perf.startsPerHour.toFixed(0) : '—');
</script>

<div class="card">
  {#if store.tankMode === 'have'}
    <div class="gauge">
      <div class="big">{startsText}<span class="unit"> пусків/год</span></div>
      <div class="where">як часто вмикатиметься насос</div>
      {#if !stationTooWeak && !cutoutInvalid}
        <div class="verdict {verdictClass[v.level]}">{v.label}</div>
      {/if}
    </div>

    <div class="node">
      <span class="dot" style="background:var(--blue)"></span>
      <span class="lbl">Корисний запас води<small>між пусками насоса</small></span>
      <span class="val">{perf.drawdownL.toFixed(1)} л</span>
    </div>
    <div class="node">
      <span class="dot" style="background:var(--teal)"></span>
      <span class="lbl">Час роботи за пуск<small>найгірший розбір</small></span>
      <span class="val">{perf.runMinutes.toFixed(1)} хв</span>
    </div>
    <div class="node">
      <span class="dot" style="background:var(--amber)"></span>
      <span class="lbl">Передзарядка повітря<small>тиск у баку без води</small></span>
      <span class="val">{perf.precharge.toFixed(2)} бар</span>
    </div>
  {:else}
    <div class="gauge">
      <div class="big">{req.requiredTankL.toFixed(0)}<span class="unit"> л</span></div>
      <div class="where">потрібний об'єм бака під ≤ {store.targetStartsPerHour} пусків/год</div>
      <div class="verdict v-good">бери найближчий стандартний ≥ цього</div>
    </div>

    <div class="node">
      <span class="dot" style="background:var(--blue)"></span>
      <span class="lbl">Потрібний запас води<small>між пусками</small></span>
      <span class="val">{req.requiredDrawdownL.toFixed(1)} л</span>
    </div>
    <div class="node">
      <span class="dot" style="background:var(--amber)"></span>
      <span class="lbl">Передзарядка повітря<small>виставити на баку</small></span>
      <span class="val">{req.precharge.toFixed(2)} бар</span>
    </div>
  {/if}

  {#if cutoutInvalid}
    <div class="warn">Тиск вимкнення має бути вищим за тиск увімкнення.</div>
  {:else if stationTooWeak}
    <div class="warn">
      Станція не дотягує до тиску вимкнення {store.cutOut} бар (макс ≈
      {(store.pumpMaxHead / M_PER_BAR).toFixed(1)} бар) — реле не вимкнеться, бак не допоможе.
    </div>
  {/if}

  <div class="note">
    Модель: запас = об'єм · P_перед·(1/P_увімк − 1/P_вимк) за законом Бойля; пуски = 15·подача/запас
    (найгірший розбір = ½ подачі).
  </div>
</div>

<style>
  .card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 20px;
    position: sticky;
    top: 20px;
  }
  .gauge {
    text-align: center;
    padding: 8px 0 18px;
    border-bottom: 1px solid var(--line);
    margin-bottom: 18px;
  }
  .big {
    font-variant-numeric: tabular-nums;
    font-size: 46px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .unit {
    font-size: 18px;
    color: var(--ink-soft);
    font-weight: 400;
  }
  .where {
    font-size: 13px;
    color: var(--ink-soft);
    margin-top: 8px;
  }
  .verdict {
    display: inline-block;
    font-size: 13px;
    font-weight: 500;
    padding: 5px 12px;
    border-radius: 20px;
    margin-top: 12px;
  }
  .v-good {
    background: var(--teal-bg);
    color: var(--teal);
  }
  .v-ok {
    background: var(--amber-bg);
    color: var(--amber);
  }
  .v-bad {
    background: var(--red-bg);
    color: var(--red);
  }
  .node {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 0;
  }
  .node + .node {
    border-top: 1px solid var(--line);
  }
  .lbl {
    flex: 1;
    font-size: 13px;
  }
  .lbl small {
    display: block;
    color: var(--ink-soft);
    font-size: 11px;
  }
  .val {
    font-variant-numeric: tabular-nums;
    font-size: 16px;
    font-weight: 600;
    min-width: 76px;
    text-align: right;
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .warn {
    background: var(--red-bg);
    color: var(--red);
    font-size: 13px;
    padding: 10px 12px;
    border-radius: 8px;
    margin-top: 14px;
  }
  .note {
    font-size: 12px;
    color: var(--ink-soft);
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--line);
  }
</style>
