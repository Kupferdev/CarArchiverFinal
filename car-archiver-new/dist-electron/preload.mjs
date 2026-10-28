"use strict";
const electron = require("electron");
const IPC_CHANNELS = [
  "check-config",
  "select-directory",
  "verify-import-path",
  "setup-new-data-structure",
  "setup-imported-data",
  "save-config",
  "get-config",
  "set-startup-language",
  "set-window-theme",
  "service-document",
  "open-support-email",
  "list-service-media",
  "add-service-media",
  "read-service-media",
  "remove-service-media",
  "list-trash",
  "restore-trash",
  "purge-trash",
  "restore-trash-batch",
  "purge-trash-batch",
  "backup-data",
  "restore-data",
  "cancel-restore-data",
  "confirm-restore-data",
  "export-data-csv",
  "get-dashboard-stats",
  "get-all-customers",
  "add-customer",
  "get-customer-profile",
  "get-customer-edit",
  "update-customer",
  "delete-customer",
  "delete-customers-bulk",
  "get-all-brands",
  "add-brand",
  "get-all-fuel-types",
  "get-all-body-types",
  "get-all-cars",
  "get-car",
  "add-car",
  "update-car",
  "delete-car",
  "delete-cars-bulk",
  "add-old-customer",
  "remove-old-customer",
  "get-all-services",
  "get-service",
  "add-service",
  "update-service",
  "delete-service",
  "get-services-by-car",
  "get-services-by-customer",
  "get-parts-by-service"
];
const allowedChannels = new Set(IPC_CHANNELS);
function assertAllowedChannel(channel) {
  if (!allowedChannels.has(channel)) {
    throw new Error(`IPC channel is not allowed: ${channel}`);
  }
}
const api = {
  ipcRenderer: {
    invoke(channel, ...args) {
      assertAllowedChannel(channel);
      const data = args[0];
      const result = data === void 0 ? electron.ipcRenderer.invoke(channel) : electron.ipcRenderer.invoke(channel, data);
      return result;
    }
  }
};
electron.contextBridge.exposeInMainWorld("electron", api);
