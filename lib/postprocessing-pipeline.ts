/**
 * Lifecycle owner for the r3f postprocessing stack.
 *
 * Why this exists
 * ---------------
 * three.js render targets are plain GL objects: they are only released when
 * `dispose()` is called, there is no GC finalizer. `EffectComposer` allocates
 * 2 full-resolution HalfFloat targets and `UnrealBloomPass` allocates 11 more
 * (bright + 5 horizontal + 5 vertical mips) -- roughly 44 MB of GPU memory on a
 * 786x1704 drawing buffer.
 *
 * The original implementation built a new composer inside
 * `useEffect(..., [gl, scene, camera, size])`. r3f hands out a *new* `size`
 * object identity on every resize, so every resize built a fresh ~44 MB stack
 * and dropped the old one on the floor. Mobile browsers fire a burst of
 * resizes while you scroll (the collapsing URL bar changes the viewport height),
 * which grew GPU memory without bound until the browser killed the GPU process
 * and the page died with "can't open this page".
 *
 * The invariant enforced here: a pipeline allocates its composer **at most
 * once**, resizes it in place, and disposes it deterministically. `ensure()` is
 * idempotent, `setSize()` never allocates, `dispose()` is idempotent.
 */

export interface DisposablePass {
  dispose?: () => void
}

export interface ComposerLike {
  addPass: (pass: unknown) => void
  setSize: (width: number, height: number) => void
  render: () => void
  dispose: () => void
  passes?: readonly DisposablePass[]
}

/**
 * Injected constructors. Kept injectable so the lifecycle can be unit tested
 * without a WebGL context.
 */
export interface PostprocessingDeps {
  createComposer: () => ComposerLike
  createRenderPass: () => unknown
  createBloomPass: (width: number, height: number) => unknown
}

export class PostprocessingPipeline {
  private composer: ComposerLike | null = null
  private readonly deps: PostprocessingDeps
  private width = 0
  private height = 0

  constructor(deps: PostprocessingDeps) {
    this.deps = deps
  }

  /**
   * Builds the composer if it does not exist yet. Repeated calls -- including
   * every resize -- return the same instance.
   */
  ensure(): ComposerLike {
    if (this.composer) return this.composer

    const width = this.width
    const height = this.height

    const composer = this.deps.createComposer()
    composer.addPass(this.deps.createRenderPass())
    composer.addPass(this.deps.createBloomPass(width, height))
    if (width > 0 && height > 0) composer.setSize(width, height)

    this.composer = composer
    return composer
  }

  /**
   * Resizes in place. Never allocates: this is the path a resize storm takes,
   * and it must stay allocation free.
   */
  setSize(width: number, height: number): void {
    this.width = width
    this.height = height
    this.composer?.setSize(width, height)
  }

  render(): void {
    this.composer?.render()
  }

  /** Disposes the composer and every pass it owns. Safe to call twice. */
  dispose(): void {
    const composer = this.composer
    this.composer = null
    if (!composer) return

    for (const pass of composer.passes ?? []) {
      pass.dispose?.()
    }
    composer.dispose()
  }
}
