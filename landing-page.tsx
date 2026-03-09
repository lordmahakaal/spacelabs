"use client"

import type React from "react"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Grid, Stars, Text3D, Center } from "@react-three/drei"
import { useRef, useState } from "react"
import type * as THREE from "three"
import { Manrope } from "next/font/google"
import Image from "next/image"
import { motion } from "framer-motion"

const manrope = Manrope({ subsets: ["latin"] })

function SpaceHelmet() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} opacity={0.8} transparent />
      </mesh>
      <mesh position={[0, 0.2, 0.6]}>
        <torusGeometry args={[0.4, 0.1, 16, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

function FloatingCube({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [offset] = useState(Math.random() * Math.PI * 2)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + offset) * 0.5
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffffff" opacity={0.1} transparent wireframe />
    </mesh>
  )
}

function AnimatedText({ text }: { text: string }) {
  const textRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  return (
    <Center>
      <Text3D ref={textRef} font="/fonts/helvetiker_regular.typeface.json" size={0.5} height={0.1} curveSegments={12}>
        {text}
        <meshStandardMaterial color="#ffffff" />
      </Text3D>
    </Center>
  )
}

function Scene() {
  const positions: [number, number, number][] = Array(20)
    .fill(0)
    .map(() => [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 30])

  return (
    <>
      <OrbitControls enableZoom={false} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Grid
        renderOrder={-1}
        position={[0, -5, 0]}
        infiniteGrid
        cellSize={1}
        cellThickness={0.5}
        sectionSize={3}
        sectionThickness={1}
        sectionColor={[0.2, 0.2, 0.2]}
        fadeDistance={50}
      />
      {positions.map((position, index) => (
        <FloatingCube key={index} position={position} />
      ))}
    </>
  )
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Add your email sending logic here
    console.log("Form submitted:", formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          className="w-full px-4 py-2 bg-black/20 border border-white/20 rounded-md text-white"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          className="w-full px-4 py-2 bg-black/20 border border-white/20 rounded-md text-white"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          className="w-full px-4 py-2 bg-black/20 border border-white/20 rounded-md text-white"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 px-6 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition duration-300"
      >
        Send Message
      </button>
      <div className="text-center text-sm text-gray-400 mt-4">Or reach us directly at: connect@spacelabs.pro</div>
    </form>
  )
}

export default function Component() {
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact")
    contactSection?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className={`relative w-full min-h-screen bg-black text-white ${manrope.className}`}>
      <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-black/80 backdrop-blur-md">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-19%20at%201.23.00%E2%80%AFPM%20(1).jpeg-NZoZj9kFAQGTgMvuCq1KQupInSwLyi.png"
              alt="Spacelabs Logo"
              width={200}
              height={80}
              className="w-auto h-12"
            />
          </div>
          <ul className="flex space-x-8">
            <li>
              <a href="#solutions" className="hover:text-gray-300">
                Solutions
              </a>
            </li>
            <li>
              <a href="#industries" className="hover:text-gray-300">
                Industries
              </a>
            </li>
            <li>
              <a href="#technology" className="hover:text-gray-300">
                Technology
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-gray-300">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="text-center z-10 mt-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl font-bold mb-8 max-w-4xl mx-auto"
          >
            Democratizing AI for Everyone
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl mb-10 max-w-2xl mx-auto text-gray-300"
          >
            Comprehensive inference services for open-source AI models
          </motion.h2>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            onClick={scrollToContact}
            className="border border-white text-white font-bold py-3 px-6 rounded-md hover:bg-white/10 transition duration-300"
          >
            Learn More
          </motion.button>
        </div>
        <Canvas shadows camera={{ position: [30, 30, 30], fov: 50 }} className="absolute inset-0">
          <Scene />
        </Canvas>
      </div>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12">Solutions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 p-6 rounded-lg"
            >
              <h3 className="text-2xl font-bold mb-4">ScrapeGoat AI</h3>
              <p className="text-gray-300 mb-4">
                A powerful multi-agent, multi-modal AI platform available at scrapegoat.app. Features include:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Personal assistant capabilities</li>
                <li>Web scraping and data analysis</li>
                <li>Image, video, and CAD model generation</li>
                <li>Support for 15+ languages</li>
              </ul>
            </motion.div>
            {/* Add more solution cards */}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12">Industries</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Healthcare",
                description: "Predictive analytics, medical imaging diagnostics, patient monitoring systems",
                market: "INR 3,000 Cr by 2028",
              },
              {
                title: "Education",
                description: "Personalized learning systems, automated content creation, NLP-based tutoring",
                market: "INR 2,500 Cr by 2025",
              },
              {
                title: "Agriculture",
                description: "AI-driven pest detection, crop monitoring, yield predictions",
                market: "INR 1,500 Cr by 2025",
              },
              {
                title: "Governance",
                description: "Citizen service automation, fraud detection, large-scale data analytics",
                market: "INR 2,000 Cr by 2030",
              },
            ].map((industry, index) => (
              <motion.div
                key={industry.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-black/20 p-6 rounded-lg"
              >
                <h3 className="text-xl font-bold mb-4">{industry.title}</h3>
                <p className="text-gray-300 mb-4">{industry.description}</p>
                <p className="text-sm text-gray-400">Market Potential: {industry.market}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Contact Us</h2>
          <ContactForm />
        </div>
      </section>
    </div>
  )
}
