/// <reference types="vite/client" />

import type { ElectronApi } from "./shared/ipcApi";

declare global {
  interface Window {
    electron: ElectronApi;
  }
}

export {};
