"use client"

import { useRef, useState } from "react"
import { Canvas, type RootState } from "@react-three/fiber"
import { Manrope } from "next/font/google"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import React, { Suspense } from "react"
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false })
import Solutions from "@/components/Solutions"
import Industries from "@/components/Industries"
import Technology from "@/components/Technology"
import Contact from "@/components/Contact"
import Link from "next/link"

import { useSceneActive, useSceneHealth } from "@/hooks/use-scene-health"
import { CANVAS_RENDER_SETTINGS } from "@/lib/webgl-capability"

const manrope = Manrope({ subsets: ["latin"] })

const TABS = ["Solutions", "Industries", "Technology", "Contact"] as const

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("home")
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const sceneActive = useSceneActive(canvasHostRef)
  const { ready, canRender, onContextLost } = useSceneHealth()

  // A lost GPU context has to be handled on the canvas element itself: the event
  // does not bubble to React, and the ErrorBoundary only sees render errors.
  // `onCreated` is the reliable hook -- it fires once r3f has actually built the
  // renderer, whereas querying for the canvas from an effect races the mount.
  const handleCreated = (state: RootState) => {
    const canvas = state.gl.domElement
    canvas.addEventListener("webglcontextlost", onContextLost, { once: true })
  }

  const showScene = ready && canRender

  return (
    <div className={`relative w-full min-h-screen overflow-hidden bg-black text-white ${manrope.className}`}>
      <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-black/80 backdrop-blur-md">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/" onClick={() => setActiveTab("home")}>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-19%20at%201.23.00%E2%80%AFPM%20(1).jpeg-NZoZj9kFAQGTgMvuCq1KQupInSwLyi.png"
                alt="Spacelabs Logo"
                width={300}
                height={120}
                priority
                sizes="(max-width: 768px) 48px, 80px"
                className="w-auto h-12 md:h-20"
              />
            </Link>
          </div>
          <ul className="flex space-x-3 md:space-x-8 text-xs md:text-base">
            {TABS.map((tab) => (
              <li key={tab}>
                <button
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  aria-current={activeTab === tab.toLowerCase() ? "page" : undefined}
                  className={`hover:text-gray-300 ${activeTab === tab.toLowerCase() ? "text-white" : "text-gray-400"}`}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div ref={canvasHostRef} className="absolute inset-0 z-0" aria-hidden="true">
        {showScene ? (
          <Canvas
            shadows={CANVAS_RENDER_SETTINGS.shadows}
            dpr={CANVAS_RENDER_SETTINGS.dpr}
            gl={{
              antialias: CANVAS_RENDER_SETTINGS.antialias,
              alpha: CANVAS_RENDER_SETTINGS.alpha,
              powerPreference: CANVAS_RENDER_SETTINGS.powerPreference,
            }}
            camera={{ position: [0, 0, 20], fov: 50 }}
            frameloop={sceneActive ? "always" : "never"}
            onCreated={handleCreated}
          >
            <ErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
            </ErrorBoundary>
          </Canvas>
        ) : (
          <SceneBackdrop />
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 min-h-screen pt-20 md:pt-32 flex items-center justify-center px-2 md:px-4"
        >
          {activeTab === "home" && (
            <div className="text-center px-2">
              <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-3xl md:text-5xl lg:text-7xl font-bold mb-2 md:mb-4 max-w-4xl mx-auto"
              >
                Democratizing AI for Everyone
              </motion.h1>
              <motion.h2
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-sm md:text-xl lg:text-2xl mb-4 md:mb-10 max-w-2xl mx-auto text-gray-300"
              >
                Comprehensive inference services for open-source AI models and cutting edge solutions for everyone
              </motion.h2>
              <motion.p
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-xs md:text-lg max-w-2xl mx-auto text-gray-400"
              >
                A non-profit organization fighting for freedom and open access to advanced AI technology
              </motion.p>
            </div>
          )}
          {activeTab === "solutions" && <Solutions />}
          {activeTab === "industries" && <Industries />}
          {activeTab === "technology" && <Technology />}
          {activeTab === "contact" && <Contact />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/**
 * Static stand-in for the 3D scene. Pure CSS, so it costs nothing and cannot
 * fail: used when WebGL is unavailable, when the GPU process was lost, or when
 * the visitor prefers reduced motion.
 */
function SceneBackdrop() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,157,0.12),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(120,80,255,0.1),transparent_60%)]" />
  )
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
