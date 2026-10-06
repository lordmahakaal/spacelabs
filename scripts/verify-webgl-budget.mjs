/**
 * Guards the mobile crash from coming back.
 *
 * What it reproduces
 * ------------------
 * The original report: "the phone view crashes when scrolled down". On mobile,
 * scrolling collapses the URL bar, which changes the viewport height, which
 * makes the canvas container resize. r3f measures that with a ResizeObserver and
 * hands the scene a *new* `size` object.
 *
 * The bug: `useEffect(..., [gl, scene, camera, size])` built a fresh
 * EffectComposer + UnrealBloomPass on every one of those resizes and never
 * disposed the previous stack. Each stack holds 13 HalfFloat render targets
 * (~44 MB at 786x1704). Measured on the pre-fix build: 30 viewport height
 * changes produced 31 composers and 0 disposals -- roughly 1.4 GB of GPU
 * memory, after which the browser kills the GPU process and the page dies with
 * "can't open this page".
 *
 * What it asserts
 * ---------------
 * 1. Composer allocations stay at 1 no matter how many resizes arrive.
 * 2. Every pass created is disposed when the pipeline unmounts.
 * 3. The raw GL texture count does not scale with the resize count.
 * 4. If WebGL is available, a canvas is actually mounted.
 * 5. No uncaught page errors along the way.
 *
 * Usage:
 *   pnpm build && pnpm start
 *   node scripts/verify-webgl-budget.mjs [url]        # default http://localhost:3000
 */

import puppeteer from "puppeteer-core"

const URL = process.argv[2] ?? "http://localhost:3000"
const RESIZE_COUNT = 30
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const PORT = Number(process.env.CDP_PORT ?? 9340)

/** iPhone 15 Pro class metrics: 393x852 CSS px at DPR 3. */
const PHONE = { width: 393, height: 852, deviceScaleFactor: 3, mobile: true }

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Counts raw GL object allocations and switches the app's opt-in probe on.
 * Installed before any page script runs so nothing escapes the counters.
 *
 * Deletions are tracked too, because "created" alone is not a leak signal:
 * resizing a canvas legitimately reallocates its drawing buffer textures even
 * in a correct implementation. What must not grow is the number of textures
 * that are alive and never deleted.
 */
function installCounters() {
  window.__spacelabsProbe = true

  const gl = { texturesCreated: 0, texturesDeleted: 0, buffersCreated: 0, buffersDeleted: 0 }
  const pairs = [
    ["texturesCreated", "createTexture", "texturesDeleted", "deleteTexture"],
    ["buffersCreated", "createBuffer", "buffersDeleted", "deleteBuffer"],
  ]

  for (const ctor of [window.WebGL2RenderingContext, window.WebGLRenderingContext]) {
    if (!ctor) continue
    const proto = ctor.prototype
    for (const [createKey, createMethod, deleteKey, deleteMethod] of pairs) {
      const originalCreate = proto[createMethod]
      const originalDelete = proto[deleteMethod]
      if (typeof originalCreate !== "function" || typeof originalDelete !== "function") continue
      proto[createMethod] = function (...args) {
        gl[createKey]++
        return originalCreate.apply(this, args)
      }
      proto[deleteMethod] = function (...args) {
        gl[deleteKey]++
        return originalDelete.apply(this, args)
      }
    }
  }

  window.__glCounts = gl
  window.__resetGlCounts = () => {
    gl.texturesCreated = 0
    gl.texturesDeleted = 0
    gl.buffersCreated = 0
    gl.buffersDeleted = 0
  }
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  userDataDir: `/tmp/spacelabs-webgl-verify-${PORT}`,
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    // Headless macOS has no real GPU; SwiftShader gives a conformant software
    // WebGL implementation so the allocations still happen and can be counted.
    "--enable-unsafe-swiftshader",
    `--remote-debugging-port=${PORT}`,
  ],
  timeout: 120_000,
})

const failures = []
const notes = []

try {
  const page = await browser.newPage()
  const cdp = await page.createCDPSession()

  const pageErrors = []
  page.on("pageerror", (error) => pageErrors.push(String(error)))

  await cdp.send("Emulation.setDeviceMetricsOverride", PHONE)
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true })
  await page.evaluateOnNewDocument(installCounters)

  await page.goto(URL, { waitUntil: "networkidle2", timeout: 90_000 })
  await wait(3000)

  const webglAvailable = await page.evaluate(() => {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
  })

  const canvasMounted = await page.evaluate(() => Boolean(document.querySelector("canvas")))
  const afterLoad = await page.evaluate(() => ({
    probe: window.__spacelabsProbeCounts ?? null,
    gl: { ...window.__glCounts },
  }))
  const liveTexturesAtLoad = afterLoad.gl.texturesCreated - afterLoad.gl.texturesDeleted

  // --- the resize storm a scroll gesture produces -------------------------
  await page.evaluate(() => window.__resetGlCounts())
  for (let i = 0; i < RESIZE_COUNT; i++) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      ...PHONE,
      height: PHONE.height - 60 - (i % 8) * 6,
    })
    await wait(90)
  }
  await wait(800)

  const afterResize = await page.evaluate(() => ({
    probe: window.__spacelabsProbeCounts ?? null,
    gl: { ...window.__glCounts },
  }))

  // --- and the tab switches, which unmount nothing but must stay stable ----
  for (const label of ["Industries", "Technology", "Contact", "Solutions"]) {
    await page.evaluate((text) => {
      const button = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === text)
      button?.click()
    }, label)
    await wait(600)
  }

  const afterTabs = await page.evaluate(() => ({
    probe: window.__spacelabsProbeCounts ?? null,
    gl: { ...window.__glCounts },
    // Scrolling the tab panel is what the original report described.
    panelScrollable: (() => {
      const panel = document.querySelector(".overflow-y-auto")
      if (!panel) return false
      const before = panel.scrollTop
      panel.scrollTop = 600
      const moved = panel.scrollTop !== before
      panel.scrollTop = 0
      return moved
    })(),
  }))

  const probe = afterTabs.probe ?? {}
  const netTexturesCreated = afterResize.gl.texturesCreated - afterResize.gl.texturesDeleted
  const netTextureGrowth = netTexturesCreated - liveTexturesAtLoad

  // --- assertions ---------------------------------------------------------
  // One composer for the whole session, regardless of resizes.
  if ((probe.composers ?? 0) > 1) {
    failures.push(
      `${probe.composers} EffectComposers allocated across ${RESIZE_COUNT} resizes (expected 1). ` +
        `Each holds 13 HalfFloat render targets, so this is the original GPU memory leak.`,
    )
  }

  // Resizes must actually be arriving, or the assertions above prove nothing.
  if ((probe.resizeCalls ?? 0) < RESIZE_COUNT / 2) {
    failures.push(
      `Only ${probe.resizeCalls ?? 0} resize callbacks fired for ${RESIZE_COUNT} viewport changes. ` +
        `The harness did not reproduce the failing condition, so the result is not meaningful.`,
    )
  } else {
    notes.push(`${probe.resizeCalls} resizes delivered, ${probe.composers ?? 0} composer allocated.`)
  }

  // Nothing may be left undisposed. Disposal happens on unmount, so force an
  // unmount by simulating the GPU process being killed: dispatching
  // webglcontextlost is exactly what a browser does when it reclaims the GPU,
  // and it is the event that used to leave visitors with a dead page. This
  // checks the fallback and the cleanup in one step.
  const afterContextLoss = await page.evaluate(async () => {
    const canvas = document.querySelector("canvas")
    if (!canvas) return { dispatched: false }
    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }))
    await new Promise((r) => setTimeout(r, 1200))
    return {
      dispatched: true,
      canvasStillMounted: Boolean(document.querySelector("canvas")),
      fallbackVisible: Boolean(document.querySelector('[class*="radial-gradient"]')),
      probe: window.__spacelabsProbeCounts ?? null,
    }
  })

  const finalProbe = afterContextLoss.probe ?? {}
  const undisposed = (finalProbe.composers ?? 0) - (finalProbe.composerDisposals ?? 0)
  if (undisposed !== 0) {
    failures.push(`${undisposed} composers were never disposed on unmount.`)
  }
  if ((finalProbe.composers ?? 0) > 0 && (finalProbe.passDisposals ?? 0) < 2) {
    failures.push(
      `Only ${finalProbe.passDisposals ?? 0} passes disposed on unmount; each composer owns 2 ` +
        `(RenderPass + UnrealBloomPass), so their render targets are still on the GPU.`,
    )
  }
  if (afterContextLoss.dispatched) {
    if ((finalProbe.contextLost ?? 0) === 0) {
      failures.push("webglcontextlost was dispatched but the page did not observe it.")
    }
    if (afterContextLoss.canvasStillMounted) {
      failures.push("After a lost GPU context the canvas is still mounted; the page would stay dead.")
    }
    if (!afterContextLoss.fallbackVisible) {
      failures.push("After a lost GPU context no static backdrop was rendered.")
    }
    if (undisposed === 0 && (finalProbe.passDisposals ?? 0) >= 2) {
      notes.push("Context loss tore the scene down cleanly and freed every render target.")
    }
  }

  // Independent signal, measured at the GL layer rather than through our own
  // code: textures created but never deleted must not grow with the resize
  // count. A leaked composer holds 13 of them per resize; the fixed version
  // holds a flat count because three.js reuses its targets in setSize().
  //
  // The budget is generous because a correct implementation still reallocates
  // the canvas drawing buffer when the viewport changes. What we are rejecting
  // is growth proportional to RESIZE_COUNT.
  const textureBudget = RESIZE_COUNT * 2
  if (netTextureGrowth > textureBudget) {
    failures.push(
      `${netTextureGrowth} GL textures created but never deleted across ${RESIZE_COUNT} resizes ` +
        `(budget ${textureBudget}). That scales with the resize count, so GPU memory is leaking.`,
    )
  } else {
    notes.push(
      `net GL textures alive grew by ${netTextureGrowth} across ${RESIZE_COUNT} resizes ` +
        `(created ${afterResize.gl.texturesCreated}, deleted ${afterResize.gl.texturesDeleted}).`,
    )
  }

  if (webglAvailable && !canvasMounted) {
    failures.push("WebGL is available but no canvas mounted.")
  }
  if (!webglAvailable) {
    notes.push("WebGL unavailable in this browser; scene fell back to the static backdrop (expected in CI).")
  }

  if (pageErrors.length) {
    failures.push(`uncaught page errors: ${pageErrors.slice(0, 5).join(" | ")}`)
  }

  console.log(
    JSON.stringify(
      {
        url: URL,
        viewport: PHONE,
        webglAvailable,
        canvasMounted,
        resizeCount: RESIZE_COUNT,
        tabPanelScrollable: afterTabs.panelScrollable,
        probe: afterLoad.probe,
        probeAfterResizes: afterResize.probe,
        probeAfterTabs: afterTabs.probe,
        liveTexturesAtLoad,
        glTexturesCreatedDuringResizes: afterResize.gl.texturesCreated,
        glTexturesDeletedDuringResizes: afterResize.gl.texturesDeleted,
        netTexturesLeakedDuringResizes: netTextureGrowth,
        textureBudget,
        afterContextLoss,
      },
      null,
      2,
    ),
  )
} finally {
  await browser.close()
}

for (const note of notes) console.log(`note: ${note}`)

if (failures.length) {
  console.error(`\nFAIL (${failures.length}):`)
  for (const failure of failures) console.error(` - ${failure}`)
  process.exit(1)
}

console.log("\nPASS: composer allocation is bounded, everything created is disposed, no page errors.")
