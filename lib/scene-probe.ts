/**
 * Opt-in instrumentation for the 3D scene.
 *
 * `scripts/verify-webgl-budget.mjs` sets `window.__spacelabsProbe` before the
 * page loads and then asserts on these counters to prove the postprocessing
 * stack does not allocate per resize. The counters are a no-op unless the flag
 * is set, so production visitors pay nothing.
 */

export interface SceneProbe {
  pipelines: number
  composers: number
  composerDisposals: number
  passDisposals: number
  resizeCalls: number
  renderCalls: number
  contextLost: number
}

const FLAG = "__spacelabsProbe"

type ProbeWindow = Window & {
  __spacelabsProbe?: boolean
  __spacelabsProbeCounts?: SceneProbe
}

function emptyProbe(): SceneProbe {
  return {
    pipelines: 0,
    composers: 0,
    composerDisposals: 0,
    passDisposals: 0,
    resizeCalls: 0,
    renderCalls: 0,
    contextLost: 0,
  }
}

/** Returns the active probe, or null when instrumentation is off. */
export function activeProbe(): SceneProbe | null {
  if (typeof window === "undefined") return null
  const target = window as ProbeWindow
  if (!target.__spacelabsProbe) return null
  target.__spacelabsProbeCounts ??= emptyProbe()
  return target.__spacelabsProbeCounts
}

export function countProbe(key: keyof SceneProbe, amount = 1): void {
  const probe = activeProbe()
  if (probe) probe[key] += amount
}
