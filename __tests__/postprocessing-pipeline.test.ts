import { describe, expect, it, vi } from "vitest"

import {
  PostprocessingPipeline,
  type ComposerLike,
  type PostprocessingDeps,
} from "../lib/postprocessing-pipeline"

/**
 * Regression tests for the mobile crash.
 *
 * The bug: `useEffect(..., [gl, scene, camera, size])` built a new
 * EffectComposer on every resize and never disposed the old one. r3f hands out
 * a new `size` object identity per resize, and mobile scrolling fires a burst of
 * resizes as the URL bar collapses. Each EffectComposer + UnrealBloomPass holds
 * 13 HalfFloat render targets (~44 MB of GPU memory at 786x1704), so the GPU
 * process was killed and the page died with "can't open this page".
 *
 * These tests pin the invariant that prevents it: resize must never allocate.
 */

function createHarness() {
  const created = { composers: 0, renderPasses: 0, bloomPasses: 0 }
  const disposed = { composers: 0, passes: 0 }

  const deps: PostprocessingDeps = {
    createComposer: () => {
      created.composers++
      let passCount = 0
      const composer: ComposerLike = {
        addPass: () => {
          passCount++
        },
        setSize: vi.fn(),
        render: vi.fn(),
        dispose: () => {
          disposed.composers++
          disposed.passes += passCount
        },
        passes: [],
      }
      return composer
    },
    createRenderPass: () => {
      created.renderPasses++
      return {}
    },
    createBloomPass: () => {
      created.bloomPasses++
      return {}
    },
  }

  return { deps, created, disposed }
}

describe("PostprocessingPipeline", () => {
  it("allocates the composer exactly once no matter how many resizes arrive", () => {
    const { deps, created } = createHarness()
    const pipeline = new PostprocessingPipeline(deps)

    pipeline.setSize(390, 844)
    pipeline.ensure()

    // A mobile scroll gesture: the collapsing URL bar fires a burst of resizes.
    for (let i = 0; i < 50; i++) {
      pipeline.setSize(390, 700 + (i % 7))
      pipeline.render()
    }

    expect(created.composers).toBe(1)
    expect(created.renderPasses).toBe(1)
    expect(created.bloomPasses).toBe(1)

    pipeline.dispose()
  })

  it("ensure() is idempotent", () => {
    const { deps, created } = createHarness()
    const pipeline = new PostprocessingPipeline(deps)

    const first = pipeline.ensure()
    const second = pipeline.ensure()
    const third = pipeline.ensure()

    expect(first).toBe(second)
    expect(second).toBe(third)
    expect(created.composers).toBe(1)

    pipeline.dispose()
  })

  it("setSize forwards to the existing composer instead of building a new one", () => {
    const { deps, created } = createHarness()
    const pipeline = new PostprocessingPipeline(deps)

    const composer = pipeline.ensure()
    const setSize = composer.setSize as ReturnType<typeof vi.fn>

    pipeline.setSize(393, 852)
    pipeline.setSize(393, 600)
    pipeline.setSize(393, 852)

    expect(setSize).toHaveBeenCalledTimes(3)
    expect(setSize).toHaveBeenLastCalledWith(393, 852)
    expect(created.composers).toBe(1)

    pipeline.dispose()
  })

  it("disposes the composer on unmount so GPU memory is released", () => {
    const { deps, disposed } = createHarness()
    const pipeline = new PostprocessingPipeline(deps)

    pipeline.ensure()
    for (let i = 0; i < 20; i++) pipeline.setSize(390, 700 + i)

    pipeline.dispose()

    expect(disposed.composers).toBe(1)
    // Both passes must be disposed, not just the composer wrapper.
    expect(disposed.passes).toBe(2)
  })

  it("dispose() is idempotent and render() after dispose is a no-op", () => {
    const { deps, disposed, created } = createHarness()
    const pipeline = new PostprocessingPipeline(deps)

    pipeline.ensure()
    pipeline.dispose()
    pipeline.dispose()
    pipeline.dispose()
    pipeline.render()

    expect(disposed.composers).toBe(1)
    expect(created.composers).toBe(1)
  })

  it("survives repeated mount/unmount cycles without accumulating composers", () => {
    const { deps, created, disposed } = createHarness()

    // Ten tab switches: each unmounts the scene and builds a fresh pipeline.
    for (let i = 0; i < 10; i++) {
      const pipeline = new PostprocessingPipeline(deps)
      pipeline.ensure()
      pipeline.setSize(393, 852)
      pipeline.render()
      pipeline.dispose()
    }

    expect(created.composers).toBe(10)
    expect(disposed.composers).toBe(10)
  })

  it("applies the pending size when the composer is created after a resize", () => {
    const { deps } = createHarness()
    const pipeline = new PostprocessingPipeline(deps)

    // Size arrives before mount (first paint on a phone).
    pipeline.setSize(393, 852)

    const composer = pipeline.ensure()
    const setSize = composer.setSize as ReturnType<typeof vi.fn>

    expect(setSize).toHaveBeenCalledWith(393, 852)

    pipeline.dispose()
  })
})
