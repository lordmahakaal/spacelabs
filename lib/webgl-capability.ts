/**
 * WebGL capability detection and the render budget the 3D scene is allowed to
 * spend.
 *
 * The scene is decorative: it sits behind the marketing content. If WebGL is
 * missing, the context is lost (the browser killed the GPU process), or the
 * visitor asked for reduced motion, we must degrade to a static background
 * rather than leave a dead page. A lost context is not a React error, so the
 * ErrorBoundary inside <Canvas> cannot catch it -- these checks are the only
 * recovery path.
 */

export const MOBILE_BREAKPOINT = 768

/**
 * Render budget.
 *
 * - `dpr` is capped at 1.5. r3f's default is [1, 2], which on a 3x phone means a
 *   786x1704 drawing buffer for the hero section.
 * - `antialias: false` because the composer renders through its own fullscreen
 *   quad, so the default framebuffer's MSAA buffer is allocated and never used
 *   (~21 MB on that same buffer).
 * - `shadows: false`: nothing in the scene casts a shadow, so enabling them only
 *   costs extra render targets and shader variants.
 */
export const CANVAS_RENDER_SETTINGS = {
  dpr: [1, 1.5] as [number, number],
  antialias: false,
  alpha: false,
  powerPreference: "high-performance" as const,
  shadows: false,
}

export const CUBE_COUNT = 100
export const STARS_COUNT_DESKTOP = 5000
export const STARS_COUNT_MOBILE = 1200

export function isMobileWidth(width: number): boolean {
  return width < MOBILE_BREAKPOINT
}

/**
 * Feature detection. Returns false during SSR and whenever a WebGL context
 * cannot actually be created (blocklisted drivers, no GPU process, disabled
 * hardware acceleration).
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false

  try {
    const canvas = document.createElement("canvas")
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl")

    if (!gl) return false

    // Release the probe context immediately; on mobile these are a scarce
    // resource and browsers cap how many can be alive at once.
    const lose = (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")
    lose?.loseContext()

    return true
  } catch {
    return false
  }
}

export interface SceneFallbackReason {
  webglSupported: boolean
  contextLost: boolean
  reducedMotion: boolean
}

/**
 * Single source of truth for "should the 3D scene be running at all".
 * Pure so it can be regression tested without a browser.
 */
export function shouldRenderScene({
  webglSupported,
  contextLost,
  reducedMotion,
}: SceneFallbackReason): boolean {
  return webglSupported && !contextLost && !reducedMotion
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export const SCENE_FALLBACK_COPY = {
  unsupported: "3D scene unavailable on this device",
  contextLost: "3D scene paused to keep the page responsive",
  reducedMotion: "3D scene disabled by your reduced motion preference",
  loading: "Loading 3D scene...",
} as const
