<script lang="ts">
  import { store } from './store.svelte';
  import type { Mode } from '../engine/types';

  const tabs: { mode: Mode; label: string }[] = [
    { mode: 'forward', label: 'Який тиск я отримаю' },
    { mode: 'reverse', label: 'Який насос потрібен' },
  ];
</script>

<div class="tabs" role="tablist">
  {#each tabs as t (t.mode)}
    <button
      class="tab"
      role="tab"
      aria-selected={store.mode === t.mode}
      onclick={() => (store.mode = t.mode)}
    >
      {t.label}
    </button>
  {/each}
</div>

<style>
  .tabs {
    display: flex;
    gap: 4px;
    margin: 24px 0 20px;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 4px;
    width: fit-content;
  }
  .tab {
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    border: 0;
    background: transparent;
    color: var(--ink-soft);
    padding: 9px 16px;
    border-radius: 7px;
    cursor: pointer;
    transition: 0.15s;
  }
  .tab[aria-selected="true"] {
    background: var(--ink);
    color: var(--paper);
  }
</style>
