'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

function FloatingCard({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    ref.current.rotation.y = state.clock.elapsedTime * 0.15
  })
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <RoundedBox ref={ref} args={[2.2, 1.4, 0.15]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial color={color} roughness={0.1} metalness={0.5}
          transparent opacity={0.3} clearcoat={1} clearcoatRoughness={0.1} />
      </RoundedBox>
      <RoundedBox args={[1.8, 0.15, 0.08]} position={[0, 0.35, 0.1]} radius={0.05}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.15} />
      </RoundedBox>
      <RoundedBox args={[1.4, 0.1, 0.08]} position={[-0.2, 0.05, 0.1]} radius={0.05}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.1} />
      </RoundedBox>
      <RoundedBox args={[1, 0.1, 0.08]} position={[-0.4, -0.2, 0.1]} radius={0.05}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.08} />
      </RoundedBox>
    </Float>
  )
}

function GlowOrb({ position, color, size = 0.3 }: {
  position: [number, number, number]; color: string; size?: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.15
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <MeshDistortMaterial color={color} roughness={0.1} metalness={0.8}
        distort={0.4} speed={2} transparent opacity={0.5} />
    </mesh>
  )
}

export default function FeatureScene({ color = '#3366ff' }: { color?: string }) {
  return (
    <div className="w-full h-64 sm:h-80">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1.5} color={color} />
        <pointLight position={[-2, -1, 2]} intensity={0.8} color="#8b5cf6" />
        <FloatingCard color={color} />
        <GlowOrb position={[1.5, 0.8, -1]} color={color} size={0.2} />
        <GlowOrb position={[-1.5, -0.5, -0.5]} color="#8b5cf6" size={0.15} />
      </Canvas>
    </div>
  )
}
