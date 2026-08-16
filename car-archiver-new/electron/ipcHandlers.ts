import { ipcMain, dialog, app } from 'electron';
import fs from 'fs';
import path from 'path';
import { CreateDefaultDb } from '../src/main/data/db';
import { CreateDefaultDbTables } from '../src/main/data/setup';
import { initDrizzle } from '../src/main/data/drizzle/drizzleDb';
import { exec } from 'child_process';

import { CustomersRepository } from '../src/main/data/drizzle/repositories';
import { CarsRepository } from '../src/main/data/drizzle/repositories';
import { ServicesRepository } from '../src/main/data/drizzle/repositories';

import { CustomerService } from "../src/services/customerService";
import { PhoneNumbersRepository } from "../src/main/data/drizzle/repositories/phoneNumbersRepository";
import { EmailsRepository } from "../src/main/data/drizzle/repositories/emailsRepository";

const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config.json');

export function registerIpcHandlers() {

  // 1. Config Check
  ipcMain.handle('check-config', async () => {
    return fs.existsSync(configPath);
  });

  // 2. Directory Selection Dialog
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // 3. Import Validation (is there a .sqlite file?)
  ipcMain.handle('verify-import-path', async (_event, folderPath) => {
    const dbName = 'data_carArcihiver.sqlite';
    const dbPath = path.join(folderPath, dbName);

    if (fs.existsSync(dbPath)) {
      return dbPath;
    }
    return null;
  });

  // 4. New Setup: Create Folder and Media Structure
  ipcMain.handle('setup-new-data-structure', async (_event, selectedRoot) => {
    try {
      const mainFolderName = 'CarServiceArchiver';
      const mainPath = path.join(selectedRoot, mainFolderName);
      const dbPath = path.join(mainPath, 'data_carArcihiver.sqlite');
      const mediaPath = path.join(mainPath, 'media');

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
        exec(`attrib +h +i "${mediaPath}"`, (error) => {
          if (error) {
            console.error('⚠️ Media folder could not be hidden:', error);
          } else {
            console.log('🥷 Media folder hidden from Windows Explorer.');
          }
        });
      }

      CreateDefaultDb(dbPath);
      initDrizzle();
      await CreateDefaultDbTables();

      console.log('❇️ Setup completed successfully. DB path:', dbPath);
      return dbPath;

    } catch (error: any) {
      console.error('🆘 Setup failed:', error.message);
      return null;
    }
  });

  // 5. Save Config
  ipcMain.handle('save-config', async (_event, configData) => {
    try {
      const userDataPath = app.getPath('userData');
      const configPath = path.join(userDataPath, 'config.json');

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');

      console.log('❇️ Config file saved successfully:', configPath);
      return true;

    } catch (error: any) {
      console.error('🆘 Failed to save config:', error.message);
      return false;
    }
  });

  // 6. Get Config (BUNU YENİ EKLİYORUZ)
  ipcMain.handle('get-config', async () => {
    try {
      if (fs.existsSync(configPath)) {
        const rawData = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(rawData);
      }
      return null;
    } catch (error: any) {
      console.error('🆘 Config okuma hatası:', error.message);
      return null;
    }
  });

  // 7. Get Dashboard Stats
  ipcMain.handle('get-dashboard-stats', async () => {
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
    } catch (error: any) {
      console.error('🆘 İstatistik okuma hatası:', error.message);
      return { services: 0, customers: 0, cars: 0 };
    }
  });

// 8. Get All Customers (Telefon ve E-postalar Dahil)
  ipcMain.handle('get-all-customers', async () => {
    try {
      const customersRepo = new CustomersRepository();
      const response = await customersRepo.getAllCustomersWithDetails();
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error('🆘 Müşteriler çekilirken hata:', error.message);
      return [];
    }
  });

// 9. Add New Customer (Üç Tabloya Birden İlişkili Kayıt)
  ipcMain.handle('add-customer', async (_event, payload: any) => {
    try {
      const customersRepo = new CustomersRepository();
      const phoneNumbersRepo = new PhoneNumbersRepository();
      const emailsRepo = new EmailsRepository();
      
      // Esas iş mantığının döndüğü servisi ayağa kaldırıyoruz
      const customerService = new CustomerService(customersRepo, phoneNumbersRepo, emailsRepo);

      // Arayüzden gelen DTO verilerini veritabanı modellerine eşliyoruz
      const customerBase = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        nationalId: payload.nationalId,
        taxNumber: payload.taxNumber
      };

      const phoneNumbers = (payload.phones || []).map((p: any) => ({
        countryCode: p.countryCode,
        phoneNumber: p.number
      }));

      const emails = (payload.emails || []).map((e: any) => ({
        customerEmail: e.address
      }));

      // Servis katmanı üzerinden transaction güvenliğiyle 3 tabloya birden yazıyoruz
      const response = await customerService.createCustomer(customerBase, phoneNumbers, emails);
      return response;
    } catch (error: any) {
      console.error('🆘 Müşteri eklenirken hata:', error.message);
      return { success: false, message: error.message };
    }
  });

  // 10. Get Full Customer Profile
  ipcMain.handle('get-customer-profile', async (_event, customerId: number) => {
    try {
      const customersRepo = new CustomersRepository();
      // Az önce CustomersRepository'e eklediğin metodu çağırıyoruz
      const response = await customersRepo.getFullProfile(customerId);
      return response;
    } catch (error: any) {
      console.error('🆘 Müşteri profili alınırken hata:', error.message);
      return { success: false, data: null };
    }
  });

  // Müşteri Düzenleme Formu İçin Veri Çekme
  ipcMain.handle('get-customer-edit', async (_event, customerId: number) => {
    return await new CustomersRepository().getCustomerForEdit(customerId);
  });

// Müşteri Güncelleme
  ipcMain.handle('update-customer', async (_event, req: any) => {
    // req objesi formdan { id: 123, data: { firstName: '...', ... } } şeklinde gelecek
    if (!req || !req.data) {
      console.error("🆘 Arka uca veri ulaşmadı! Gelen istek:", req);
      return { success: false, message: "Veri paketi boş geldi!" };
    }

    return await new CustomersRepository().updateCustomerFull(req.id, req.data);
  });

  // Müşteri Silme Kanalı
  ipcMain.handle('delete-customer', async (_event, req: { id: number, deleteRelated: boolean }) => {
    return await new CustomersRepository().deleteCustomer(req.id, req.deleteRelated);
  });

  // Toplu Müşteri Silme Kanalı
  ipcMain.handle('delete-customers-bulk', async (_event, req: { ids: number[], deleteRelated: boolean }) => {
    return await new CustomersRepository().deleteCustomersBulk(req.ids, req.deleteRelated);
  });

}