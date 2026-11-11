import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: ['steps/*.js'],
});

export default defineConfig({
  testDir,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
  // Tự động khởi động Go server trước khi chạy test nếu chạy local và server chưa bật
  webServer: process.env.CI ? undefined : {
    command: 'cd ../.. && go run ./src',
    url: `${baseURL}/health`,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
