import { useMemo, useState } from 'react'
import './App.css'
import heart from './assets/heart.svg'
import loveSymbol from './assets/love-symbol.svg'
import pearl from './assets/pearl.svg'
import pinkFlower from './assets/pink-flower.svg'
import sparkle from './assets/sparkle.svg'
import tinyFlower from './assets/tiny-flower.svg'
import whiteDaisy from './assets/white-daisy.svg'
import envelopeClosed from './assets/envlop-closed.png'
import envelopeOpen from './assets/envlop-open.png'
import sorryImg from './assets/sorry.png'
import kissImg from './assets/kiss.png'
import moreKissImg from './assets/more-kiss.png'
import letterImg from './assets/letter.png'
import readingImg from './assets/reading.png'
import hugImg from './assets/hug.png'

const decorSprites = [pearl, pinkFlower, sparkle, tinyFlower, whiteDaisy]

// Heart parametric curve (classic). t in [0, 2π].
//   x = 16 sin^3(t)
//   y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3)
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t)
  return { x, y }
}

// Is (x, y) inside the heart? Test by ray-ish scaling: sample the boundary at
// the same angle and compare radius. Simpler: use the implicit heart inequality.
// (x^2 + y^2 - 1)^3 - x^2 y^3 <= 0  for a unit-ish heart.
function insideHeart(nx, ny) {
  const a = nx * nx + ny * ny - 1
  return a * a * a - nx * nx * ny * ny * ny <= 0
}

// Build a FILLED heart of particles: a dense outline plus scattered fill,
// each with depth (z) that drives size/opacity for a layered, 3D feel.
function buildParticles(outlineCount, fillCount) {
  const particles = []
  const scale = 2.2 // vmin per heart-unit

  // 1) Outline: evenly spaced along the curve for a crisp heart edge
  for (let i = 0; i < outlineCount; i++) {
    const t = (i / outlineCount) * Math.PI * 2
    const { x, y } = heartPoint(t)
    particles.push(makeParticle(i, x, y, scale, true))
  }

  // 2) Fill: rejection-sample points inside the implicit heart
  let placed = 0
  let guard = 0
  while (placed < fillCount && guard < fillCount * 40) {
    guard++
    // implicit heart uses roughly [-1.3, 1.3] range
    const nx = (Math.random() * 2 - 1) * 1.3
    const ny = (Math.random() * 2 - 1) * 1.4 + 0.15
    if (!insideHeart(nx, ny)) continue
    // map the unit heart to the same scale as the curve (~16 wide)
    const x = nx * 15
    const y = ny * 15 - 2 // small vertical align to the curve
    particles.push(makeParticle(outlineCount + placed, x, y, scale, false))
    placed++
  }

  // sort back-to-front so nearer (bigger) particles render on top
  particles.sort((a, b) => a.z - b.z)
  return particles
}

function makeParticle(id, hx, hy, scale, isOutline) {
  const depth = Math.random() // 0 = far, 1 = near
  const restX = +(hx * scale).toFixed(2)
  const restY = +(-hy * scale).toFixed(2) // screen y grows downward
  // blast partway out first (quick pop before the slow drift) — a touch wider
  const blastMul = 0.55 + Math.random() * 0.35
  return {
    id,
    sprite: decorSprites[id % decorSprites.length],
    restX,
    restY,
    // spread the heart wider so the burst fills more of the screen
    spreadX: +(restX * 1.25).toFixed(2),
    spreadY: +(restY * 1.25).toFixed(2),
    blastX: +(restX * blastMul).toFixed(2),
    blastY: +(restY * blastMul).toFixed(2),
    z: Math.round(-120 + depth * 240),
    // near particles are bigger + more opaque; outline slightly larger
    size: Math.round((isOutline ? 20 : 14) + depth * 22),
    opacity: +(0.55 + depth * 0.45).toFixed(2),
    rot: Math.round((Math.random() - 0.5) * 300),
    // spread the arrival so the heart assembles gracefully
    delay: +(Math.random() * 0.5).toFixed(2),
    // where the particle drifts to as it falls: down past the bottom, with a
    // gentle sideways sway and a slow tumble
    fallX: +(restX * 1.25 + (Math.random() - 0.5) * 30).toFixed(2),
    fallY: +(90 + Math.random() * 30).toFixed(2), // vh: past the bottom edge
    fallRot: Math.round(var_rand()),
    // each flower falls at its own slow pace and starts at its own moment
    fallDur: +(4.5 + Math.random() * 3.5).toFixed(2),
    fallDelay: +(Math.random() * 1.6).toFixed(2),
  }
}

// small helper: a gentle random rotation for the tumble as flowers fall
function var_rand() {
  return (Math.random() - 0.5) * 220
}

function App() {
  const [open, setOpen] = useState(false)
  const [screen, setScreen] = useState('envelope') // 'envelope' | 'sorry' | 'kiss' | 'more-kiss' | 'reading' | 'hug'
  const particles = useMemo(() => buildParticles(70, 90), [])

  // Final screen: a warm hug
  if (screen === 'hug') {
    return (
      <div className="app">
        <div className="screen kiss-screen">
          <img src={hugImg} alt="A warm hug" className="kiss-img" />
          <p className="choice-result">Thank you for accepting my apologies</p>
        </div>
      </div>
    )
  }

  // Accepted screen: the girl reads the big, readable letter
  if (screen === 'reading') {
    return (
      <div className="app">
        <div className="screen reading-screen">
          <div className="reading-letter-wrap">
            <img src={letterImg} alt="A love letter" className="reading-letter" />
          </div>

          <img
            src={readingImg}
            alt="A girl reading the letter"
            className="reading-girl"
          />

          <button
            type="button"
            className="next-btn reading-next"
            onClick={() => setScreen('hug')}
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  // Screen 4: the "more kiss" page (shown when the user taps "One More Sorry")
  if (screen === 'more-kiss') {
    return (
      <div className="app">
        <div className="screen kiss-screen">
          <img src={moreKissImg} alt="Even more love" className="kiss-img" />

          <div className="choice-row">
            <button
              type="button"
              className="choice-btn accept"
              onClick={() => setScreen('reading')}
            >
              Accepted
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Screen 3: the kiss page (shown when the user taps "Rejected")
  if (screen === 'kiss') {
    return (
      <div className="app">
        <div className="screen kiss-screen">
          <img src={kissImg} alt="A loving kiss" className="kiss-img" />

          <div className="choice-row">
            <button
              type="button"
              className="choice-btn accept"
              onClick={() => setScreen('reading')}
            >
              Accept Apologies
            </button>
            <button
              type="button"
              className="choice-btn reject"
              onClick={() => setScreen('more-kiss')}
            >
              One More Sorry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Screen 2: the sorry page (shown after the user taps "Next")
  if (screen === 'sorry') {
    return (
      <div className="app">
        <div className="screen sorry-screen">
          <img src={sorryImg} alt="A sweet sorry" className="sorry-img" />

          <div className="choice-row">
            <button
              type="button"
              className="choice-btn accept"
              onClick={() => setScreen('reading')}
            >
              Accepted
            </button>
            <button
              type="button"
              className="choice-btn reject"
              onClick={() => setScreen('kiss')}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Screen 1: envelope + heart burst
  return (
    <div className="app envelope-screen">
      <header className="hero">
        <span className="badge">
          <img src={heart} alt="" className="badge-heart" />
          MADE WITH SO MUCH LOVE
        </span>

        <h1 className="hero-title">
          <span className="sparkle">✦</span>
          Hello Cutieee
          <span className="sparkle">✦</span>
        </h1>

        <p className="hero-subtitle">
          happy birthday
          <img src={loveSymbol} alt="love" className="subtitle-heart" />
        </p>

        <div className="divider">
          <span className="divider-line" />
          <img src={loveSymbol} alt="" className="divider-heart" />
          <span className="divider-line" />
        </div>
      </header>

      {/* Full-screen burst: flowers blast then settle into a glowing heart */}
      <div className={`burst ${open ? 'is-open' : ''}`} aria-hidden="true">
        <span className="heart-glow" />
        {particles.map((p) => (
          <span
            key={p.id}
            className="particle"
            style={{
              '--blast-x': `${p.blastX}vmin`,
              '--blast-y': `${p.blastY}vmin`,
              '--rest-x': `${p.restX}vmin`,
              '--rest-y': `${p.restY}vmin`,
              '--spread-x': `${p.spreadX}vmin`,
              '--spread-y': `${p.spreadY}vmin`,
              '--rot': `${p.rot}deg`,
              '--size': `${p.size}px`,
              '--opacity': p.opacity,
              '--delay': `${p.delay}s`,
              '--z': `${p.z}px`,
              '--fall-x': `${p.fallX}vmin`,
              '--fall-y': `${p.fallY}vh`,
              '--fall-rot': `${p.fallRot}deg`,
              '--fall-dur': `${p.fallDur}s`,
              '--fall-delay': `${p.fallDelay}s`,
            }}
          >
            <img
              src={p.sprite}
              alt=""
              className="particle-img"
              draggable="false"
            />
          </span>
        ))}
      </div>

      <main className="stage">
        <button
          type="button"
          className={`envelope ${open ? 'is-open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close the letter' : 'Open the letter'}
        >
          {/* Envelope images: closed cross-fades to open (open PNG has the letter) */}
          <img
            src={envelopeClosed}
            alt="Closed envelope"
            className="env-img env-closed"
            draggable="false"
          />
          <img
            src={envelopeOpen}
            alt="Open envelope with a letter"
            className="env-img env-open"
            draggable="false"
          />
        </button>

        <p className="hint">{open ? 'tap to close' : 'tap the envelope to open'}</p>

        {/* Appears once the envelope is open; moves to the sorry screen */}
        {open && (
          <button
            type="button"
            className="next-btn"
            onClick={() => setScreen('sorry')}
          >
            Next
          </button>
        )}
      </main>
    </div>
  )
}

export default App
