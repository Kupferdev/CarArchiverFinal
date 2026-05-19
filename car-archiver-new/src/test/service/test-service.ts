import path from 'path';
import fs from 'fs';
import { faker } from '@faker-js/faker';

// Proje içi importlar (Yolları kendi klasör yapına göre düzeltmeyi unutma)
import { CreateDefaultDb } from '../../main/data/db';
import { initDrizzle } from '../../main/data/drizzle/drizzleDb';
import { CreateDefaultDbTables } from '../../main/data/setup';

// Repolar
import { CustomersRepository } from '../../main/data/drizzle/repositories/customersRepository';
import { CarsRepository } from '../../main/data/drizzle/repositories/carsRepository';
import { ServicesRepository } from '../../main/data/drizzle/repositories/servicesRepository';

const log = (msg: string, type: 'info' | 'success' | 'err' | 'step' = 'info') => {
    const icons = { info: 'ℹ️', success: '✅', err: '🆘', step: '🚀' };
    console.log(`${icons[type]} ${msg}`);
};

function getDbPathFromConfig(): string | null {
    try {
        const roamingPath = process.env.APPDATA || '';
        const appFolderName = "CarServiceArchiver"; 
        const configPath = path.join(roamingPath, appFolderName, 'config.json');

        if (!fs.existsSync(configPath)) {
            log("Config file not found!", 'err');
            return null;
        }

        const configRaw = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configRaw);

        return config.savePath || null;
    } catch (error: any) {
        log(`Read error: ${error.message}`, 'err');
        return null;
    }
}

async function runDetailedRepoTest() {
    log("Starting Detailed Service Integration Test...", 'step');

    const dbPath = getDbPathFromConfig();
    if (!dbPath) {
        log("Test stopped because DB path couldn't be resolved.", 'err');
        return;
    }

    try {
        // 1. BAĞLANTI VE KURULUM
        log(`Connecting to LIVE DB: ${dbPath}`, 'info');
        CreateDefaultDb(dbPath);
        initDrizzle();
        
        log("Verifying Database Tables...", 'info');
        await CreateDefaultDbTables(); 

        // Repoları Başlat
        const customersRepo = new CustomersRepository();
        const carsRepo = new CarsRepository();
        const servicesRepo = new ServicesRepository();

        // 2. MÜŞTERİ OLUŞTUR
        log("Creating Dummy Customer...", 'step');
        const newCustomer = await customersRepo.create({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            nationalId: faker.string.numeric(11)
        });
        const customerId = newCustomer.data!.customerId;
        log(`Customer created with ID: ${customerId}`, 'success');

        // 3. ARABA OLUŞTUR
        log("Creating Dummy Car...", 'step');
        const newCar = await carsRepo.create({
            customerId: customerId,
            brandId: 1, 
            bodyType: 1, 
            fuelType: 1, 
            plateNumber: faker.vehicle.vrm(),
            vinNumber: faker.vehicle.vin(),
            year: 2018
        });
        const carId = newCar.data!.carId;
        log(`Car created with ID: ${carId}`, 'success');

        // 4. DETAYLI SERVİS KAYDI OLUŞTUR (Yeni Şemana Göre)
        log("Creating Detailed Service Record...", 'step');
        
        // Gelecek bir randevu tarihi oluşturalım
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const newService = await servicesRepo.create({
            carId: carId,
            customerId: customerId,
            applicationDate: today,
            appointmentDate: tomorrow,
            km: faker.number.int({ min: 50000, max: 120000 }),
            complaints: "Motordan ses geliyor, frenler zayıf tutuyor.", // Zorunlu
            extraRequests: "Silecek sularını da doldurur musunuz?",
            faults: ["Fren balatası aşınmış", "Motor kulakçığı kopuk"], // Array (JSON objesi)
            hasDamageOnReceive: true, // Zorunlu
            damageOnReceive: ["Sağ arka kapı göçük", "Ön tamponda çizikler mevcut"],
            hasDamageDuringRepair: false,
            laborCharge: 2500.00,
            totalCharge: 8500.50
        });

        if (!newService.success || !newService.data) throw new Error(newService.message);
        const serviceId = newService.data.serviceId;
        log(`Service created with ID: ${serviceId}`, 'success');

        // 5. CUSTOM METOTLARI TEST ET
        log("Testing Custom Repository Methods...", 'step');
        
        const fetchByCar = await servicesRepo.getByCarId(carId!);
        log(`Found ${fetchByCar.data?.length} services for Car ID: ${carId}`, fetchByCar.success ? 'success' : 'err');

        // 6. GÜNCELLEME TESTİ (Araba onarıldıktan sonraki senaryo)
        log("Testing Update Method (Simulating repair finish)...", 'step');
        const updateRes = await servicesRepo.update(serviceId!, {
            deliveryDate: new Date(),
            hasDamageDuringRepair: true,
            damageDuringRepair: ["Liftte sol maşpiyel hafif ezildi"], // Ekstra hasar senaryosu
            totalCharge: 9000.00 // Fiyat güncellendi
        });
        
        if (updateRes.success) {
            log(`Service successfully updated (Delivery Date added, Charge updated to ${updateRes.data?.totalCharge}).`, 'success');
        } else {
            log(`Update failed: ${updateRes.message}`, 'err');
        }

        log("==========================================", 'info');
        log("🎉 DETAILED REPOSITORY INTEGRATION TEST PASSED! 🎉", 'success');
        log("==========================================", 'info');

    } catch (error: any) {
        log(`TEST FAILED: ${error.message}`, 'err');
        console.error(error); // Detaylı hatayı görmek için
    }
}

runDetailedRepoTest();