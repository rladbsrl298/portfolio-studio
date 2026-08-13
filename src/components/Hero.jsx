import { useEffect, useRef } from 'react'
import { profile, projects } from '../data/content'

export default function Hero({ ready, reduced }) {
  const root = useRef(null)

  // 눈금자는 로드 직후 차오른다 — 숫자를 숨기지 않는다는 태도를 그대로 보여준다.
  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => {
      root.current?.querySelectorAll('.ruler__fill').forEach((el) => {
        el.style.width = el.dataset.w
      })
    }, reduced ? 0 : 400)
    return () => clearTimeout(t)
  }, [ready, reduced])

  return (
    <header className="hero" ref={root} data-ready={ready}>
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__rule" aria-hidden="true" />

      <div className="hero__top">
        <p className="label">Portfolio / 2026</p>
        <p className="label">Scroll ↓</p>
      </div>

      <div>
        <p className="label label--accent" style={{ marginBottom: '1.4rem' }}>
          {profile.role}
        </p>
        <h1>
          {profile.headline.map((line, i) => (
            <span className="line" key={line}>
              <i style={i === 1 ? { color: 'var(--cyan)' } : undefined}>{line}</i>
            </span>
          ))}
        </h1>
        <p className="hero__desc">{profile.desc}</p>
      </div>

      <div className="hero__sig">
        <div className="rulers">
          {projects.map((p) => (
            <div className="ruler" key={p.id}>
              <b>
                {p.title[0]} · {p.ratioLabel}
              </b>
              <div
                className="ruler__track"
                role="img"
                aria-label={`${p.title[0]} 기여 ${p.ratioLabel}, 약 ${p.ratio}퍼센트`}
              >
                <span className="ruler__fill" data-w={`${p.ratio}%`} />
              </div>
            </div>
          ))}
        </div>
        <p className="label">
          {profile.name} · {profile.latin}
        </p>
      </div>
    </header>
  )
}
