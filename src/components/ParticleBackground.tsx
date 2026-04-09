import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}
export function ParticleBackground() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from(
      {
        length: 20
      },
      (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 10 + 8,
        delay: Math.random() * 6,
        opacity: Math.random() * 0.25 + 0.05
      })
    );
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) =>
      <motion.div
        key={p.id}
        className="absolute rounded-full"
        style={{
          left: `${p.x}%`,
          width: p.size,
          height: p.size,
          background: `radial-gradient(circle, rgba(255, 255, 255, ${p.opacity}) 0%, transparent 70%)`
        }}
        initial={{
          bottom: -20,
          opacity: 0
        }}
        animate={{
          bottom: ['0%', '110%'],
          opacity: [0, p.opacity, p.opacity, 0],
          x: [0, Math.sin(p.id) * 25, Math.cos(p.id) * -15, 0]
        }}
        transition={{
          duration: p.duration,
          delay: p.delay,
          repeat: Infinity,
          ease: 'linear'
        }} />

      )}
    </div>);

}