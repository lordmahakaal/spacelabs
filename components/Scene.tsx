"use client"

import { useEffect } from "react"

import { useRef, useMemo } from "react"
import { useFrame, extend, useThree } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"

extend({ EffectComposer, RenderPass, UnrealBloomPass })

interface CubeRef extends THREE.Object3D {
  velocity: THREE.Vector3
}

function NeonCube({ position, index, cubes }: { position: [number, number, number]; index: number; cubes: CubeRef[] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const velocityRef = useRef(
    new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.02),
  )

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.add(velocityRef.current)

      const bounds = 20
      for (let i = 0; i < 3; i++) {
        if (Math.abs(meshRef.current.position.getComponent(i)) > bounds) {
          meshRef.current.position.setComponent(i, -meshRef.current.position.getComponent(i))
        }
      }

      cubes.forEach((cube, i) => {
        if (i !== index && cube) {
          const distance = meshRef.current!.position.distanceTo(cube.position)
          if (distance < 0.5) {
            const normal = new THREE.Vector3().subVectors(meshRef.current!.position, cube.position).normalize()
            const relativeVelocity = new THREE.Vector3().subVectors(velocityRef.current, cube.velocity)
            const impulse = normal.multiplyScalar(relativeVelocity.dot(normal) * 1.5)
            velocityRef.current.sub(impulse)
            cube.velocity.add(impulse)
          }
        }
      })

      cubes[index] = meshRef.current as CubeRef
      cubes[index].velocity = velocityRef.current
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} toneMapped={false} />
    </mesh>
  )
}

function Effects() {
  const { gl, scene, camera, size } = useThree()
  const composerRef = useRef<EffectComposer>()

  useEffect(() => {
    const composer = new EffectComposer(gl)
    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 1.5, 0.4, 0.85))
    composerRef.current = composer
  }, [gl, scene, camera, size])

  useFrame(() => {
    if (composerRef.current) {
      composerRef.current.render()
    }
  }, 1)

  return null
}

export default function Scene() {
  const cubes = useMemo(
    () =>
      Array(100)
        .fill(null)
        .map(
          () =>
            ({
              position: new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
              ),
              velocity: new THREE.Vector3(),
            }) as CubeRef,
        ),
    [],
  )

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      {cubes.map((cube, index) => (
        <NeonCube
          key={index}
          position={[cube.position.x, cube.position.y, cube.position.z]}
          index={index}
          cubes={cubes}
        />
      ))}
      <Effects />
    </>
  )
}
