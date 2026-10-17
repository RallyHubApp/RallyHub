import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./e2e',testMatch:/tournival-host-full\.spec\.mjs/,
 timeout:45000,expect:{timeout:6000},workers:1,reporter:[['line']],
 use:{baseURL:'http://127.0.0.1:5185',headless:true,trace:'retain-on-failure',screenshot:'only-on-failure'},
 webServer:{command:'npm run dev -- --host 127.0.0.1 --port 5185 --strictPort --force',
  url:'http://127.0.0.1:5185/e2e/tournivalHostHarness.html',reuseExistingServer:false,timeout:120000}
});
