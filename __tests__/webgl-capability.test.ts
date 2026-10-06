import { describe, expect, it } from "vitest"

import {
  CANVAS_RENDER_SETTINGS,
  isMobileWidth,
  shouldRenderScene,
} from "../lib/webgl-capability"

describe("shouldRenderScene", () => {
  it("renders when everything is healthy", () => {
    expect(shouldRenderScene({ webglSupported: true, contextLost: false, reducedMotion: false })).toBe(true)
  })

  it("does not render without WebGL", () => {
    expect(shouldRenderScene({ webglSupported: false, contextLost: false, reducedMotion: false })).toBe(false)
  })

  it("stops rendering after the GPU context is lost", () => {
    // The crash case: a lost context throws no React error, so this is the only
    // recovery path.
    expect(shouldRenderScene({ webglSupported: true, contextLost: true, reducedMotion: false })).toBe(false)
  })

  it("honours prefers-reduced-motion", () => {
    expect(shouldRenderScene({ webglSupported: true, contextLost: false, reducedMotion: true })).toBe(false)
  })
})

describe("render budget", () => {
  it("caps device pixel ratio at 1.5", () => {
    // r3f defaults to [1, 2]; on a 3x phone that is a 786x1704 buffer.
    const [min, max] = CANVAS_RENDER_SETTINGS.dpr
    expect(min).toBe(1)
    expect(max).toBeLessThanOrEqual(1.5)
  })

  it("disables MSAA and shadows", () => {
    expect(CANVAS_RENDER_SETTINGS.antialias).toBe(false)
    expect(CANVAS_RENDER_SETTINGS.shadows).toBe(false)
  })
})

describe("isMobileWidth", () => {
  it("treats phone and small tablet widths as mobile", () => {
    expect(isMobileWidth(390)).toBe(true)
    expect(isMobileWidth(767)).toBe(true)
  })

  it("treats desktop widths as desktop", () => {
    expect(isMobileWidth(768)).toBe(false)
    expect(isMobileWidth(1440)).toBe(false)
  })
})
