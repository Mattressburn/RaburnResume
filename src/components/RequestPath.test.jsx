import { render } from '@testing-library/react'
import RequestPath, { routeOf } from './RequestPath'
import { site } from '../data/site'

beforeEach(() => { window.matchMedia = (q) => ({ matches: q.includes('min-width'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false }) })

test('renders every node label and one pulse path per edge', () => {
  const { container, getByText } = render(<RequestPath size="card" animate />)
  for (const n of site.diagram.nodes) expect(getByText(n.label)).toBeInTheDocument()
  expect(container.querySelectorAll('path.pulse').length).toBe(site.diagram.edges.length)
})

test('each pulse period is its own route length plus the dash, so no edge shows two dashes', () => {
  const { container } = render(<RequestPath size="card" animate />)
  const pulses = [...container.querySelectorAll('path.pulse')]
  site.diagram.edges.forEach((e, i) => {
    const pts = routeOf(e, site.diagram.layouts.desktop)
    const len = pts.slice(1).reduce((s, b, j) => s + Math.hypot(b[0] - pts[j][0], b[1] - pts[j][1]), 0)
    expect(Number(pulses[i].style.getPropertyValue('--flow-len'))).toBeCloseTo(len + 6)
  })
})

test('nodes with a why are keyboard focusable', () => {
  const { container } = render(<RequestPath size="full" animate={false} />)
  const withWhy = site.diagram.nodes.filter(n => n.why).length
  expect(container.querySelectorAll('g[role="button"][tabindex="0"]').length).toBe(withWhy)
})

// Geometry guard: JetBrains Mono advances 0.6 em, so 6.6 px per character at 11 px and 5.7 at 9.5 px.
test('labels fit their boxes and the viewBox, and no route crosses a box or label it does not connect', () => {
  for (const [name, L] of Object.entries(site.diagram.layouts)) {
    const [W, H] = L.viewBox
    const rects = site.diagram.nodes.map((n) => {
      const p = L.pos[n.id]
      return { id: n.id, ...p, w: n.kind === 'label' ? n.label.length * 5.7 : p.w }
    })
    for (const n of site.diagram.nodes) {
      const p = L.pos[n.id]
      expect(p.y + p.h, `${name} ${n.id} bottom`).toBeLessThanOrEqual(H)
      if (n.kind === 'label') {
        expect(p.x + n.label.length * 5.7, `${name} ${n.id} right`).toBeLessThanOrEqual(W)
      } else {
        expect(p.x + p.w, `${name} ${n.id} right`).toBeLessThanOrEqual(W)
        expect(n.label.length * 6.6 + 8, `${name} ${n.id} label`).toBeLessThanOrEqual(p.w)
        expect((n.sub ?? '').length * 5.7 + 8, `${name} ${n.id} sub`).toBeLessThanOrEqual(p.w)
      }
    }
    for (const e of site.diagram.edges) {
      const pts = routeOf(e, L)
      for (let i = 1; i < pts.length; i++) {
        const [x0, x1] = [Math.min(pts[i - 1][0], pts[i][0]), Math.max(pts[i - 1][0], pts[i][0])]
        const [y0, y1] = [Math.min(pts[i - 1][1], pts[i][1]), Math.max(pts[i - 1][1], pts[i][1])]
        for (const r of rects) {
          if (r.id === e.from || r.id === e.to) continue
          const hit = x0 < r.x + r.w && x1 > r.x && y0 < r.y + r.h && y1 > r.y
          expect(hit, `${name} ${e.from}>${e.to} crosses ${r.id}`).toBe(false)
        }
      }
    }
  }
})
