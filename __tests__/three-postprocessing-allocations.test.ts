import { describe, expect, it } from "vitest"
import { readFileSync, readdirSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"

/**
 * These tests read the installed three.js and r3f sources to pin the allocation
 * counts that made the leak expensive, and to document the root cause.
 *
 * They assert on source rather than behaviour on purpose: there is no WebGL
 * context in Node, and the numbers below are what the mobile memory budget was
 * derived from. If a dependency upgrade changes how many render targets
 * EffectComposer/UnrealBloomPass allocate, or how r3f handles `size` identity,
 * these fail and prompt a re-measurement.
 */

const require = createRequire(import.meta.url)
// three's `exports` map does not expose ./package.json, so anchor on the
// postprocessing entry we actually assert against and walk up to the root.
const THREE_ROOT = path.resolve(
  path.dirname(require.resolve("three/examples/jsm/postprocessing/EffectComposer.js")),
  "../../..",
)

function readThree(relativePath: string): string {
  return readFileSync(path.join(THREE_ROOT, relativePath), "utf8")
}

/** r3f ships several builds; concatenate them so the assertions see all copies. */
function readFiberSources(): string {
  const dist = path.dirname(require.resolve("@react-three/fiber"))
  return readdirSync(dist)
    .filter((file) => file.endsWith(".js"))
    .map((file) => readFileSync(path.join(dist, file), "utf8"))
    .join("\n")
}

describe("three.js postprocessing allocation", () => {
  it("EffectComposer allocates two full-resolution HalfFloat targets", () => {
    const source = readThree("examples/jsm/postprocessing/EffectComposer.js")

    expect(source).toMatch(/new WebGLRenderTarget\([^)]*HalfFloatType/)
    expect(source).toMatch(/this\.renderTarget1 = renderTarget/)
    expect(source).toMatch(/this\.renderTarget2 = renderTarget\.clone\(\)/)
  })

  it("UnrealBloomPass builds a bright target plus 5 horizontal and 5 vertical mips", () => {
    const source = readThree("examples/jsm/postprocessing/UnrealBloomPass.js")

    expect(source).toMatch(/this\.nMips = 5/)
    expect(source).toMatch(/this\.renderTargetBright = new WebGLRenderTarget\(/)
    expect(source).toMatch(/this\.renderTargetsHorizontal\.push\(/)
    expect(source).toMatch(/this\.renderTargetsVertical\.push\(/)
    // 11 targets total: 1 bright + nMips horizontal + nMips vertical, every one
    // of them HalfFloatType. The constructor is the only place they are
    // allocated, which is why one leaked composer costs ~44 MB.
    const allocations = source.match(/new WebGLRenderTarget\([^;]{0,120}HalfFloatType/g) ?? []
    expect(allocations).toHaveLength(3)
    expect(source.match(/new WebGLRenderTarget\(/g) ?? []).toHaveLength(3)
  })

  it("setSize reuses the existing targets instead of reallocating", () => {
    const composer = readThree("examples/jsm/postprocessing/EffectComposer.js")
    const bloom = readThree("examples/jsm/postprocessing/UnrealBloomPass.js")

    expect(composer).toMatch(/setSize\( width, height \)/)
    expect(composer).toMatch(/this\.renderTarget1\.setSize\(/)
    expect(bloom).toMatch(/setSize\( width, height \)/)
    expect(bloom).toMatch(/this\.renderTargetsHorizontal\[ i \]\.setSize\(/)
  })

  it("only dispose() releases the targets, so a missing dispose is a real leak", () => {
    const composer = readThree("examples/jsm/postprocessing/EffectComposer.js")
    const bloom = readThree("examples/jsm/postprocessing/UnrealBloomPass.js")

    expect(composer).toMatch(/this\.renderTarget1\.dispose\(\)/)
    expect(bloom).toMatch(/this\.renderTargetsHorizontal\[ i \]\.dispose\(\)/)
  })
})

describe("r3f resize semantics (root cause)", () => {
  it("setSize allocates a fresh size object, so `size` cannot be an effect dependency", () => {
    const source = readFiberSources()

    // A new object identity per resize means any useEffect listing `size`
    // re-runs. Our pipeline depends on the primitive width/height instead and
    // resizes the existing composer in place.
    expect(source).toMatch(/setSize: \(width, height, top = 0, left = 0\)/)
    expect(source).toMatch(/const size = \{/)
  })

  it("defaults dpr to [1, 2], which is why the Canvas caps it explicitly", () => {
    const source = readFiberSources()

    expect(source).toMatch(/dpr = \[1, 2\]/)
  })
})
