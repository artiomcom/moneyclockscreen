const KEY_LAST_EXPORT_MS = 'moneyclock_last_export_ms';
const KEY_BANNER_SNOOZE_UNTIL = 'moneyclock_backup_banner_snooze_until';

/** Call after a successful download or clipboard copy of the full export JSON. */
export function touchLastExportTimestamp(): void {
  try {
    localStorage.setItem(KEY_LAST_EXPORT_MS, String(Date.now()));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readLastExportMs(): number | null {
  try {
    const v = localStorage.getItem(KEY_LAST_EXPORT_MS);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function readBackupBannerSnoozeUntil(): number {
  try {
    const v = localStorage.getItem(KEY_BANNER_SNOOZE_UNTIL);
    if (!v) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function persistBackupBannerSnoozeUntil(untilMs: number): void {
  try {
    localStorage.setItem(KEY_BANNER_SNOOZE_UNTIL, String(untilMs));
  } catch {
    /* ignore */
  }
}
