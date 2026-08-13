import { useEffect, useRef, useState } from 'react'

/** 흰 외곽선 원. 링크·버튼 위에서 커진다. 터치 기기에서는 CSS로 숨긴다. */
export default function Cursor() {
  const ref = useRef(null)
  const [big, setBig] = useState(false)

  useEffect(() => {
    if (matchMedia('(pointer: coarse)').matches) return

    const move = (e) => {
      const el = ref.current
      if (!el) return
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
      // 매 이동마다 대상을 확인한다 — 동적으로 붙는 요소까지 커버된다.
      setBig(!!e.target.closest?.('a, button, [data-cursor="big"]'))
    }

    addEventListener('pointermove', move, { passive: true })
    return () => removeEventListener('pointermove', move)
  }, [])

  return <div className="cursor" ref={ref} data-big={big} aria-hidden="true" />
}
