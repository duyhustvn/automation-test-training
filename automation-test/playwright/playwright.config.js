import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
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
