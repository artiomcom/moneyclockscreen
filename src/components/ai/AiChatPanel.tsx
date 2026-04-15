import React, { useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import type { AiMoneySnapshot } from '../../lib/aiMoneySnapshot';
import { getOrCreateAiClientId } from '../../lib/aiClientId';
import { getAiChatApiUrl } from '../../lib/aiChatApi';
import type { AppLocale } from '../../i18n/localeStorage';

type Props = {
  open: boolean;
  onClose: () => void;
  moneySnapshot: AiMoneySnapshot;
  locale: AppLocale;
  t: (key: string) => string;
};

function messageText(content: { parts?: Array<{ type: string; text?: string }> }): string {
  const parts = content.parts;
  if (!Array.isArray(parts)) return '';
  return parts
    .filter((p) => p.type === 'text' && typeof p.text === 'string')
    .map((p) => p.text as string)
    .join('');
}

export function AiChatPanel({ open, onClose, moneySnapshot, locale, t }: Props) {
  const [input, setInput] = useState('');
  const snapRef = useRef(moneySnapshot);
  snapRef.current = moneySnapshot;

  const clientId = useMemo(() => getOrCreateAiClientId(), []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: getAiChatApiUrl(),
        prepareSendMessagesRequest: async ({
          id,
          messages,
          body,
          trigger,
          messageId
        }) => ({
          body: {
            ...body,
            id,
            messages,
            trigger,
            messageId,
            clientId,
            moneySnapshot: snapRef.current,
            locale
          }
        })
      }),
    [clientId, locale]
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const busy = status === 'submitted' || status === 'streaming';

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    void sendMessage({ text });
  };

  return (
    <AnimatePresence>
      {open ?
        <>
          <motion.button
            type="button"
            aria-label={t('ai.close')}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px] dark:bg-violet-950/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-chat-title"
            className="fixed z-[81] right-0 top-0 bottom-0 w-full max-w-md flex flex-col bg-white dark:bg-[#060914] border-l border-gray-200 dark:border-cyan-900/50 shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-cyan-900/50 bg-gradient-to-r from-sky-50 to-violet-50 dark:from-slate-900 dark:to-violet-950/80">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles
                  className="shrink-0 text-violet-600 dark:text-cyan-300"
                  size={22}
                  strokeWidth={2.2}
                />
                <h2
                  id="ai-chat-title"
                  className="text-base font-black text-gray-900 dark:text-cyan-100 truncate"
                >
                  {t('ai.title')}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 w-10 h-10 rounded-r80-sm flex items-center justify-center bg-gray-100 dark:bg-fuchsia-950/50 text-gray-700 dark:text-fuchsia-100"
                aria-label={t('ai.close')}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
              {messages.length === 0 ?
                <p className="text-gray-500 dark:text-cyan-200/60 text-center text-xs font-semibold leading-relaxed px-2">
                  {t('ai.hint')}
                </p>
              : null}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === 'user' ?
                      'ml-6 rounded-r80-sm px-3 py-2 bg-sky-100 dark:bg-cyan-950/60 text-gray-900 dark:text-cyan-50'
                    : 'mr-6 rounded-r80-sm px-3 py-2 bg-gray-100 dark:bg-slate-900/90 text-gray-800 dark:text-cyan-100/95'
                  }
                >
                  <p className="whitespace-pre-wrap break-words font-medium leading-snug">
                    {messageText(m as { parts?: Array<{ type: string; text?: string }> })}
                  </p>
                </div>
              ))}
              {busy ?
                <p className="text-center text-xs font-bold text-violet-600 dark:text-cyan-400/80">
                  {t('ai.thinking')}
                </p>
              : null}
              {error ?
                <p className="text-center text-xs font-bold text-red-600 dark:text-red-400/90">
                  {t('ai.error')}
                </p>
              : null}
            </div>

            <form
              onSubmit={onSubmit}
              className="shrink-0 border-t border-gray-100 dark:border-cyan-900/50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-2 bg-white dark:bg-[#080c18]"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('ai.placeholder')}
                disabled={busy}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-r80-sm border-2 border-sky-300 dark:border-cyan-600/50 bg-white dark:bg-slate-950 text-gray-800 dark:text-cyan-50 text-sm outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="shrink-0 w-12 h-12 rounded-r80-sm flex items-center justify-center bg-violet-600 text-white disabled:opacity-40 disabled:cursor-not-allowed dark:bg-cyan-700"
                aria-label={t('ai.send')}
              >
                <Send size={20} strokeWidth={2.2} />
              </button>
            </form>
          </motion.div>
        </>
      : null}
    </AnimatePresence>
  );
}
