import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { portal } from '../data/content'
import PortalLattice from './PortalLattice'

gsap.registerPlugin(ScrollTrigger)

/**
 * 작은 프레임이 화면 전체로 벌어지는 구간.
 * portal.video 가 채워지면 <video>가 자리표시자를 덮는다 — 그 외 코드는 그대로다.
 */
export default function Portal({ ready, reduced }) {
  const root = useRef(null)
  const video = useRef(null)

  // 로더가 body 스크롤을 잠근 동안에는 문서 높이가 clamp되어 ScrollTrigger가
  // 스크롤 구간을 0으로 계산한다. 잠금이 풀린 뒤(ready)에 만들고 한 번 refresh 한다.
  useLayoutEffect(() => {
    if (!ready || reduced) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      tl.to('.portal__corner--l', { xPercent: -115, ease: 'none' }, 0)
        .to('.portal__corner--r', { xPercent: 115, ease: 'none' }, 0)
        .to('.portal__dot--a', { x: '-30vw', y: '30vh', ease: 'none' }, 0)
        .to('.portal__dot--b', { x: '30vw', y: '-24vh', ease: 'none' }, 0)
        .to('.portal__frame', { width: '38vw', height: '27vw', ease: 'none' }, 0)
        .to('.portal__frame', { width: '100vw', height: '100vh', ease: 'power3.inOut' }, 0.45)
        .to('.portal__title', { opacity: 1 }, 0.62)
        .to('.portal__labels', { opacity: 1 }, 0.7)
    }, root)

    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [ready, reduced])

  // 화면 안에 있을 때만 재생한다.
  useLayoutEffect(() => {
    const el = video.current
    if (!el) return
    el.muted = true
    el.playsInline = true
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? el.play()?.catch?.(() => {}) : el.pause()),
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      el.pause()
    }
  }, [])

  return (
    <section className="portal" ref={root} aria-label="설계 우선 작업 방식">
      <div className="portal__stage">
        <span className="portal__corner portal__corner--l" aria-hidden="true">
          {portal.corners[0]}
        </span>
        <span className="portal__corner portal__corner--r" aria-hidden="true">
          {portal.corners[1]}
        </span>
        <span className="portal__dot portal__dot--a" aria-hidden="true" />
        <span className="portal__dot portal__dot--b" aria-hidden="true" />

        <div className="portal__frame" data-cursor="big">
          {portal.video ? (
            <video className="portal__media" ref={video} src={portal.video} loop muted playsInline preload="metadata" />
          ) : (
            <PortalLattice reduced={reduced} />
          )}
          <div className={`portal__scrim${portal.video ? ' portal__scrim--video' : ''}`} aria-hidden="true" />
        </div>

        <div className="portal__title">
          <b>
            {portal.title[0]}
            <em>{portal.title[1]}</em>
            {portal.title[2]}
          </b>
          <span>{portal.sub}</span>
        </div>

        <div className="portal__labels">
          {portal.labels.map((l) => (
            <span className="label" key={l}>
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
