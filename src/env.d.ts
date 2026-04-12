/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional absolute origin for backup API (e.g. https://api.example.com). Empty = same origin. */
  readonly VITE_CLOUD_BACKUP_API_BASE?: string;
  /** Set to `1` / `true` to log all `history.pushState` / `replaceState` calls (see `historyNavigationLogging.ts`). */
  readonly VITE_DEBUG_HISTORY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
