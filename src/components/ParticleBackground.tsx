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

type ParticleBackgroundProps = {
  /** Неоновые «пиксели» вместо мягких бликов */
  arcade?: boolean;
  /** Меньше частиц, чище «капля», неон остаётся */
  sparse?: boolean;
};

export function ParticleBackground({ arcade = false, sparse = false }: ParticleBackgroundProps) {
  const particles = useMemo<Particle[]>(() => {
    const n = arcade ? (sparse ? 14 : 28) : sparse ? 12 : 20;
    const opMul = sparse ? 0.55 : 1;
    return Array.from({ length: n }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: arcade ? Math.floor(Math.random() * 2) + 2 : Math.random() * 4 + 2,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 6,
      opacity: (arcade ? Math.random() * 0.35 + 0.12 : Math.random() * 0.25 + 0.05) * opMul
    }));
  }, [arcade, sparse]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => {
        const hues = arcade ?
          ['0, 255, 255', '255, 0, 255', '57, 255, 20', '255, 255, 100']
        : ['255, 255, 255'];
        const rgb = hues[p.id % hues.length]!;
        const bg = arcade ?
          `rgb(${rgb})`
        : `radial-gradient(circle, rgba(255, 255, 255, ${p.opacity}) 0%, transparent 70%)`;
        return (
          <motion.div
            key={p.id}
            className={`absolute ${arcade ? 'rounded-r80-sm' : 'rounded-full'}`}
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
              background: bg,
              opacity: arcade ? p.opacity : undefined,
              boxShadow: arcade ? `0 0 ${p.size}px rgba(${rgb},0.45)` : undefined
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
            }}
          />
        );
      })}
    </div>
  );
}