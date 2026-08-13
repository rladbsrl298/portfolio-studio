# portfolio-studio

김윤기 포트폴리오 — 시네마틱 버전 (야간 청사진).

명세서 버전: https://rladbsrl298.github.io/portfolio/

## 구성

- React 19 + Vite + GSAP ScrollTrigger
- 스크롤 구동: 포털 확장, 패널 스태킹, 리빌
- `prefers-reduced-motion` 존중 — 켜져 있으면 모든 스크롤 연출을 끄고 내용을 그대로 보여준다

## 문구 수정

모든 텍스트는 `src/data/content.js` 한 곳에 있다.
근거는 `../portfolio-notes/`(facts.md, interview/)에 있으며, 근거 없는 문장을 추가하지 않는다.

## 포털 영상 교체

1. 영상 파일을 `public/media/portal.mp4` 로 넣는다
2. `src/data/content.js` 의 `portal.video` 를 `'/portfolio-studio/media/portal.mp4'` 로 바꾼다

값이 `null` 이면 CSS 자리표시자가 대신 표시된다.

## 개발

```bash
npm install
npm run dev
npm run build
```

`main` 에 push 하면 GitHub Actions가 빌드해서 Pages로 배포한다.
