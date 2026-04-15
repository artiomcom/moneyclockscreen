import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export type MagicProjectionItem = {
  label: string;
  value: string;
  description: string;
  Icon: LucideIcon;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }
  }
};

type Props = { title: string; items: MagicProjectionItem[] };

export function MagicProjectionCards({ title, items }: Props) {
  if (items.length === 0) return null;
  return (
    <section className="w-full px-0 pb-5" aria-label={title}>
      <div className="w-full">
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-4 w-full">
          {title}
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[repeat(3,minmax(0,1fr))] sm:items-stretch">
          {items.map((proj) => (
            <motion.div
              key={proj.label}
              variants={item}
              className="glass-card glass-card-hover flex min-h-0 min-w-0 w-full flex-col p-4 sm:p-5">
              <div className="mb-3 flex min-w-0 items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neon/10">
                  <proj.Icon className="h-4 w-4 text-neon" />
                </div>
                <span className="min-w-0 flex-1 text-xs font-medium leading-snug text-white/50">
                  {proj.label}
                </span>
              </div>
              <p className="font-mono text-xl sm:text-2xl font-bold text-white glow-green-subtle">
                {proj.value}
              </p>
              <p className="text-[10px] text-white/25 mt-2 leading-snug">
                {proj.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
