<script lang="ts">
  import ModeTabs from './ui/ModeTabs.svelte';
  import InputsCard from './ui/InputsCard.svelte';
  import SegmentsCard from './ui/SegmentsCard.svelte';
  import ResultPanel from './ui/ResultPanel.svelte';
</script>

<div class="wrap">
  <header>
    <div class="brand">
      <h1>Напір</h1>
      <span class="tag">v0.2 · без сервера</span>
    </div>
    <p class="sub">
      Рахує тиск води в крані для будинку зі свердловиною: глибина дзеркала, довжина й діаметр труб,
      підйом на поверхи та характеристика насоса.
    </p>
  </header>

  <ModeTabs />

  <div class="grid">
    <div>
      <InputsCard />
      <SegmentsCard />
    </div>
    <ResultPanel />
  </div>

  <p class="foot">
    Модель: втрати на тертя за Хазеном–Вільямсом, статичний підйом = глибина дзеркала + висота
    точки розбору. 1 бар = 10.2 м напору. Оцінка для одночасного розбору однієї точки.
  </p>
</div>

<style>
  .wrap {
    max-width: 960px;
    margin: 0 auto;
  }
  header {
    margin-bottom: 4px;
  }
  .brand {
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
  }
  h1 {
    font-size: 34px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .tag {
    font-variant-numeric: tabular-nums;
    font-size: 12px;
    color: var(--ink-soft);
    border: 1px solid var(--line-strong);
    border-radius: 20px;
    padding: 3px 10px;
  }
  .sub {
    color: var(--ink-soft);
    font-size: 15px;
    margin-top: 6px;
    max-width: 60ch;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 760px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
  .foot {
    font-size: 12px;
    color: var(--ink-soft);
    margin-top: 28px;
    text-align: center;
    line-height: 1.7;
  }
</style>
