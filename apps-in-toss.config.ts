import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'mineral-vault',
  brand: {
    primaryColor: '#3182F5', // 시안 기준 브랜드 컬러
  },
  permissions: [],
  webBundleDir: 'dist',
});
