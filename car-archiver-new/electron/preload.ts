import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS, type IpcChannel } from "../src/shared/ipcChannels";
import type { ElectronApi, IpcRequestMap, IpcResponseMap } from "../src/shared/ipcApi";

const allowedChannels = new Set<string>(IPC_CHANNELS);

function assertAllowedChannel(channel: string): asserts channel is IpcChannel {
  if (!allowedChannels.has(channel)) {
    throw new Error(`IPC channel is not allowed: ${channel}`);
  }
}

const api: ElectronApi = {
  ipcRenderer: {
    invoke<C extends keyof IpcResponseMap>(
      channel: C,
      ...args: IpcRequestMap[C] extends undefined ? [] : [data: IpcRequestMap[C]]
    ): Promise<IpcResponseMap[C]> {
      assertAllowedChannel(channel);
      const data = args[0];
      const result = data === undefined
        ? ipcRenderer.invoke(channel)
        : ipcRenderer.invoke(channel, data);

      return result as Promise<IpcResponseMap[C]>;
    },
  },
};

contextBridge.exposeInMainWorld("electron", api);
