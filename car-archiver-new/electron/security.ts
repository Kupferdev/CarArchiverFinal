import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Strict renderer origin check shared by window navigation and IPC sender checks. */
export function isTrustedAppUrl(url: string, devServerUrl: string | undefined, rendererDir: string): boolean {
  try {
    const target = new URL(url);
    if (devServerUrl) {
      const allowed = new URL(devServerUrl);
      return (allowed.protocol === 'http:' || allowed.protocol === 'https:')
        && target.origin === allowed.origin
        && target.protocol === allowed.protocol
        && target.pathname === allowed.pathname
        && target.search === allowed.search;
    }
    if (target.protocol !== 'file:') return false;
    const requested = path.resolve(fileURLToPath(target));
    const expected = path.resolve(rendererDir, 'index.html');
    return process.platform === 'win32'
      ? requested.toLowerCase() === expected.toLowerCase()
      : requested === expected;
  } catch {
    return false;
  }
}
