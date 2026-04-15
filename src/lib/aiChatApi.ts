/** Chat endpoint: same origin `/api/chat` or `VITE_AI_API_BASE` for split deploy. */
export function getAiChatApiUrl(): string {
  const base = import.meta.env.VITE_AI_API_BASE?.trim();
  if (base) return `${base.replace(/\/$/, '')}/api/chat`;
  return '/api/chat';
}
