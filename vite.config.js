import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 프로젝트 사이트로 배포한다 → 저장소 이름이 base가 된다.
export default defineConfig({
  base: '/portfolio-studio/',
  plugins: [react()],
})
