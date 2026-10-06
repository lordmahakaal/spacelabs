"use client"

import { useCallback, useEffect, useState } from "react"

import { countProbe } from "@/lib/scene-probe"
import {
  isWebGLAvailable,
  prefersReducedMotion,
  shouldRenderScene,
  type SceneFallbackReason,
} from "@/lib/webgl-capability"

export interface SceneHealth extends SceneFallbackReason {
  /** True only after the client has probed for WebGL, so SSR markup matches. */
  ready: boolean
  canRender: boolean
}

/**
 * Tracks whether the decorative 3D scene is safe to run, and reports a lost
 * WebGL context so the page can fall back to a static background.
 *
 * This is the recovery path the ErrorBoundary cannot provide: when a browser
 * kills the GPU process the page throws no React error, it just stops painting.
 */
export function useSceneHealth(): SceneHealth & { onContextLost: () => void } {
  const [ready, setReady] = useState(false)
  const [webglSupported, setWebglSupported] = useState(false)
  const [contextLost, setContextLost] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)")

    setWebglSupported(isWebGLAvailable())
    setReducedMotion(prefersReducedMotion())
    setReady(true)

    const onMotionChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    mql?.addEventListener("change", onMotionChange)

    return () => mql?.removeEventListener("change", onMotionChange)
  }, [])

  const onContextLost = useCallback(() => {
    countProbe("contextLost")
    setContextLost(true)
  }, [])

  return {
    ready,
    webglSupported,
    contextLost,
    reducedMotion,
    canRender: shouldRenderScene({ webglSupported, contextLost, reducedMotion }),
    onContextLost,
  }
}

/**
 * Pauses rendering while the canvas is off screen or the tab is hidden.
 *
 * A decorative background does not need 60fps while nobody is looking at it,
 * and continuous rendering is what heats up a phone until the OS intervenes.
 */
export function useSceneActive(ref: React.RefObject<HTMLElement | null>): boolean {
  const [active, setActive] = useState(true)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const onVisibility = () => setActive(!document.hidden)
    document.addEventListener("visibilitychange", onVisibility)

    let observer: IntersectionObserver | undefined
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting && !document.hidden), {
        threshold: 0,
      })
      observer.observe(element)
    } else {
      onVisibility()
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      observer?.disconnect()
    }
  }, [ref])

  return active
}
