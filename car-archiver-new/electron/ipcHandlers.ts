import { app, ipcMain, dialog, BrowserWindow, shell, type IpcMainInvokeEvent } from 'electron';
import { isTrustedAppUrl } from './security';
import fs from 'fs';
import path from 'path';
import { closeDb, CreateDefaultDb, getDb } from '../src/main/data/db';
import { CreateDefaultDbTables } from '../src/main/data/setup';
import { closeDrizzle, initDrizzle } from '../src/main/data/drizzle/drizzleDb';
import { execFile } from 'child_process';
import { getConfig, hasConfig, saveConfig } from '../src/main/helpers/config/configManager';

import { CustomersRepository } from '../src/main/data/drizzle/repositories';
import { CarsRepository } from '../src/main/data/drizzle/repositories';
import { ServicesRepository } from '../src/main/data/drizzle/repositories';
import { BrandsRepository } from '../src/main/data/drizzle/repositories/brandsRepository';

import { CustomerService } from "../src/services/customerService";
import { BrandService, MAX_BRAND_NAME_LENGTH } from "../src/services/brandService";
import { PhoneNumbersRepository } from "../src/main/data/drizzle/repositories/phoneNumbersRepository";
import { EmailsRepository } from "../src/main/data/drizzle/repositories/emailsRepository";
import { ServiceResponse } from '../src/models/response.model';
import type { AppConfig } from '../src/shared/types/appConfig';
import type { BulkDeleteCustomersRequest, CreateCustomerRequest, DeleteCustomerRequest, UpdateCustomerRequest } from '../src/shared/dtos/customerDtos';
import type { CreateBrandRequest } from '../src/shared/dtos/brandDtos';
import type { CreateCarRequest, UpdateCarRequest } from '../src/shared/dtos/carDtos';
import type { CreateServiceWithPartsRequest, UpdateServiceWithPartsRequest, ServicePartInput } from '../src/shared/dtos/serviceDtos';
import type { Service } from '../src/shared/types/service';
import type { Part } from '../src/shared/types/part';
import { ServiceService } from "../src/services/serviceService";
import { PartsRepository } from "../src/main/data/drizzle/repositories/partsRepository";
import { addServiceMedia, listServiceMedia, readServiceMedia } from '../src/main/data/serviceMedia';
import {moveToTrash,listTrash,restoreTrash,purgeTrash,restoreTrashBatch,purgeTrashBatch} from '../src/main/data/trash';
import { backupData, ensureNoBackupInProgress } from '../src/main/data/dataBackup';
import { prepareRestore, validateRestoreBackup } from '../src/main/data/dataRestore';
import { getActiveDbPath } from '../src/main/data/db';
import { exportRecords } from '../src/main/data/exportData';


function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requireString(value: unknown, field: string, allowEmpty = true): string {
  if (typeof value !== "string" || (!allowEmpty && value.trim() === "")) {
    throw new Error(`Invalid ${field}.`);
  }
  return value;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error.";
}

function requireNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${field}.`);
  }
  return value;
}

function parseCustomerRequest(payload: unknown): CreateCustomerRequest {
  if (!isRecord(payload)) throw new Error("Invalid customer payload.");

  const phones = payload.phones === undefined ? [] : payload.phones;
  const emails = payload.emails === undefined ? [] : payload.emails;

  if (!Array.isArray(phones) || !Array.isArray(emails)) {
    throw new Error("Invalid customer contact data.");
  }

  return {
    firstName: requireString(payload.firstName, "firstName", false),
    lastName: requireString(payload.lastName, "lastName"),
    nationalId: requireString(payload.nationalId, "nationalId"),
    taxNumber: requireString(payload.taxNumber, "taxNumber"),
    address: payload.address == null ? "" : requireString(payload.address, "address"),
    phones: phones.map((phone, index) => {
      if (!isRecord(phone)) throw new Error(`Invalid phone at index ${index}.`);
      return {
        countryCode: requireString(phone.countryCode, `phones[${index}].countryCode`, false),
        number: requireString(phone.number, `phones[${index}].number`, false),
      };
    }),
    emails: emails.map((email, index) => {
      if (!isRecord(email)) throw new Error(`Invalid email at index ${index}.`);
      return {
        address: requireString(email.address, `emails[${index}].address`, false),
      };
    }),
  };
}

function parseUpdateCustomerRequest(payload: unknown): UpdateCustomerRequest {
  if (!isRecord(payload)) throw new Error("Invalid update payload.");
  return {
    id: requireNumber(payload.id, "customer id"),
    data: parseCustomerRequest(payload.data),
  };
}

function parseDeleteCustomerRequest(payload: unknown): DeleteCustomerRequest {
  if (!isRecord(payload) || typeof payload.deleteRelated !== "boolean") {
    throw new Error("Invalid delete payload.");
  }
  return {
    id: requireNumber(payload.id, "customer id"),
    deleteRelated: payload.deleteRelated,
  };
}

function parseCreateBrandRequest(payload: unknown): CreateBrandRequest {
  if (!isRecord(payload)) throw new Error("Invalid brand payload.");

  const brandName = requireString(payload.brandName, "brandName", false).trim();

  if (brandName.length > MAX_BRAND_NAME_LENGTH) {
    throw new Error(`Brand name cannot exceed ${MAX_BRAND_NAME_LENGTH} characters.`);
  }

  return { brandName };
}

function parseCarData(payload: unknown): CreateCarRequest {
  if (!isRecord(payload)) throw new Error("Invalid car payload.");

  const optionalInteger = (value: unknown, field: string) => {
    if (value === null || value === undefined || value === "") return null;
    return requireNumber(value, field);
  };

  const optionalString = (value: unknown, field: string, maxLength: number) => {
    if (value === null || value === undefined) return null;
    const text = requireString(value, field).trim();
    if (text.length > maxLength) throw new Error(`${field} cannot exceed ${maxLength} characters.`);
    return text || null;
  };

  const km = payload.km === null || payload.km === undefined || payload.km === ""
    ? null
    : Number(payload.km);

  if (km !== null && (!Number.isFinite(km) || km < 0)) {
    throw new Error("Invalid km.");
  }

  const year = optionalInteger(payload.year, "year");
  if (year !== null && (year < 1886 || year > new Date().getFullYear() + 1)) {
    throw new Error("Invalid year.");
  }

  const plateNumber = optionalString(payload.plateNumber, "plateNumber", 20);
  if (!plateNumber) {
    throw new Error("Plate number is required.");
  }

  const model = optionalString(payload.model, "model", 100);
  const normalizedModel = model
    ? model.charAt(0).toLocaleUpperCase("tr-TR") + model.slice(1)
    : null;

  const vinNumber = optionalString(payload.vinNumber, "vinNumber", 32);
  const engineVolumeCc = optionalInteger(payload.engineVolumeCc, "engineVolumeCc");
  if (engineVolumeCc !== null && engineVolumeCc < 1) {
    throw new Error("Invalid engine volume.");
  }

  const notes = optionalString(payload.notes, "notes", 2000);

  return {
    customerId: optionalInteger(payload.customerId, "customerId"),
    brandId: optionalInteger(payload.brandId, "brandId"),
    model: normalizedModel,
    year,
    vinNumber: vinNumber ? vinNumber.toLocaleUpperCase("tr-TR") : null,
    plateNumber: plateNumber.toLocaleUpperCase("tr-TR"),
    km,
    fuelType: optionalInteger(payload.fuelType, "fuelType"),
    bodyType: optionalInteger(payload.bodyType, "bodyType"),
    engineVolumeCc,
    notes,
  };
}

function parseUpdateCarRequest(payload: unknown): UpdateCarRequest {
  if (!isRecord(payload)) throw new Error("Invalid car update payload.");
  return {
    id: requireNumber(payload.id, "car id"),
    data: parseCarData(payload.data),
    oldCustomerIdToAdd: payload.oldCustomerIdToAdd === null || payload.oldCustomerIdToAdd === undefined
      ? null
      : requireNumber(payload.oldCustomerIdToAdd, "old customer id"),
  };
}


function parseServiceDate(value: unknown, field: string): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? (() => { throw new Error(`Invalid ${field}.`); })() : value;
  if (typeof value !== "string") throw new Error(`Invalid ${field}.`);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${field}.`);
  return date;
}

function parseOptionalNonNegativeNumber(value: unknown, field: string): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) throw new Error(`Invalid ${field}.`);
  return numberValue;
}

function parseServiceRequest(payload: unknown): CreateServiceWithPartsRequest {
  if (!isRecord(payload) || !isRecord(payload.service) || !Array.isArray(payload.parts)) {
    throw new Error("Invalid service payload.");
  }
  const raw = payload.service;
  const carId = requireNumber(raw.carId, "carId");
  const customerId = raw.customerId === null || raw.customerId === undefined || raw.customerId === "" ? null : requireNumber(raw.customerId, "customerId");
  const complaints = raw.complaints == null || raw.complaints === "" ? null : requireString(raw.complaints, "complaints").trim() || null;
  if (complaints && complaints.length > 4000) throw new Error("Complaints cannot exceed 4000 characters.");
  const advisorNotes = raw.advisorNotes == null ? null : requireString(raw.advisorNotes, "advisorNotes").trim() || null;
  if (advisorNotes && advisorNotes.length > 10000) throw new Error("Advisor notes cannot exceed 10000 characters.");
  const extraRequests = raw.extraRequests === null || raw.extraRequests === undefined ? null : requireString(raw.extraRequests, "extraRequests").trim() || null;
  if (extraRequests && extraRequests.length > 4000) throw new Error("Extra requests cannot exceed 4000 characters.");

  const parseStringArray = (value: unknown, field: string, maxItems: number, maxLength: number) => {
    if (value === null || value === undefined || value === "") return [];
    if (!Array.isArray(value)) throw new Error(`Invalid ${field}.`);
    if (value.length > maxItems) throw new Error(`${field} has too many entries (maximum ${maxItems}).`);
    return value.map((item, index) => {
      const text = requireString(item, `${field}[${index}]`, false).trim();
      if (text.length > maxLength) throw new Error(`${field}[${index}] is too long.`);
      return text;
    }).filter(Boolean);
  };

  const jobDuration = raw.jobDuration === null || raw.jobDuration === undefined || raw.jobDuration === "" ? null : Number(raw.jobDuration);
  if (jobDuration !== null && (!Number.isInteger(jobDuration) || jobDuration < 0)) throw new Error("Invalid job duration.");

  const service: Service = {
    carId,
    customerId,
    applicationDate: parseServiceDate(raw.applicationDate, "applicationDate"),
    appointmentDate: parseServiceDate(raw.appointmentDate, "appointmentDate"),
    jobDuration,
    deliveryDate: parseServiceDate(raw.deliveryDate, "deliveryDate"),
    km: parseOptionalNonNegativeNumber(raw.km, "km"),
    complaints,
    extraRequests,
    advisorNotes,
    faults: parseStringArray(raw.faults, "faults", 30, 500),
    hasDamageOnReceive: raw.hasDamageOnReceive === true,
    damageOnReceive: parseStringArray(raw.damageOnReceive, "damageOnReceive", 30, 500),
    hasDamageDuringRepair: raw.hasDamageDuringRepair === true,
    damageDuringRepair: parseStringArray(raw.damageDuringRepair, "damageDuringRepair", 30, 500),
    laborCharge: parseOptionalNonNegativeNumber(raw.laborCharge, "laborCharge"),
    totalCharge: parseOptionalNonNegativeNumber(raw.totalCharge, "totalCharge"),
    targetDeliveryDate: parseServiceDate(raw.targetDeliveryDate, "targetDeliveryDate"),
    isDelivered: raw.isDelivered === true,
  };

  const parts: ServicePartInput[] = payload.parts.map((item, index) => {
    if (!isRecord(item)) throw new Error(`Invalid part at index ${index}.`);
    const partName = requireString(item.partName, `parts[${index}].partName`, false).trim();
    if (partName.length > 200) throw new Error(`parts[${index}].partName is too long.`);
    const quantity = item.quantity;
    const unitPriceKurus = item.unitPriceKurus;
    if (typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new Error(`parts[${index}].quantity must be a positive whole number.`);
    }
    if (typeof unitPriceKurus !== "number" || !Number.isSafeInteger(unitPriceKurus) || unitPriceKurus < 0) {
      throw new Error(`parts[${index}].unitPriceKurus must be a non-negative whole number.`);
    }
    if (!Number.isSafeInteger(quantity * unitPriceKurus)) {
      throw new Error(`parts[${index}] price total is too large.`);
    }
    const partId = item.partId == null ? undefined : requireNumber(item.partId, `parts[${index}].partId`);
    return { partId, partName, quantity, unitPriceKurus };
  });

  return { service, parts };
}

function parseUpdateServiceRequest(payload: unknown): UpdateServiceWithPartsRequest {
  if (!isRecord(payload)) throw new Error("Invalid service update payload.");
  return { id: requireNumber(payload.id, "service id"), ...parseServiceRequest(payload) };
}

function parseBulkDeleteRequest(payload: unknown): BulkDeleteCustomersRequest {
  if (!isRecord(payload) || !Array.isArray(payload.ids) || typeof payload.deleteRelated !== "boolean") {
    throw new Error("Invalid bulk delete payload.");
  }
  const ids = payload.ids.map((id, index) => requireNumber(id, `ids[${index}]`));
  return { ids, deleteRelated: payload.deleteRelated };
}

function parseAppConfig(payload: unknown): AppConfig {
  if (!isRecord(payload)) throw new Error("Invalid app config.");

  const language = requireString(payload.language, "language", false);
  const savePath = requireString(payload.savePath, "savePath", false);

  if (payload.eulaAccepted !== true) throw new Error("EULA must be accepted.");
  if (payload.theme !== "light" && payload.theme !== "dark") throw new Error("Invalid theme.");

  return {
    language,
    savePath,
    eulaAccepted: true,
    theme: payload.theme,
    onboardingCompleted: payload.onboardingCompleted === true,
  };
}

const DATABASE_FILE_NAME = "data_carArchiver.sqlite";

const approvedDirectories = new Set<string>();
const approvedDatabaseFiles = new Set<string>();

function requireApprovedDatabasePath(value: unknown): string {
  const dbPath = requireString(value, "database path", false);
  const normalizedPath = path.normalize(path.resolve(dbPath));

  if (path.basename(normalizedPath) !== DATABASE_FILE_NAME) {
    throw new Error(`Invalid database file. Expected ${DATABASE_FILE_NAME}.`);
  }

  if (!approvedDatabaseFiles.has(normalizedPath) && !fs.existsSync(normalizedPath)) {
    throw new Error("Database file is not available.");
  }

  return normalizedPath;
}

function requireApprovedDirectory(value: unknown): string {
  const selectedPath = requireString(value, "directory", false);
  const normalizedPath = path.normalize(path.resolve(selectedPath));

  if (!approvedDirectories.has(normalizedPath)) {
    throw new Error("Directory was not selected through the native directory picker.");
  }

  return normalizedPath;
}

// Every IPC channel validates its sender in the main process, not just preload.
// A compromised foreign window must never inherit local database/file permissions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function secureHandle(channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => any): void {
  ipcMain.handle(channel, (event, ...args: unknown[]) => {
    const owner = BrowserWindow.fromWebContents(event.sender);
    const trusted = owner !== null && !owner.isDestroyed()
      && event.senderFrame === event.sender.mainFrame
      && isTrustedAppUrl(event.senderFrame.url, process.env['VITE_DEV_SERVER_URL'],
        path.join(process.env.APP_ROOT || app.getAppPath(), 'dist'));
    if (!trusted) throw new Error('IPC sender is not a trusted application page.');
    return listener(event, ...args);
  });
}

export function registerIpcHandlers() {

  // 1. Config Check
  secureHandle('check-config', async () => {
    return hasConfig();
  });

  // 2. Directory Selection Dialog
  secureHandle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (result.canceled || !result.filePaths[0]) return null;

    const selectedPath = path.normalize(path.resolve(result.filePaths[0]));
    approvedDirectories.add(selectedPath);
    return selectedPath;
  });

  // 3. Import Validation (is there a .sqlite file?)
  secureHandle('verify-import-path', async (_event: IpcMainInvokeEvent, rawFolderPath: unknown) => {
    const folderPath = requireApprovedDirectory(rawFolderPath);
    const dbName = DATABASE_FILE_NAME;
    const dbPath = path.join(folderPath, dbName);

    if (fs.existsSync(dbPath)) {
      approvedDatabaseFiles.add(path.normalize(path.resolve(dbPath)));
      return dbPath;
    }
    return null;
  });

  // 4. New Setup: Create Folder and Media Structure
  secureHandle('setup-new-data-structure', async (_event: IpcMainInvokeEvent, rawSelectedRoot: unknown) => {
    try {
      const selectedRoot = requireApprovedDirectory(rawSelectedRoot);
      const mainFolderName = 'CarServiceArchiver';
      const mainPath = path.join(selectedRoot, mainFolderName);
      const dbPath = path.join(mainPath, DATABASE_FILE_NAME);
      const mediaPath = path.join(mainPath, 'media');

      if (fs.existsSync(dbPath)) {
        throw new Error(`A database already exists at ${dbPath}. Choose a different folder or import the existing database.`);
      }

      // Create directories if they don't exist
      if (!fs.existsSync(mainPath)) {
        fs.mkdirSync(mainPath, { recursive: true });
        console.log('📁 Main folder created:', mainPath);
      }

      if (!fs.existsSync(mediaPath)) {
        fs.mkdirSync(mediaPath, { recursive: true });
        console.log('📁 Media folder created:', mediaPath);
      }

      // Hide media folder from Windows Explorer and indexing (Windows only)
      if (process.platform === 'win32') {
        execFile("attrib", ["+h", "+i", mediaPath], (error: Error | null) => {
          if (error) {
            console.error('⚠️ Media folder could not be hidden:', error);
          } else {
            console.log('🥷 Media folder hidden from Windows Explorer.');
          }
        });
      }

      approvedDatabaseFiles.add(path.normalize(path.resolve(dbPath)));
      CreateDefaultDb(dbPath);
      initDrizzle();
      await CreateDefaultDbTables();

      console.log('❇️ Setup completed successfully. DB path:', dbPath);
      return dbPath;

    } catch (error: unknown) {
      console.error('🆘 Setup failed:', getErrorMessage(error));
      // Release the half-initialised database so a retry (even with another
      // folder) is not blocked by "a different database is already open".
      closeDrizzle();
      closeDb();
      return null;
    }
  });

  // 5. Import an existing database file
  secureHandle('setup-imported-data', async (_event: IpcMainInvokeEvent, rawDbPath: unknown) => {
    try {
      const normalizedDbPath = requireApprovedDatabasePath(rawDbPath);

      if (!approvedDatabaseFiles.has(normalizedDbPath)) {
        throw new Error("Database file was not selected through the import flow.");
      }

      closeDrizzle();
      closeDb();
      CreateDefaultDb(normalizedDbPath);
      initDrizzle();
      await CreateDefaultDbTables();

      console.log('❇️ Imported database initialized:', normalizedDbPath);
      return normalizedDbPath;
    } catch (error: unknown) {
      console.error('🆘 Imported database setup failed:', getErrorMessage(error));
      closeDrizzle();
      closeDb();
      return null;
    }
  });

  // 5. Save Config
  secureHandle('save-config', async (_event: IpcMainInvokeEvent, configData: unknown) => {
    try {
      const config = parseAppConfig(configData);
      const normalizedDbPath = requireApprovedDatabasePath(config.savePath);
      if (!approvedDatabaseFiles.has(normalizedDbPath)) {
        throw new Error("Database path was not approved by the setup flow.");
      }
      saveConfig({ ...config, savePath: normalizedDbPath });
      console.log('❇️ Config file saved successfully.');
      return true;
    } catch (error: unknown) {
      console.error('🆘 Failed to save config:', getErrorMessage(error));
      return false;
    }
  });

  // Persist display language independently of config.json (which is guarded by DB validation).
  // This permits the splash to use the exact language selected in Settings on next launch.
  secureHandle('set-startup-language', async (_event: IpcMainInvokeEvent, language: unknown) => {
    const supported = ['tr','en','es','fr','de','pt','zh','ja','ko','ru','nl','az','it','pl'];
    if (typeof language !== 'string' || !supported.includes(language)) return false;
    try {
      fs.writeFileSync(path.join(app.getPath('userData'), 'startup-language.json'),
        JSON.stringify({ language }), { encoding: 'utf8', mode: 0o600 });
      return true;
    } catch (error) { console.error('Could not save startup language:', error); return false; }
  });

  // 6. Get Config
  secureHandle('get-config', async () => {
    return getConfig();
  });

  secureHandle('set-window-theme', (event: IpcMainInvokeEvent, theme: unknown) => {
    if (typeof theme !== 'string' || !['navy','dark','light','dim'].includes(theme)) return false;
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window || process.platform !== 'win32') return false;
    const colors: Record<string, { color: string; symbolColor: string }> = {
      navy: { color: '#151b35', symbolColor: '#e8eaff' },
      dark: { color: '#12151b', symbolColor: '#f0f3f7' },
      light: { color: '#ffffff', symbolColor: '#111827' },
      dim: { color: '#30343d', symbolColor: '#e4e6eb' },
    };
    window.setTitleBarOverlay({ ...colors[theme], height: 30 });
    window.setBackgroundColor(colors[theme].color);
    // The native Windows frame is created before React can read localStorage.
    // Persist the selected palette for the next BrowserWindow creation too.
    try {
      fs.writeFileSync(path.join(app.getPath('userData'), 'window-theme.json'), JSON.stringify(theme), 'utf8');
    } catch (error) {
      console.error('Could not persist window titlebar theme:', error);
    }
    return true;
  });

  // 7. Get Dashboard Stats
  secureHandle('get-dashboard-stats', async () => {
    try {
      // Repository'leri ayağa kaldırıyoruz
      const customersRepo = new CustomersRepository();
      const carsRepo = new CarsRepository();
      const servicesRepo = new ServicesRepository();

      // Üç sorguyu aynı anda başlatarak performansı artırıyoruz (Promise.all)
      const [customersRes, carsRes, servicesRes] = await Promise.all([
        customersRepo.count(),
        carsRepo.count(),
        servicesRepo.count()
      ]);

      // Eğer sorgular başarılıysa veriyi al, başarısızsa 0 dön
      return {
        customers: customersRes.success ? customersRes.data : 0,
        cars: carsRes.success ? carsRes.data : 0,
        services: servicesRes.success ? servicesRes.data : 0
      };
    } catch (error: unknown) {
      console.error('🆘 İstatistik okuma hatası:', getErrorMessage(error));
      return { services: 0, customers: 0, cars: 0 };
    }
  });

// 8. Get All Customers (Telefon ve E-postalar Dahil)
  secureHandle('get-all-customers', async () => {
    try {
      const customersRepo = new CustomersRepository();
      const response = await customersRepo.getAllCustomersWithDetails();
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: unknown) {
      console.error('🆘 Müşteriler çekilirken hata:', getErrorMessage(error));
      return [];
    }
  });

// 9. Add New Customer (Üç Tabloya Birden İlişkili Kayıt)
  secureHandle('add-customer', async (_event: IpcMainInvokeEvent, rawPayload: unknown) => {
    ensureNoBackupInProgress();
    try {
      const customersRepo = new CustomersRepository();
      const phoneNumbersRepo = new PhoneNumbersRepository();
      const emailsRepo = new EmailsRepository();
      
      // Esas iş mantığının döndüğü servisi ayağa kaldırıyoruz
      const customerService = new CustomerService(customersRepo, phoneNumbersRepo, emailsRepo);

      const payload = parseCustomerRequest(rawPayload);

      const customerBase = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        nationalId: payload.nationalId,
        taxNumber: payload.taxNumber,
        address: payload.address
      };

      const phoneNumbers = (payload.phones ?? []).map((phone) => ({
        countryCode: phone.countryCode,
        phoneNumber: phone.number
      }));

      const emails = (payload.emails ?? []).map((email) => ({
        customerEmail: email.address
      }));

      // Servis katmanı üzerinden transaction güvenliğiyle 3 tabloya birden yazıyoruz
      const response = await customerService.createCustomer(customerBase, phoneNumbers, emails);
      return response;
    } catch (error: unknown) {
      console.error('🆘 Müşteri eklenirken hata:', getErrorMessage(error));
      return ServiceResponse.error(error, "Customer could not be created.");
    }
  });

  // 10. Get Full Customer Profile
  secureHandle('get-customer-profile', async (_event: IpcMainInvokeEvent, rawCustomerId: unknown) => {
    try {
      const customerId = requireNumber(rawCustomerId, 'customer id');
      const customersRepo = new CustomersRepository();
      // Az önce CustomersRepository'e eklediğin metodu çağırıyoruz
      const response = await customersRepo.getFullProfile(customerId);
      return response;
    } catch (error: unknown) {
      console.error('🆘 Müşteri profili alınırken hata:', getErrorMessage(error));
      return ServiceResponse.error(error, "Customer profile could not be loaded.");
    }
  });

  // Müşteri Düzenleme Formu İçin Veri Çekme
  secureHandle('get-customer-edit', async (_event: IpcMainInvokeEvent, rawCustomerId: unknown) => {
    const customerId = requireNumber(rawCustomerId, 'customer id');
    return await new CustomersRepository().getCustomerForEdit(customerId);
  });

// Müşteri Güncelleme
  secureHandle('update-customer', async (_event: IpcMainInvokeEvent, rawRequest: unknown) => {
    ensureNoBackupInProgress();
    const request = parseUpdateCustomerRequest(rawRequest);
    return await new CustomersRepository().updateCustomerFull(request.id, request.data);
  });

  // Müşteri Silme Kanalı
  secureHandle('delete-customer', async (_event: IpcMainInvokeEvent, rawRequest: unknown) => {
    ensureNoBackupInProgress();
    const request = parseDeleteCustomerRequest(rawRequest);
    try {moveToTrash('customer',[request.id],request.deleteRelated);return ServiceResponse.success(null,'Moved to Trash.');}catch(error){return ServiceResponse.error(error,'Customer could not be moved to Trash.');}
  });

  // Toplu Müşteri Silme Kanalı
  secureHandle('delete-customers-bulk', async (_event: IpcMainInvokeEvent, rawRequest: unknown) => {
    ensureNoBackupInProgress();
    const request = parseBulkDeleteRequest(rawRequest);
    try {moveToTrash('customer',request.ids,request.deleteRelated);return ServiceResponse.success(null,'Moved to Trash.');}catch(error){return ServiceResponse.error(error,'Customers could not be moved to Trash.');}
  });

  // Print only a local, generated HTML service form. The renderer displays its own A4 preview.
  secureHandle('service-document', async (event: IpcMainInvokeEvent, payload: unknown) => {
    if (!isRecord(payload) || typeof payload.html !== 'string' || payload.html.length > 2_000_000 || !['pdf', 'print'].includes(String(payload.action))) {
      return { success: false, message: 'Invalid document.' };
    }
    const parent = BrowserWindow.fromWebContents(event.sender);
    const printWindow = new BrowserWindow({ show: false, parent: parent ?? undefined, webPreferences: { sandbox: true, nodeIntegration: false, contextIsolation: true, javascript: false, webSecurity: true } });
    try {
      await printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(payload.html));
      await new Promise(resolve => setTimeout(resolve, 300));
      if (payload.action === 'pdf') {
        const filename = typeof payload.filename === 'string' ? Array.from(payload.filename, character => (character.charCodeAt(0) < 32 || /[\\/:*?"<>|]/.test(character)) ? '_' : character).join('').slice(0, 140) : 'Servis Kaydı.pdf';
        const selected = await dialog.showSaveDialog(parent ?? printWindow, {
          defaultPath: filename.endsWith('.pdf') ? filename : filename + '.pdf',
          filters: [{ name: 'PDF', extensions: ['pdf'] }],
        });
        if (selected.canceled || !selected.filePath) return { success: true, canceled: true };
        const pdf = await printWindow.webContents.printToPDF({ pageSize: 'A4', printBackground: true });
        await fs.promises.writeFile(selected.filePath, pdf);
        return { success: true, canceled: false };
      }
      await new Promise<void>((resolve, reject) => {
        printWindow.webContents.print({ silent: false, printBackground: true }, (success, reason) => {
          if (success || reason === 'Print job canceled') resolve();
          else reject(new Error(reason || 'Printing failed'));
        });
      });
      return { success: true, canceled: false };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    } finally {
      if (!printWindow.isDestroyed()) printWindow.close();
    }
  });

  // Yakıt tipleri / kasa tipleri
  secureHandle("get-all-fuel-types", async (_event, requestedLanguage?: string) => {
    try {
      const locale = typeof requestedLanguage === 'string' && /^[a-z]{2}$/.test(requestedLanguage) ? requestedLanguage : 'en';
      const rows = getDb().prepare(`SELECT f.fuelTypeId, COALESCE(loc.translatedName, en.translatedName, f.fuelTypeName) AS fuelTypeName
        FROM FuelTypes f LEFT JOIN (SELECT fuelTypeId, MAX(translatedName) translatedName FROM FuelTypeTranslations WHERE languageCode=? GROUP BY fuelTypeId) loc ON loc.fuelTypeId=f.fuelTypeId
        LEFT JOIN (SELECT fuelTypeId, MAX(translatedName) translatedName FROM FuelTypeTranslations WHERE languageCode='en' GROUP BY fuelTypeId) en ON en.fuelTypeId=f.fuelTypeId
        ORDER BY f.fuelTypeId`).all(locale);
      return ServiceResponse.success(rows);
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Fuel types could not be loaded.");
    }
  });

  secureHandle("get-all-body-types", async (_event, requestedLanguage?: string) => {
    try {
      const locale = typeof requestedLanguage === 'string' && /^[a-z]{2}$/.test(requestedLanguage) ? requestedLanguage : 'en';
      const rows = getDb().prepare(`SELECT b.bodyTypeId, COALESCE(loc.translatedName, en.translatedName, b.bodyTypeName) AS bodyTypeName
        FROM BodyTypes b LEFT JOIN (SELECT bodyTypeId, MAX(translatedName) translatedName FROM BodyTypeTranslations WHERE languageCode=? GROUP BY bodyTypeId) loc ON loc.bodyTypeId=b.bodyTypeId
        LEFT JOIN (SELECT bodyTypeId, MAX(translatedName) translatedName FROM BodyTypeTranslations WHERE languageCode='en' GROUP BY bodyTypeId) en ON en.bodyTypeId=b.bodyTypeId
        ORDER BY b.bodyTypeId`).all(locale);
      return ServiceResponse.success(rows);
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Body types could not be loaded.");
    }
  });

  // Araç listesi
  secureHandle('get-all-cars', async () => {
    try {
      const result = await new CarsRepository().getAll();
      return result;
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Cars could not be loaded.");
    }
  });

  // Tek araç
  secureHandle('get-car', async (_event: IpcMainInvokeEvent, rawCarId: unknown) => {
    try {
      const carId = requireNumber(rawCarId, 'car id');
      return await new CarsRepository().getById(carId);
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Car could not be loaded.");
    }
  });

  // Yeni araç
  secureHandle('add-car', async (_event: IpcMainInvokeEvent, rawPayload: unknown) => {
    ensureNoBackupInProgress();
    try {
      const data = parseCarData(rawPayload);
      return await new CarsRepository().create(data);
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Car could not be created.");
    }
  });

  // Araç güncelle
  secureHandle('update-car', async (_event: IpcMainInvokeEvent, rawPayload: unknown) => {
    ensureNoBackupInProgress();
    try {
      const request = parseUpdateCarRequest(rawPayload);
      const repository = new CarsRepository();
      return request.oldCustomerIdToAdd
        ? await repository.updateWithOldCustomer(request.id, request.data, request.oldCustomerIdToAdd)
        : await repository.update(request.id, request.data);
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Car could not be updated.");
    }
  });

  // Araç silme işlemlerinde servislerin CASCADE ile silinmesi ancak açık onayla mümkündür.
  secureHandle('delete-car', async (_event: IpcMainInvokeEvent, payload: unknown) => {
    ensureNoBackupInProgress();
    try {
      if (!isRecord(payload) || typeof payload.deleteRelated !== 'boolean') throw new Error('Invalid car delete request.');
      const id = requireNumber(payload.id, 'car id');
      moveToTrash('car',[id],payload.deleteRelated); return ServiceResponse.success(undefined,'Moved to Trash.');
    } catch (error: unknown) { return ServiceResponse.error(error, 'Car could not be deleted.'); }
  });
  secureHandle('delete-cars-bulk', async (_event: IpcMainInvokeEvent, payload: unknown) => {
    ensureNoBackupInProgress();
    try {
      if (!isRecord(payload) || !Array.isArray(payload.ids) || !payload.ids.length || typeof payload.deleteRelated !== 'boolean') throw new Error('Invalid bulk car delete request.');
      const ids = payload.ids.map((id: unknown) => requireNumber(id, 'car id'));
      moveToTrash('car',ids,payload.deleteRelated); return ServiceResponse.success(undefined,'Moved to Trash.');
    } catch (error: unknown) { return ServiceResponse.error(error, 'Cars could not be deleted.'); }
  });

  secureHandle('add-old-customer', async (_event: IpcMainInvokeEvent, rawPayload: unknown) => {
    ensureNoBackupInProgress();
    try {
      if (!isRecord(rawPayload)) throw new Error("Invalid old customer payload.");
      const carId = requireNumber(rawPayload.carId, "car id");
      const customerId = requireNumber(rawPayload.customerId, "customer id");
      return await new CarsRepository().addOldCustomer(carId, customerId);
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Old customer could not be added.");
    }
  });

  secureHandle('remove-old-customer', async (_event: IpcMainInvokeEvent, rawPayload: unknown) => {
    ensureNoBackupInProgress();
    try {
      if (!isRecord(rawPayload)) throw new Error("Invalid old customer payload.");
      const carId = requireNumber(rawPayload.carId, "car id");
      const customerId = requireNumber(rawPayload.customerId, "customer id");
      return await new CarsRepository().removeOldCustomer(carId, customerId);
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Old customer could not be removed.");
    }
  });

  // Servis kayıtları
  secureHandle("get-all-services", async () => {
    try {
      return await new ServiceService(new ServicesRepository(), new PartsRepository()).getAll();
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Services could not be loaded.");
    }
  });

  secureHandle("get-service", async (_event: IpcMainInvokeEvent, rawServiceId: unknown) => {
    try {
      return await new ServiceService(new ServicesRepository(), new PartsRepository()).getDetails(requireNumber(rawServiceId, "service id"));
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Service could not be loaded.");
    }
  });

  secureHandle("get-services-by-car", async (_event: IpcMainInvokeEvent, rawCarId: unknown) => {
    try {
      return await new ServiceService(new ServicesRepository(), new PartsRepository()).getByCarId(requireNumber(rawCarId, "car id"));
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Car service history could not be loaded.");
    }
  });

  secureHandle("get-services-by-customer", async (_event: IpcMainInvokeEvent, rawCustomerId: unknown) => {
    try {
      return await new ServiceService(new ServicesRepository(), new PartsRepository()).getByCustomerId(requireNumber(rawCustomerId, "customer id"));
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Customer service history could not be loaded.");
    }
  });

  secureHandle("get-parts-by-service", async (_event: IpcMainInvokeEvent, rawServiceId: unknown) => {
    try {
      return await new PartsRepository().getByServiceId(requireNumber(rawServiceId, "service id"));
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Service parts could not be loaded.");
    }
  });

  secureHandle("add-service", async (_event: IpcMainInvokeEvent, rawPayload: unknown) => {
    ensureNoBackupInProgress();
    try {
      const payload = parseServiceRequest(rawPayload);
      const parts: Part[] = payload.parts.map((part) => ({ carId: payload.service.carId, serviceId: 0, ...part }));
      const result = await new ServiceService(new ServicesRepository(), new PartsRepository()).createService(payload.service, parts);
      return result as never;
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Service could not be created.");
    }
  });

  secureHandle("update-service", async (_event: IpcMainInvokeEvent, rawPayload: unknown) => {
    ensureNoBackupInProgress();
    try {
      const payload = parseUpdateServiceRequest(rawPayload);
      const parts: Part[] = payload.parts.map((part) => ({ carId: payload.service.carId, serviceId: payload.id, ...part }));
      const result = await new ServiceService(new ServicesRepository(), new PartsRepository()).updateService(payload.id, payload.service, parts);
      return result as never;
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Service could not be updated.");
    }
  });

  secureHandle("delete-service", async (_event: IpcMainInvokeEvent, rawServiceId: unknown) => {
    ensureNoBackupInProgress();
    try {
      moveToTrash('service',[requireNumber(rawServiceId, 'service id')]); return ServiceResponse.success(undefined,'Moved to Trash.');
    } catch (error: unknown) {
      return ServiceResponse.error(error, "Service could not be deleted.");
    }
  });

  // v35: files never cross the renderer as arbitrary filesystem paths.
  // An OS picker in the main process supplies the only import paths.
  secureHandle('list-service-media', (_event, rawId: unknown) =>
    listServiceMedia(requireNumber(rawId, 'service id')));
  secureHandle('add-service-media', async (event, rawId: unknown) => {
    const serviceId = requireNumber(rawId, 'service id');
    const owner = BrowserWindow.fromWebContents(event.sender);
    const options = { properties: ['openFile' as const, 'multiSelections' as const],
      filters: [{name:'Images',extensions:['jpg','jpeg','png','webp']}] };
    const result = owner ? await dialog.showOpenDialog(owner, options) : await dialog.showOpenDialog(options);
    return result.canceled ? listServiceMedia(serviceId) : addServiceMedia(serviceId, result.filePaths);
  });
  secureHandle('read-service-media', (_event, rawId: unknown) =>
    readServiceMedia(requireNumber(rawId, 'media id')));
  secureHandle('remove-service-media', (_event, rawId: unknown) =>
    (moveToTrash('photo',[requireNumber(rawId, 'media id')]),true));
  secureHandle('list-trash', () => listTrash());
  secureHandle('restore-trash', (_event, rawId:unknown) => {
    try {restoreTrash(requireNumber(rawId,'trash id'));return {success:true};}
    catch(error){return {success:false,message:getErrorMessage(error)};}
  });
  secureHandle('purge-trash', (_event, rawId:unknown) => {
    try {purgeTrash(requireNumber(rawId,'trash id'));return {success:true};}
    catch(error){return {success:false,message:getErrorMessage(error)};}
  });
  secureHandle('restore-trash-batch', (_event, rawIds:unknown) => {
    try {restoreTrashBatch(rawIds as number[]);return {success:true};}
    catch(error){return {success:false,message:getErrorMessage(error)};}
  });
  secureHandle('purge-trash-batch', (_event, rawIds:unknown) => {
    try {purgeTrashBatch(rawIds as number[]);return {success:true};}
    catch(error){return {success:false,message:getErrorMessage(error)};}
  });
  secureHandle('backup-data', async (event) => {
    const owner = BrowserWindow.fromWebContents(event.sender);
    const options = { properties: ['openDirectory' as const, 'createDirectory' as const] };
    const selected = owner ? await dialog.showOpenDialog(owner, options) : await dialog.showOpenDialog(options);
    if (selected.canceled || !selected.filePaths[0]) return {success:false,canceled:true};
    try { const location = await backupData(selected.filePaths[0]); return {success:true,location}; }
    catch (error) { return {success:false,message:getErrorMessage(error)}; }
  });

  // A verified selection is bound to the invoking renderer until explicit confirmation.
  const restoreSelection = new Map<number, string>();
  secureHandle('restore-data', async (event) => {
    ensureNoBackupInProgress();
    const livePath = getActiveDbPath();
    if (!livePath) return {success:false,message:'Database is not open.'};
    const owner = BrowserWindow.fromWebContents(event.sender);
    const picker = {properties:['openDirectory' as const]};
    const chosen = owner ? await dialog.showOpenDialog(owner,picker) : await dialog.showOpenDialog(picker);
    if (chosen.canceled || !chosen.filePaths[0]) return {success:false,canceled:true};
    try {
      validateRestoreBackup(chosen.filePaths[0]);
      restoreSelection.set(event.sender.id, chosen.filePaths[0]);
      event.sender.once('destroyed', () => {restoreSelection.delete(event.sender.id);});
      return {success:true,folder:chosen.filePaths[0]};
    } catch(error) {return {success:false,message:getErrorMessage(error)};}
  });

  secureHandle('cancel-restore-data', event => {
    restoreSelection.delete(event.sender.id);
    return {success:true};
  });

  secureHandle('confirm-restore-data', async event => {
    ensureNoBackupInProgress();
    const selected = restoreSelection.get(event.sender.id);
    restoreSelection.delete(event.sender.id);
    const livePath = getActiveDbPath();
    if (!selected || !livePath) return {success:false,message:'No verified backup selection.'};
    try {
      // Never overwrite a live SQLite connection: actual replacement runs on next launch.
      prepareRestore(selected,app.getPath('userData'),livePath);
      if (app.isPackaged) {
        // Relaunch only a standalone packaged app. During `npm run dev`, the Vite
        // server belongs to the parent npm process and would die with Electron.
        setTimeout(() => {
          try {
            closeDrizzle();
            closeDb();
            app.relaunch();
            app.exit(0);
          } catch (error) {
            console.error('Could not relaunch after restore:', error);
            app.exit(1);
          }
        }, 350);
      }
      // In development keep the current connection open; the user closes the
      // dev session normally and re-runs npm run dev to apply pending restore.
      return {success:true,restarting:app.isPackaged};
    } catch(error) {return {success:false,message:getErrorMessage(error)};}
  });

  secureHandle('open-support-email', async (_event, raw:unknown) => {
    if (!isRecord(raw)) return false;
    const subject=requireString(raw.subject,'subject').slice(0,200);
    const body=requireString(raw.body,'body').slice(0,6000);
    const link=`mailto:carservicearchiver.support@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return shell.openExternal(link).then(()=>true).catch(()=>false);
  });
  secureHandle('export-data-csv', async (event) => {
    const owner = BrowserWindow.fromWebContents(event.sender);
    const options = { properties: ['openDirectory' as const, 'createDirectory' as const] };
    const selected = owner ? await dialog.showOpenDialog(owner, options) : await dialog.showOpenDialog(options);
    if (selected.canceled || !selected.filePaths[0]) return {success:false,canceled:true};
    try { return {success:true,location:exportRecords(selected.filePaths[0])}; }
    catch (error) { return {success:false,message:getErrorMessage(error)}; }
  });

  // Araç markalarını getir
  secureHandle('get-all-brands', async () => {
    try {
      const brandService = new BrandService(new BrandsRepository());
      return await brandService.getAllBrands();
    } catch (error: unknown) {
      console.error('🆘 Markalar alınırken hata:', getErrorMessage(error));
      return ServiceResponse.error(error, "Brands could not be loaded.");
    }
  });

  // Yeni marka ekle veya mevcut markayı döndür
  secureHandle('add-brand', async (_event: IpcMainInvokeEvent, rawPayload: unknown) => {
    ensureNoBackupInProgress();
    try {
      const payload = parseCreateBrandRequest(rawPayload);
      const brandService = new BrandService(new BrandsRepository());
      return await brandService.createBrand(payload);
    } catch (error: unknown) {
      console.error('🆘 Marka eklenirken hata:', getErrorMessage(error));
      return ServiceResponse.error(error, "Brand could not be created.");
    }
  });

}