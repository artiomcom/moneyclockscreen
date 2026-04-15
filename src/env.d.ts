/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional absolute origin for backup API (e.g. https://api.example.com). Empty = same origin. */
  readonly VITE_CLOUD_BACKUP_API_BASE?: string;
  /** Optional origin for AI chat API when not same-origin (e.g. https://app.pages.dev). Empty = /api/chat on current host. */
  readonly VITE_AI_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
