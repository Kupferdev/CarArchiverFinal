/** Explicit renderer network boundary: the desktop app is offline in production. */
export function isPermittedRendererRequest(requestUrl: string, devServerUrl?: string): boolean {
  let target: URL;
  try { target = new URL(requestUrl); } catch { return false; }
  if (!['http:', 'https:', 'ws:', 'wss:'].includes(target.protocol)) return true;
  if (!devServerUrl) return false;
  try {
    const dev = new URL(devServerUrl);
    // Never turn Vite's `--host` into authorization for a LAN/Internet origin.
    if (!['localhost', '127.0.0.1', '[::1]'].includes(dev.hostname)
      || !['http:', 'https:'].includes(dev.protocol)) return false;
    if (target.host !== dev.host) return false;
    if (target.protocol === dev.protocol) return true;
    return (dev.protocol === 'http:' && target.protocol === 'ws:')
      || (dev.protocol === 'https:' && target.protocol === 'wss:');
  } catch { return false; }
}
