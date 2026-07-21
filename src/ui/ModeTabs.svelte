<script lang="ts">
  import { store, type Tab } from './store.svelte';

  const tabs: { tab: Tab; label: string }[] = [
    { tab: 'forward', label: 'Який тиск я отримаю' },
    { tab: 'reverse', label: 'Який насос потрібен' },
    { tab: 'tank', label: 'Гідробак' },
  ];
</script>

<div class="tabs" role="tablist">
  {#each tabs as t (t.tab)}
    <button
      class="tab"
      role="tab"
      aria-selected={store.tab === t.tab}
      onclick={() => (store.tab = t.tab)}
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
    max-width: 100%;
    flex-wrap: wrap;
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
