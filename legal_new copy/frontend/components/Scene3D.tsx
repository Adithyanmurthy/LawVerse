'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Torus, Icosahedron } from '@react-three/drei'
import * as THREE from 'three'

function GlowSphere({ position, color, size = 1, speed = 1, distort = 0.4 }: {
  position: [number, number, number]; color: string; size?: number; speed?: number; distort?: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.3
    ref.current.rotation.x = state.clock.elapsedTime * 0.1 * speed
    ref.current.rotation.z = state.clock.elapsedTime * 0.05 * speed
  })
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.6}>
      <Sphere ref={ref} args={[size, 64, 64]} position={position}>
        <MeshDistortMaterial color={color} roughness={0.1} metalness={0.8}
          distort={distort} speed={2} transparent opacity={0.7} />
      </Sphere>
    </Float>
  )
}

function GlowTorus({ position, color, speed = 0.8 }: {
  position: [number, number, number]; color: string; speed?: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.3 * speed
    ref.current.rotation.y = state.clock.elapsedTime * 0.2 * speed
  })
  return (
    <Float speed={speed} rotationIntensity={0.6} floatIntensity={0.5}>
      <Torus ref={ref} args={[0.8, 0.3, 32, 64]} position={position}>
        <MeshWobbleMaterial color={color} roughness={0.15} metalness={0.9}
          factor={0.3} speed={1.5} transparent opacity={0.5} />
      </Torus>
    </Float>
  )
}

function GlowIcosahedron({ position, color, speed = 0.6 }: {
  position: [number, number, number]; color: string; speed?: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.15 * speed
    ref.current.rotation.y = state.clock.elapsedTime * 0.25 * speed
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4) * 0.2
  })
  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.4}>
      <Icosahedron ref={ref} args={[0.7, 1]} position={position}>
        <MeshDistortMaterial color={color} roughness={0.2} metalness={0.7}
          distort={0.3} speed={1.5} transparent opacity={0.6} />
      </Icosahedron>
    </Float>
  )
}

function Particles({ count = 200 }: { count?: number }) {
  const points = useRef<THREE.Points>(null!)
  const geo = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return geometry
  }, [count])

  useFrame((state) => {
    points.current.rotation.y = state.clock.elapsedTime * 0.02
    points.current.rotation.x = state.clock.elapsedTime * 0.01
  })

  return (
    <points ref={points} geometry={geo}>
      <pointsMaterial size={0.02} color="#6699ff" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-3, 2, 4]} intensity={1.5} color="#3366ff" distance={10} />
      <pointLight position={[3, -2, 2]} intensity={1} color="#8b5cf6" distance={8} />
      <pointLight position={[0, 3, -2]} intensity={0.8} color="#06b6d4" distance={8} />

      <GlowSphere position={[-3.5, 1.5, -2]} color="#3366ff" size={1.2} speed={0.8} distort={0.5} />
      <GlowSphere position={[3.8, -0.5, -3]} color="#8b5cf6" size={0.9} speed={1.2} distort={0.3} />
      <GlowSphere position={[0, 2.5, -4]} color="#06b6d4" size={0.6} speed={1} distort={0.4} />
      <GlowTorus position={[4, 2, -2]} color="#3366ff" speed={0.6} />
      <GlowTorus position={[-4, -1.5, -3]} color="#8b5cf6" speed={0.9} />
      <GlowIcosahedron position={[-1.5, -2, -2]} color="#06b6d4" speed={0.7} />
      <GlowIcosahedron position={[2, 1, -1.5]} color="#3366ff" speed={0.5} />
      <Particles count={300} />
    </>
  )
}

export default function Scene3D({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
