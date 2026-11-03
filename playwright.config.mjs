import { defineConfig, devices } from '@playwright/test';
import { PORTA_API, PORTA_JOGO, URL_API, URL_JOGO } from './tests/e2e/dados.mjs';

/*
 * Testes de ponta a ponta contra a Zooly API REAL rodando localmente
 * (tests/e2e/servidor/api-local.mjs) com MongoDB em memória.
 * Os cenários compartilham o mesmo banco e rodam em série.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.mjs',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
  use: {
    baseURL: URL_JOGO,
    ...devices['Desktop Chrome'],
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: [
    {
      command: 'node tests/e2e/servidor/api-local.mjs',
      url: `${URL_API}/api/health`,
      env: { E2E_PORTA_API: String(PORTA_API), E2E_ORIGEM_JOGO: URL_JOGO },
      // Sempre um banco novo: um servidor já aberto teria dados de outra execução.
      reuseExistingServer: false,
      timeout: 180_000,
      stdout: 'pipe'
    },
    {
      command: `npx next dev -p ${PORTA_JOGO}`,
      url: `${URL_JOGO}/login`,
      env: { NEXT_PUBLIC_API_URL: URL_API },
      reuseExistingServer: false,
      timeout: 180_000
    }
  ]
});
