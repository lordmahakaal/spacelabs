"use client"

import { useEffect, useMemo, useRef } from "react"

import { useFrame, useThree } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"

import { PostprocessingPipeline, type ComposerLike, type PostprocessingDeps } from "@/lib/postprocessing-pipeline"
import { activeProbe, countProbe } from "@/lib/scene-probe"
import { CUBE_COUNT, STARS_COUNT_DESKTOP, STARS_COUNT_MOBILE, isMobileWidth } from "@/lib/webgl-capability"

const BOUNDS = 20
const COLLISION_DISTANCE = 0.5
const COLLISION_BOUNCE = 1.5

/**
 * Postprocessing.
 *
 * The composer is built once and reused. Resizes call `setSize` on the existing
 * stack -- three.js reallocates nothing in that path -- and unmounting disposes
 * it. `size` is deliberately NOT a dependency of the effect that builds the
 * composer: r3f produces a fresh `size` object on every resize, which used to
 * leak a ~44 MB GPU stack per resize and kill the GPU process on phones.
 */
function Effects() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)
  const pixelRatio = useThree((state) => state.viewport.dpr)

  const pipelineRef = useRef<PostprocessingPipeline | null>(null)

  useEffect(() => {
    const deps: PostprocessingDeps = {
      createComposer: () => new EffectComposer(gl) as unknown as ComposerLike,
      createRenderPass: () => new RenderPass(scene, camera),
      createBloomPass: (w, h) => new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 0.85),
    }

    const probe = activeProbe()
    if (probe) {
      probe.pipelines++
      const create = deps.createComposer

      deps.createComposer = () => {
        probe.composers++
        const composer = create()
        const dispose = composer.dispose.bind(composer)
        composer.dispose = () => {
          probe.composerDisposals++
          return dispose()
        }
        // `composer.passes` is still empty at construction time, so wrap each
        // pass as it goes in -- that is the single place passes are attached.
        const addPass = composer.addPass.bind(composer)
        composer.addPass = (pass: unknown) => {
          const target = pass as { dispose?: () => void }
          const disposePass = target.dispose?.bind(target)
          if (disposePass) {
            target.dispose = () => {
              probe.passDisposals++
              disposePass()
            }
          }
          return addPass(pass)
        }
        return composer
      }
    }

    const pipeline = new PostprocessingPipeline(deps)
    pipelineRef.current = pipeline
    pipeline.setSize(width, height)
    pipeline.ensure()

    return () => {
      pipeline.dispose()
      pipelineRef.current = null
    }
    // `width`/`height` are applied by the effect below, not here: adding them
    // here would rebuild the composer on every resize, which is the bug this
    // component exists to prevent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera])

  useEffect(() => {
    if (!pipelineRef.current) return
    countProbe("resizeCalls")
    pipelineRef.current.setSize(width, height)
  }, [width, height, pixelRatio])

  useFrame(() => {
    pipelineRef.current?.render()
    countProbe("renderCalls")
  }, 1)

  return null
}

/**
 * The 100 neon cubes as a single InstancedMesh.
 *
 * The previous version rendered 100 <mesh> elements, each with its own
 * useFrame subscriber running an O(n^2) pairwise collision scan -- 10,000
 * distanceTo calls per frame plus two `new THREE.Vector3()` allocations per
 * collision. That was 100 draw calls of PBR material and a steady stream of
 * garbage for the GC. One instanced draw and preallocated scratch vectors give
 * the same motion with none of that.
 */
function NeonCubes({ count }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const { positions, velocities, scratch } = useMemo(() => {
    const positions = Array.from({ length: count }, () =>
      new THREE.Vector3(
        (Math.random() - 0.5) * BOUNDS * 2,
        (Math.random() - 0.5) * BOUNDS * 2,
        (Math.random() - 0.5) * BOUNDS * 2,
      ),
    )
    const velocities = positions.map(
      () => new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.02),
    )
    const scratch = {
      matrix: new THREE.Matrix4(),
      offset: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      relative: new THREE.Vector3(),
      impulse: new THREE.Vector3(),
    }
    return { positions, velocities, scratch }
  }, [count])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return

    for (let i = 0; i < count; i++) {
      const position = positions[i]
      const velocity = velocities[i]

      position.add(velocity)

      for (let axis = 0; axis < 3; axis++) {
        if (Math.abs(position.getComponent(axis)) > BOUNDS) {
          position.setComponent(axis, -position.getComponent(axis))
        }
      }

      for (let j = 0; j < count; j++) {
        if (i === j) continue
        const other = positions[j]
        if (position.distanceToSquared(other) >= COLLISION_DISTANCE * COLLISION_DISTANCE) continue

        scratch.normal.subVectors(position, other).normalize()
        scratch.relative.subVectors(velocity, velocities[j])
        scratch.impulse.copy(scratch.normal).multiplyScalar(scratch.relative.dot(scratch.normal) * COLLISION_BOUNCE)
        velocity.sub(scratch.impulse)
        velocities[j].add(scratch.impulse)
      }

      scratch.offset.copy(position)
      scratch.matrix.makeTranslation(scratch.offset.x, scratch.offset.y, scratch.offset.z)
      mesh.setMatrixAt(i, scratch.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} toneMapped={false} />
    </instancedMesh>
  )
}

export default function Scene() {
  // Subscribing to the primitive width (not `size`) re-evaluates the density
  // choice on resize without re-rendering on every r3f state change.
  const width = useThree((state) => state.size.width)
  const isMobile = isMobileWidth(width)

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <Stars
        radius={100}
        depth={50}
        count={isMobile ? STARS_COUNT_MOBILE : STARS_COUNT_DESKTOP}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      <NeonCubes count={isMobile ? Math.round(CUBE_COUNT * 0.6) : CUBE_COUNT} />
      <Effects />
    </>
  )
}
