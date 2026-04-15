import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export type MagicInsightItem = {
  icon: LucideIcon;
  text: string;
  color: string;
  bgColor: string;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, x: -8 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }
  }
};

type Props = { title: string; items: MagicInsightItem[] };

export function MagicInsightsFeed({ title, items }: Props) {
  if (items.length === 0) return null;
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full px-0 pb-4"
      aria-label={title}>
      <div className="w-full">
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-3 px-1">
          {title}
        </h2>
        <div className="space-y-2">
          {items.map((insight, i) => (
            <motion.div
              key={i}
              variants={item}
              className="glass-card p-3.5 sm:p-4 flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl ${insight.bgColor} flex items-center justify-center shrink-0`}>
                <insight.icon className={`w-4 h-4 ${insight.color}`} />
              </div>
              <p className="text-sm text-white/70 font-medium leading-snug">
                {insight.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
