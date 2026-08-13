import { useEffect, useState } from 'react'
import { profile } from '../data/content'

/** 검은 화면 → clip-path로 위로 걷힌다. 걷히는 동안 body 스크롤을 잠근다. */
export default function Loader({ reduced, onDone }) {
  const [fill, setFill] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    document.body.classList.add('is-loading')
    const t0 = setTimeout(() => setFill(true), 60)
    const t1 = setTimeout(
      () => {
        setDone(true)
        document.body.classList.remove('is-loading')
        onDone?.()
      },
      reduced ? 120 : 1250,
    )
    // 어떤 경로로 벗어나든 스크롤 잠금은 반드시 푼다.
    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      document.body.classList.remove('is-loading')
    }
  }, [reduced, onDone])

  return (
    <div className="loader" data-done={done} aria-hidden="true">
      <div>
        <p className="loader__mark">{profile.name}</p>
        <div className="loader__bar" data-fill={fill}>
          <i />
        </div>
        <p className="label" style={{ marginTop: '.9rem' }}>
          Portfolio / 2026
        </p>
      </div>
    </div>
  )
}
