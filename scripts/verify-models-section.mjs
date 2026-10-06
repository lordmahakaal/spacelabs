import puppeteer from "puppeteer-core"

const URL = process.argv[2] ?? "http://localhost:3000"
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  userDataDir: "/tmp/spacelabs-models-final",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader", "--remote-debugging-port=9363"],
  timeout: 120_000,
})

const PHONE = { width: 393, height: 852, deviceScaleFactor: 3, mobile: true }
const failures = []

try {
  const page = await browser.newPage()
  const cdp = await page.createCDPSession()
  await cdp.send("Emulation.setDeviceMetricsOverride", PHONE)

  const errors = []
  page.on("pageerror", (e) => errors.push(String(e)))

  await page.goto(URL, { waitUntil: "networkidle2", timeout: 90_000 })
  await wait(3000)

  const nav = await page.evaluate(() => {
    const list = document.querySelector("header ul")
    const buttons = [...list.querySelectorAll("button")]
    return {
      viewportWidth: window.innerWidth,
      listScrollWidth: list.scrollWidth,
      listClientWidth: list.clientWidth,
      needsScroll: list.scrollWidth > list.clientWidth,
      pageOverflows: document.documentElement.scrollWidth > window.innerWidth,
      lastTabRight: Math.round(buttons[buttons.length - 1].getBoundingClientRect().right),
      tabs: buttons.map((b) => b.textContent.trim()),
    }
  })
  console.log("NAV:", JSON.stringify(nav))
  if (nav.pageOverflows) failures.push("nav overflows the phone viewport horizontally")
  if (!nav.tabs.includes("Models")) failures.push("Models tab missing from nav")
  if (nav.needsScroll) failures.push(`nav needs horizontal scrolling: ${nav.listScrollWidth} > ${nav.listClientWidth}`)
  if (nav.lastTabRight > nav.viewportWidth) failures.push(`last tab is clipped at ${nav.lastTabRight} > ${nav.viewportWidth}`)

  // Click, then poll from Node: waiting inside a single evaluate can read the
  // DOM before React has committed the new panel.
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("header button")].find((b) => b.textContent.trim() === "Models")
    btn.click()
  })

  let panels = 0
  for (const t of [500, 1000, 1500, 2500, 4000]) {
    await wait(t === 500 ? 500 : 400)
    panels = await page.evaluate(() => document.querySelectorAll(".overflow-y-auto").length)
    if (panels > 0) break
  }
  await wait(600)

  const models = await page.evaluate(() => {
    const panel = document.querySelector(".overflow-y-auto")
    const text = document.body.innerText
    return {
      hasPanel: Boolean(panel),
      scrollHeight: panel?.scrollHeight ?? null,
      clientHeight: panel?.clientHeight ?? null,
      mentions: {
        dualTrack: text.includes("Dual-Track Parallel Architecture"),
        tinyCoder: text.includes("ScrapeGoat-Tiny-Coder"),
        butterfly: text.includes("Butterfly Tipping Point 50B"),
        proMax: text.includes("ScrapeGoat Pro Max"),
        superCoder: text.includes("ScrapeGoat SuperCoder"),
        launchingSoon: (text.match(/launching soon/gi) || []).length,
        investors: text.includes("looking for investors"),
        oneMillion: text.includes("1M tokens"),
        twoPointEight: text.includes("2.8T"),
        fourPointFour: text.includes("4.4T"),
        hfLink: !!document.querySelector('a[href*="huggingface.co/scrapegoat/Scrapegoat-Tiny-Coder"]'),
        butterflyLink: !!document.querySelector('a[href*="huggingface.co/scrapegoat/butterfly-tipping-point-50B"]'),
        githubLink: !!document.querySelector('a[href*="github.com/scrapegoat/butterfly-tipping-point"]'),
        diagram: !!document.querySelector("svg[role='img']"),
      },
      fabricatedScores: /\b\d{1,3}\.\d\s*(?:points?|%)\b/i.test(text),
    }
  })

  console.log("MODELS:", JSON.stringify(models, null, 1))

  const m = models.mentions
  for (const [key, want] of Object.entries({
    dualTrack: true,
    tinyCoder: true,
    butterfly: true,
    proMax: true,
    superCoder: true,
    investors: true,
    oneMillion: true,
    twoPointEight: true,
    fourPointFour: true,
    hfLink: true,
    butterflyLink: true,
    githubLink: true,
    diagram: true,
  })) {
    if (m[key] !== want) failures.push(`models section: ${key} = ${m[key]}, expected ${want}`)
  }
  if (m.launchingSoon !== 2) failures.push(`expected 2 "Launching soon" badges, found ${m.launchingSoon}`)
  if (models.fabricatedScores) failures.push("found score-like claims; no benchmarks are published")
  if (!models.hasPanel) failures.push("models panel did not render")

  // Scroll it the way the crash report described.
  const scroll = await page.evaluate(async () => {
    const panel = document.querySelector(".overflow-y-auto")
    if (!panel) return { error: "no panel" }
    for (let i = 0; i < 25; i++) {
      panel.scrollTop += 400
      await new Promise((r) => setTimeout(r, 40))
    }
    return {
      scrollTop: Math.round(panel.scrollTop),
      scrollable: panel.scrollHeight > panel.clientHeight,
      reachedEnd: panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 4,
    }
  })
  console.log("SCROLL:", JSON.stringify(scroll))

  // The panel must scroll internally rather than grow the page, otherwise the
  // viewport-fixed canvas and header stop lining up with the content.
  if (!scroll.scrollable) failures.push("models panel is not internally scrollable")
  if (scroll.scrollTop === 0) failures.push("scrolling the models panel had no effect")
  const pageOverflow = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  )
  console.log("PAGE OVERFLOW (px):", pageOverflow)
  if (pageOverflow > 2) failures.push(`page itself scrolls by ${pageOverflow}px; the panel should scroll instead`)

  await page.screenshot({ path: "/tmp/spacelabs-models-phone.png" })
  if (errors.length) failures.push(`page errors: ${errors.slice(0, 3).join(" | ")}`)
} finally {
  await browser.close()
}

if (failures.length) {
  console.error("\nFAIL:")
  for (const f of failures) console.error(" - " + f)
  process.exit(1)
}
console.log("\nPASS: models section renders on a phone viewport with all expected content.")
