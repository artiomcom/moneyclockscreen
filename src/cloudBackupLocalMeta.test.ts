import { describe, expect, it } from 'vitest';
import { hashMoneyClockExportJson } from './cloudBackupLocalMeta';

describe('hashMoneyClockExportJson', () => {
  it('is stable for the same input', async () => {
    const a = await hashMoneyClockExportJson('{"v":1}');
    const b = await hashMoneyClockExportJson('{"v":1}');
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it('differs for different input', async () => {
    const a = await hashMoneyClockExportJson('a');
    const b = await hashMoneyClockExportJson('b');
    expect(a).not.toBe(b);
  });
});
