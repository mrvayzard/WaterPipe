<script lang="ts">
  import { store } from './store.svelte';
  import type { VerdictLevel } from '../engine/types';

  const r = $derived(store.result);

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
      <div class="where">тиск у точці розбору</div>
      {#if r.verdict}
        <div class="verdict {verdictClass[r.verdict.level]}">{r.verdict.label}</div>
      {/if}
      <div class="caveat">оцінка при заданій витраті {store.flowLmin} л/хв, не робоча точка</div>
    </div>
  {:else}
    <div class="gauge">
      <div class="big">{(r.requiredHead ?? 0).toFixed(0)}<span class="unit"> м</span></div>
      <div class="where">потрібний напір насоса</div>
      <div class="verdict v-good">≈ {((r.requiredHead ?? 0) / 10.2).toFixed(1)} бар на виході</div>
    </div>
  {/if}

  <div class="node">
    <span class="dot" style="background:var(--blue)"></span>
    <span class="lbl">Статичний підйом<small>джерело → кран</small></span>
    <span class="val">{r.staticLift.toFixed(1)} м</span>
  </div>
  <div class="node">
    <span class="dot" style="background:var(--amber)"></span>
    <span class="lbl">Втрати на тертя<small>усі труби при {store.flowLmin} л/хв</small></span>
    <span class="val">{r.frictionTotal.toFixed(1)} м</span>
  </div>
  {#if r.mode === 'forward'}
    <div class="node">
      <span class="dot" style="background:var(--teal)"></span>
      <span class="lbl">Напір станції<small>що ти задав</small></span>
      <span class="val">{(r.pumpHead ?? 0).toFixed(0)} м</span>
    </div>
    {@const bar = r.pressureBar ?? 0}
    <div class="bar-track">
      <div
        class="bar-fill"
        style="width:{Math.max(0, Math.min(100, (bar / 4) * 100))}%;background:{barColor(bar)}"
      ></div>
    </div>
  {/if}

  {#each r.warnings as w (w.code)}
    <div class="warn">{w.message}</div>
  {/each}

  <div class="note">
    <strong>Втрати по ділянках</strong> (макс. швидкість {r.maxVelocity.toFixed(2)} м/с):<br />
    {#each r.segments as s (s.pipeId)}
      {s.label}: {s.hf.toFixed(2)} м<br />
    {/each}
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
    font-size: 15px;
    font-weight: 500;
    min-width: 66px;
    text-align: right;
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
</style>
