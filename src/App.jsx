import { useCallback, useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './hooks/useReducedMotion'
import Loader from './components/Loader'
import Cursor from './components/Cursor'
import Hero from './components/Hero'
import Portal from './components/Portal'
import Projects from './components/Projects'
import Method from './components/Method'
import Background from './components/Background'
import Contact from './components/Contact'

export default function App() {
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  const onDone = useCallback(() => setReady(true), [])

  // ScrollTrigger는 생성 시점의 레이아웃을 기준으로 스크롤 구간을 계산한다.
  // 로더 전환·웹폰트 로드가 끝나면 문서 높이가 달라지므로 그때마다 다시 재운다.
  useEffect(() => {
    if (!ready) return
    const refresh = () => ScrollTrigger.refresh()
    const t = setTimeout(refresh, 1200)
    document.fonts?.ready.then(refresh).catch(() => {})
    addEventListener('load', refresh)
    return () => {
      clearTimeout(t)
      removeEventListener('load', refresh)
    }
  }, [ready])

  return (
    <>
      <Loader reduced={reduced} onDone={onDone} />
      <Cursor />
      <Hero ready={ready} reduced={reduced} />
      <Portal ready={ready} reduced={reduced} />
      <Projects ready={ready} reduced={reduced} />
      <Method />
      <Background />
      <Contact />
    </>
  )
}
