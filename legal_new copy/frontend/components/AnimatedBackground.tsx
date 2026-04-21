'use client'

import { motion } from 'framer-motion'

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <motion.div
        animate={{ x: [0, 100, -50, 0], y: [0, -80, 60, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-brand-500/[0.07] blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, -80, 60, 0], y: [0, 100, -40, 0], scale: [1, 0.8, 1.3, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[40%] right-[10%] w-[600px] h-[600px] rounded-full bg-purple-500/[0.05] blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, 60, -100, 0], y: [0, -60, 80, 0], scale: [1, 1.1, 0.85, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.05] blur-[100px]"
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,10,22,0.8)_70%)]" />
    </div>
  )
}
