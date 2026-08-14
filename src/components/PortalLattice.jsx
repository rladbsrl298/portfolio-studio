import { useEffect, useRef } from 'react'

/**
 * 흩어진 점이 격자를 찾아 정렬되는 장면.
 *
 * 세 프로젝트(위험군 배정 / 면접 배정 / 지식 검증)를 관통하는 은유다 —
 * 배정이란 결국 무질서한 것들에 자리를 찾아주는 일이다.
 *
 * 비트맵은 프레임이 아니라 뷰포트 크기로 잡는다. 프레임이 14vw에서 100vw로
 * 열리는 동안 그림이 늘어나는 게 아니라 고정된 장면이 드러난다 — 왜곡이 없고,
 * 스크롤 중 리사이즈로 격자를 다시 만들지도 않는다.
 */

const CYCLE = 11000 // 한 바퀴 (ms)
const CONVERGE_AT = 0.16 // 수렴 시작
const CONVERGE_FOR = 0.3 // 수렴에 쓰는 구간
const HOLD_UNTIL = 0.74 // 정렬 유지 끝
const RELEASE_FOR = 0.2 // 흩어지는 구간

const CYAN = [77, 163, 255]
const HOT = [255, 122, 69]

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const easeOut = (v) => 1 - (1 - v) ** 3

/** 점 하나를 그릴 때마다 그라디언트를 만들면 비싸다. 스프라이트를 한 번 굽는다. */
function glowSprite(rgb, size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const half = size / 2
  const grad = g.createRadialGradient(half, half, 0, half, half, half)
  grad.addColorStop(0, `rgba(${rgb},1)`)
  grad.addColorStop(0.18, `rgba(${rgb},0.85)`)
  grad.addColorStop(0.45, `rgba(${rgb},0.22)`)
  grad.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

export default function PortalLattice({ reduced }) {
  const canvas = useRef(null)

  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const ctx = cv.getContext('2d', { alpha: false })

    const sprites = { cyan: glowSprite(CYAN.join(','), 64), hot: glowSprite(HOT.join(','), 64) }

    let w = 0
    let h = 0
    let dpr = 1
    let cell = 0
    let nodes = []
    let cols = 0
    let raf = 0
    let started = 0
    let last = 0
    let onScreen = true

    function build() {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = cv.clientWidth
      h = cv.clientHeight
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)

      // 격자 간격을 화면에 비례시키되 상·하한을 둔다. 큰 모니터에서 점이
      // 흩뿌려져 성겨 보이던 문제를 여기서 잡는다.
      cell = Math.max(88, Math.min(150, Math.min(w, h) / 10))
      cols = Math.ceil(w / cell) + 1
      const rows = Math.ceil(h / cell) + 1
      // 격자를 화면 가운데에 맞춰 남는 여백을 양쪽으로 나눈다.
      const ox = (w - (cols - 1) * cell) / 2
      const oy = (h - (rows - 1) * cell) / 2

      nodes = []
      for (let j = 0; j < rows; j += 1) {
        for (let i = 0; i < cols; i += 1) {
          const ang = Math.random() * Math.PI * 2
          const speed = 14 + Math.random() * 26
          nodes.push({
            lx: ox + i * cell,
            ly: oy + j * cell,
            cx: Math.random() * w,
            cy: Math.random() * h,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            delay: Math.random() * 0.12,
            accent: Math.random() < 0.07,
            e: 0,
            x: 0,
            y: 0,
          })
        }
      }
    }

    function ground() {
      const g = ctx.createLinearGradient(0, 0, w * 0.4, h)
      g.addColorStop(0, '#0b1826')
      g.addColorStop(1, '#04080e')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }

    /** 배경의 제도 격자 — 점들이 찾아갈 자리를 미리 흐리게 깔아둔다. */
    function draftingGrid() {
      ctx.strokeStyle = 'rgba(120,170,220,0.05)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = (w % cell) / 2; x < w; x += cell) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
      }
      for (let y = (h % cell) / 2; y < h; y += cell) {
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
      }
      ctx.stroke()
    }

    function frame(p, dt) {
      // 한 바퀴가 끝나면 배율이 1로 매끄럽게 돌아온다 — 이음매가 보이지 않는다.
      const scale = 1 + 0.045 * (0.5 - 0.5 * Math.cos(p * Math.PI * 2))

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ground()
      ctx.translate(w / 2, h / 2)
      ctx.scale(scale, scale)
      ctx.translate(-w / 2, -h / 2)
      draftingGrid()

      for (const n of nodes) {
        const rise = clamp01((p - CONVERGE_AT - n.delay) / CONVERGE_FOR)
        const fall = p < HOLD_UNTIL ? 1 : clamp01(1 - (p - HOLD_UNTIL) / RELEASE_FOR)
        n.r = rise * fall // 선을 잇는 판단에는 가속 안 먹인 진행도를 쓴다
        n.e = easeOut(n.r)

        if (n.e < 0.999) {
          n.cx += n.vx * dt
          n.cy += n.vy * dt
          if (n.cx < 0 || n.cx > w) n.vx *= -1
          if (n.cy < 0 || n.cy > h) n.vy *= -1
        }
        n.x = n.cx + (n.lx - n.cx) * n.e
        n.y = n.cy + (n.ly - n.cy) * n.e
      }

      // 거의 자리를 잡은 이웃끼리만 선을 잇는다. 일찍 이으면 멀리 있는 점들
      // 사이에 긴 대각선이 그어져 흔한 네트워크 그래프처럼 보인다.
      const LINK_AT = 0.72
      ctx.lineWidth = Math.max(1, cell / 110)
      for (let k = 0; k < nodes.length; k += 1) {
        const a = nodes[k]
        if (a.r < LINK_AT) continue
        for (const b of [nodes[k + 1] && (k + 1) % cols !== 0 ? nodes[k + 1] : null, nodes[k + cols]]) {
          if (!b || b.r < LINK_AT) continue
          const strength = clamp01((Math.min(a.r, b.r) - LINK_AT) / (1 - LINK_AT))
          ctx.strokeStyle = `rgba(150,205,255,${strength * 0.6})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // 흩어져 있는 동안에는 짧은 선 조각으로 흐른다.
      ctx.lineCap = 'round'
      for (const n of nodes) {
        const loose = 1 - n.e
        if (loose < 0.08) continue
        ctx.strokeStyle = `rgba(160,210,255,${loose * 0.45})`
        ctx.lineWidth = Math.max(1.2, cell / 90)
        ctx.beginPath()
        ctx.moveTo(n.x - n.vx * 1.6 * loose, n.y - n.vy * 1.6 * loose)
        ctx.lineTo(n.x, n.y)
        ctx.stroke()
      }

      for (const n of nodes) {
        // 주황은 자리를 찾은 뒤에야 켜진다 — 가속 먹인 e로 재면 아직 흩어져
        // 있는 동안 켜져버린다.
        const ignite = n.accent ? clamp01((n.r - 0.82) / 0.18) : 0
        const r = cell * (n.accent ? 0.115 : 0.085) * (0.75 + n.e * 0.45)
        ctx.globalAlpha = 0.55 + n.e * 0.45
        ctx.drawImage(sprites.cyan, n.x - r, n.y - r, r * 2, r * 2)
        if (ignite > 0) {
          ctx.globalAlpha = ignite
          ctx.drawImage(sprites.hot, n.x - r * 1.5, n.y - r * 1.5, r * 3, r * 3)
        }
      }
      ctx.globalAlpha = 1
    }

    function tick(now) {
      if (!started) started = now
      const dt = Math.min(0.05, (now - (last || now)) / 1000)
      last = now
      frame(((now - started) % CYCLE) / CYCLE, dt)
      raf = requestAnimationFrame(tick)
    }

    function start() {
      if (raf || reduced) return
      last = 0
      raf = requestAnimationFrame(tick)
    }
    function stop() {
      cancelAnimationFrame(raf)
      raf = 0
    }

    build()
    // 첫 rAF 전에 한 장 그려둔다. 캔버스가 잠깐 비는 것을 막고, rAF가 멈추는
    // 백그라운드 탭에서도 장면이 남는다. reduced면 이 장면에서 멈춘다.
    frame(0.62, 0)
    if (!reduced) start()

    const ro = new ResizeObserver(() => {
      build()
      if (reduced) frame(0.62, 0)
    })
    ro.observe(cv)

    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting
        if (onScreen) start()
        else stop()
      },
      { threshold: 0 },
    )
    io.observe(cv)

    const onVisibility = () => (document.hidden || !onScreen ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  return <canvas className="portal__canvas" ref={canvas} aria-hidden="true" />
}
