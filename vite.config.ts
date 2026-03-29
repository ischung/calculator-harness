import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 배포 시 base 경로 설정
// https://ischung.github.io/calculator-harness/ 에 맞춰야 자산 경로가 올바르게 작동한다
const base = process.env.GITHUB_PAGES === 'true' ? '/calculator-harness/' : '/';

export default defineConfig({
  plugins: [react()],
  root: '.',
  base,
  build: {
    outDir: 'dist',
  },
});
