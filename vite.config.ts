/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// base мусить збігатися з ім'ям репозиторію для GitHub project pages:
// сайт публікується на https://mrvayzard.github.io/WaterPipe/
export default defineConfig({
  base: '/WaterPipe/',
  plugins: [svelte()],
  test: {
    // Рушій — чистий TS, тестуємо у node-середовищі (без DOM).
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
});
