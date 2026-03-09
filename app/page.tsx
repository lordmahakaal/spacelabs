"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
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

const manrope = Manrope({ subsets: ["latin"] })

export default function Home() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <div className={`relative w-full min-h-screen overflow-hidden bg-black text-white ${manrope.className}`}>
      <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-black/80 backdrop-blur-md">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" onClick={() => setActiveTab("home")}>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-19%20at%201.23.00%E2%80%AFPM%20(1).jpeg-NZoZj9kFAQGTgMvuCq1KQupInSwLyi.png"
                alt="Spacelabs Logo"
                width={300}
                height={120}
                className="w-auto h-20"
              />
            </Link>
          </div>
          <ul className="flex space-x-8">
            {["Solutions", "Industries", "Technology", "Contact"].map((tab) => (
              <li key={tab}>
                <button
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`hover:text-gray-300 ${activeTab === tab.toLowerCase() ? "text-white" : "text-gray-400"}`}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 0, 20], fov: 50 }}>
          <ErrorBoundary fallback={<FallbackMessage message="3D scene failed to load" />}>
            <Suspense fallback={<LoadingMessage message="Loading 3D scene..." />}>
              <Scene />
            </Suspense>
          </ErrorBoundary>
        </Canvas>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 min-h-screen pt-32 flex items-center justify-center"
        >
          {activeTab === "home" && (
            <div className="text-center">
              <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-7xl font-bold mb-4 max-w-4xl mx-auto"
              >
                Democratizing AI for Everyone
              </motion.h1>
              <motion.h2
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-2xl mb-10 max-w-2xl mx-auto text-gray-300"
              >
                Comprehensive inference services for open-source AI models and cutting edge solutions for everyone
              </motion.h2>
              <motion.p
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-lg max-w-2xl mx-auto text-gray-400"
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

function FallbackMessage({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50">
      <p>{message}</p>
    </div>
  )
}

function LoadingMessage({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-white">
      <p>{message}</p>
    </div>
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
