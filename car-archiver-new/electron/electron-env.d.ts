/// <reference types="vite-plugin-electron/electron-env" />

import type { ElectronApi } from "../src/shared/ipcApi";

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string;
    VITE_PUBLIC: string;
  }
}

declare global {
  interface Window {
    electron: ElectronApi;
  }
}

export {};
