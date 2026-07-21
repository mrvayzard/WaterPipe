<script lang="ts">
  import { store } from './store.svelte';
  import type { VerdictLevel } from '../engine/types';

  const r = $derived(store.result);

  const M_PER_BAR = 10.2;
  const toBar = (m: number): number => m / M_PER_BAR;

  const verdictClass: Record<VerdictLevel, string> = {
    good: 'v-good',
    ok: 'v-ok',
    weak: 'v-bad',
    none: 'v-bad',
  };

  const barColor = (bar: number): string =>
    bar >= 2.5 ? 'var(--teal)' : bar >= 1.5 ? 'var(--amber)' : 'var(--red)';
</script>

<div class="card">
  {#if r.mode === 'forward'}
    {@const bar = Math.max(r.pressureBar ?? 0, 0)}
    <div class="gauge">
      <div class="big">{bar.toFixed(2)}<span class="unit"> бар</span></div>
      <div class="where">тиск у крані</div>
      {#if r.verdict}
        <div class="verdict {verdictClass[r.verdict.level]}">{r.verdict.label}</div>
      {/if}
      <div class="caveat">за кривою насоса, розбір {store.flowLmin} л/хв</div>
    </div>

    <div class="node">
      <span class="dot" style="background:var(--teal)"></span>
      <span class="lbl">Станція створює<small>напір у робочій точці, {store.flowLmin} л/хв</small></span>
      <span class="val">{toBar(r.pumpHead ?? 0).toFixed(2)} <span class="b">бар</span><small>{(r.pumpHead ?? 0).toFixed(1)} м</small></span>
    </div>
    <div class="node">
      <span class="dot" style="background:var(--blue)"></span>
      <span class="lbl">− Підйом води до крана<small>джерело → кран</small></span>
      <span class="val">{toBar(r.staticLift).toFixed(2)} <span class="b">бар</span><small>{r.staticLift.toFixed(1)} м</small></span>
    </div>
    <div class="node">
      <span class="dot" style="background:var(--amber)"></span>
      <span class="lbl">− Тертя в трубах<small>усі труби при {store.flowLmin} л/хв</small></span>
      <span class="val">{toBar(r.frictionTotal).toFixed(2)} <span class="b">бар</span><small>{r.frictionTotal.toFixed(1)} м</small></span>
    </div>

    {@const signed = r.pressureBar ?? 0}
    <div class="bar-track">
      <div
        class="bar-fill"
        style="width:{Math.max(0, Math.min(100, (signed / 4) * 100))}%;background:{barColor(signed)}"
      ></div>
    </div>
  {:else}
    {@const req = r.requiredHead ?? 0}
    <div class="gauge">
      <div class="big">{toBar(req).toFixed(1)}<span class="unit"> бар</span></div>
      <div class="where">тиск, який має давати станція при {store.flowLmin} л/хв</div>
      <div class="verdict v-good">≈ {req.toFixed(0)} м напору · бери з запасом</div>
    </div>

    <div class="node">
      <span class="dot" style="background:var(--teal)"></span>
      <span class="lbl">Треба в крані<small>бажаний тиск</small></span>
      <span class="val">{(r.targetBar ?? 0).toFixed(2)} <span class="b">бар</span></span>
    </div>
    <div class="node">
      <span class="dot" style="background:var(--blue)"></span>
      <span class="lbl">+ Підйом води до крана<small>джерело → кран</small></span>
      <span class="val">{toBar(r.staticLift).toFixed(2)} <span class="b">бар</span><small>{r.staticLift.toFixed(1)} м</small></span>
    </div>
    <div class="node">
      <span class="dot" style="background:var(--amber)"></span>
      <span class="lbl">+ Тертя в трубах<small>усі труби при {store.flowLmin} л/хв</small></span>
      <span class="val">{toBar(r.frictionTotal).toFixed(2)} <span class="b">бар</span><small>{r.frictionTotal.toFixed(1)} м</small></span>
    </div>
  {/if}

  {#each r.warnings as w (w.code)}
    <div class="warn">{w.message}</div>
  {/each}

  <div class="note">
    <strong>Де саме тертя</strong> (напір, м · макс. швидкість {r.maxVelocity.toFixed(2)} м/с):<br />
    {#each r.segments as s (s.pipeId)}
      {s.label}: {s.hf.toFixed(2)} м<br />
    {/each}
    <span class="bridge">1 бар ≈ 10.2 м напору</span>
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
    font-size: 52px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .unit {
    font-size: 20px;
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
  .caveat {
    font-size: 11px;
    color: var(--ink-soft);
    margin-top: 10px;
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
  .val .b {
    font-size: 12px;
    font-weight: 400;
    color: var(--ink-soft);
  }
  .val small {
    display: block;
    font-size: 11px;
    font-weight: 400;
    color: var(--ink-soft);
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .bar-track {
    height: 5px;
    background: var(--line);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 14px;
  }
  .bar-fill {
    height: 100%;
    border-radius: 3px;
    transition:
      width 0.25s,
      background 0.25s;
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
  .bridge {
    display: block;
    margin-top: 8px;
    font-style: italic;
    opacity: 0.8;
  }
</style>
