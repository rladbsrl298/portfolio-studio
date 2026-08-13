import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

function Magnetic({ children, href }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const el = ref.current
    const r = el.getBoundingClientRect()
    gsap.to(el, {
      x: (e.clientX - r.left - r.width / 2) * 0.28,
      y: (e.clientY - r.top - r.height / 2) * 0.4,
      duration: 0.4,
      ease: 'power3.out',
    })
  }
  const onLeave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, .4)' })

  return (
    <a className="mag" href={href} ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

export default function Projects({ ready, reduced }) {
  const root = useRef(null)

  useLayoutEffect(() => {
    if (!ready || reduced) return
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray('.panel')

      // 뒤 패널이 덮어오면 앞 패널을 축소·감광한다.
      panels.forEach((panel, i) => {
        if (i === panels.length - 1) return
        gsap.to(panel, {
          scale: 0.92,
          y: -28,
          filter: 'brightness(.45)',
          ease: 'none',
          scrollTrigger: {
            trigger: panels[i + 1],
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        })
      })

      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      })
    }, root)

    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [ready, reduced])

  return (
    <div ref={root}>
      {projects.map((p) => (
        <section className={`panel${p.hot ? ' panel--hot' : ''}`} key={p.id} aria-label={p.title.join(' ')}>
          <div className="panel__inner">
            <p className="label">
              {p.no} / 0{projects.length} — {p.eyebrow}
            </p>
            <h2>
              {p.title[0]}
              <br />
              {p.title[1]}
            </h2>

            <dl className="spec">
              {p.spec.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>

            {p.body.map((html, i) => (
              <p className="prose reveal" key={i} dangerouslySetInnerHTML={{ __html: html }} />
            ))}

            <p className="caveat" dangerouslySetInnerHTML={{ __html: p.caveat }} />

            {p.link && <Magnetic href={p.link.href}>{p.link.text}</Magnetic>}
          </div>
        </section>
      ))}
    </div>
  )
}
