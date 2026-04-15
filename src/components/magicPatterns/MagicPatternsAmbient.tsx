/** Фоновые градиенты в духе Magic Patterns (Stripe-like, без шума). */
export function MagicPatternsAmbient() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1]" aria-hidden>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-neon/[0.02] blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-neon/[0.015] blur-[120px]" />
    </div>
  );
}
