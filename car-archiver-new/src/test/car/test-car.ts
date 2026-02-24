import { CarService } from "../../services/carService"; // Yolunu kontrol et
import { Car } from "../../shared/types/car";
import { faker } from '@faker-js/faker';

// ==========================================
// 1. MOCK REPOSITORY (Veritabanı Taklidi)
// ==========================================
class MockCarsRepository {
    public db: Car[] = [];
    public oldCustomersDb: { carId: number, oldCustomerId: number }[] = [];

    // --- CRUD İşlemleri ---
    async create(car: Car) {
        // Yeni bir ID ata ve kaydet
        const newCar = { ...car, carId: this.db.length + 1 };
        this.db.push(newCar);
        // Repository katmanı { success: true, data: Car } döner
        return { success: true, data: newCar };
    }

    async update(carId: number, car: Car) {
        const index = this.db.findIndex(c => c.carId === carId);
        if (index === -1) return { success: false, message: "Car not found" };
        
        // Mevcut veriyi güncelle
        this.db[index] = { ...this.db[index], ...car };
        return { success: true, message: "Car updated successfully", data: this.db[index] };
    }

    async delete(carId: number) {
        const initialLen = this.db.length;
        this.db = this.db.filter(c => c.carId !== carId);
        if (this.db.length === initialLen) return { success: false, message: "Not found" };
        return { success: true, message: "Deleted" };
    }

    // --- İlişkisel İşlemler ---
    async addOldCustomer(carId: number, oldCustomerId: number) {
        this.oldCustomersDb.push({ carId, oldCustomerId });
        return { success: true, message: "Old customer added" };
    }

    async getOldCustomers(carId: number) {
        const list = this.oldCustomersDb.filter(x => x.carId === carId);
        return { success: true, data: list };
    }

    // --- Get / Sorgu İşlemleri ---
    async getAll() { return { success: true, data: this.db }; }

    async getByCustomerId(customerId: number) {
        const list = this.db.filter(c => c.customerId === customerId);
        return { success: true, data: list };
    }

    async getByBrandId(brandId: number) {
        const list = this.db.filter(c => c.brand === brandId);
        return { success: true, data: list };
    }

    async getByYear(year: number) {
        const list = this.db.filter(c => c.year === year);
        return { success: true, data: list };
    }

    async getByFuelType(fuelType: number) {
        const list = this.db.filter(c => c.fuelType === fuelType);
        return { success: true, data: list };
    }

    async getByBodyType(bodyType: number) {
        const list = this.db.filter(c => c.bodyType === bodyType);
        return { success: true, data: list };
    }

    async getByVinNumber(vin: string) {
        const car = this.db.find(c => c.vinNumber === vin);
        if (!car) return { success: false, message: "Not found" };
        return { success: true, data: car };
    }

    async getByPlateNumber(plate: string) {
        const car = this.db.find(c => c.plateNumber === plate);
        if (!car) return { success: false, message: "Not found" };
        return { success: true, data: car };
    }
}

// ==========================================
// 2. TEST ÇALIŞTIRICI YARDIMCILARI
// ==========================================
async function runTest(label: string, testFn: () => Promise<void>) {
    process.stdout.write(`TEST: ${label.padEnd(60, '.')}`);
    try {
        await testFn();
        console.log(" ✅ GEÇTİ");
    } catch (e: any) {
        console.log(" ❌ KALDI");
        console.error(`    HATA: ${e.message}`);
        process.exit(1); // Hata varsa testi durdur
    }
}

function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
}

// ==========================================
// 3. ANA TEST SENARYOSU (TÜM METOTLAR)
// ==========================================
async function main() {
    console.log("\n🚗 CAR SERVICE TEST SUITE (FULL COVERAGE)\n" + "=".repeat(80));

    // Servisi Mock ile başlatıyoruz ('as any' kullanarak tip hatalarını engelliyoruz)
    const mockRepo = new MockCarsRepository();
    const service = new CarService(mockRepo as any);

    // Test Verileri
    const TEST_VIN = faker.vehicle.vin();
    const TEST_PLATE = faker.vehicle.vrm();
    const TEST_CUST_ID = 123;
    const TEST_BRAND_ID = 5;
    let createdCarId = 0;

    // --- 1. CREATE ---
    await runTest("createCar (Araç Oluşturma)", async () => {
        const carData: Car = {
            customerId: TEST_CUST_ID,
            brand: TEST_BRAND_ID,
            model: 10,
            year: 2023,
            vinNumber: TEST_VIN,
            plateNumber: TEST_PLATE,
            km: 10000,
            fuelType: 1,
            bodyType: 2
        };

        const result = await service.createCar(carData);
        assert(result.success, "Create başarısız");
        assert(result.data!.data!.vinNumber === TEST_VIN, "VIN Eşleşmedi");
        
        createdCarId = result.data!.data!.carId!;
        assert(createdCarId > 0, "Car ID oluşmadı");
    });

    // --- 2. UPDATE ---
    await runTest("updateCar (Araç Güncelleme)", async () => {
        const updateData: Car = { customerId: TEST_CUST_ID, km: 50000 };
        const result = await service.updateCar(createdCarId, updateData);
        
        assert(result.success, "Update başarısız");
        // Mock DB kontrolü
        const currentCar = mockRepo.db.find(c => c.carId === createdCarId);
        assert(currentCar!.km === 50000, "KM güncellenmedi");
    });

    // --- 3. GET BY VIN ---
    await runTest("getByVinNumber", async () => {
        const result = await service.getByVinNumber(TEST_VIN);
        assert(result.success, "Bulunamadı");
        assert(result.data!.data!.vinNumber === TEST_VIN, "Veri hatalı");
    });

    // --- 4. GET BY PLATE ---
    await runTest("getByPlateNumber", async () => {
        const result = await service.getByPlateNumber(TEST_PLATE);
        assert(result.success, "Bulunamadı");
        assert(result.data!.data!.plateNumber === TEST_PLATE, "Veri hatalı");
    });

    // --- 5. GET BY CUSTOMER ID ---
    await runTest("getByCustomerId", async () => {
        const result = await service.getByCustomerId(TEST_CUST_ID);
        assert(result.success, "Hata döndü");
        assert(Array.isArray(result.data!.data), "Liste dönmeliydi");
        assert(result.data!.data!.length > 0, "Liste boş");
    });

    // --- 6. GET BY BRAND ID ---
    await runTest("getByBrandId", async () => {
        const result = await service.getByBrandId(TEST_BRAND_ID);
        assert(result.success, "Hata döndü");
        assert(result.data!.data![0].brandId === TEST_BRAND_ID, "Marka ID hatalı");
    });

    // --- 7. GET BY YEAR ---
    await runTest("getByYear", async () => {
        const result = await service.getByYear(2023);
        assert(result.success, "Hata döndü");
        assert(result.data!.data![0].year === 2023, "Yıl hatalı");
    });

    // --- 8. GET BY FUEL TYPE ---
    await runTest("getByFuelType", async () => {
        const result = await service.getByFuelType(1);
        assert(result.data!.data!.length > 0, "Yakıt tipi bulunamadı");
    });

    // --- 9. GET BY BODY TYPE ---
    await runTest("getByBodyType", async () => {
        const result = await service.getByBodyType(2);
        assert(result.data!.data!.length > 0, "Kasa tipi bulunamadı");
    });

    // --- 10. GET ALL ---
    await runTest("getAllCar", async () => {
        const result = await service.getAllCar();
        assert(result.data!.data!.length > 0, "Tüm araç listesi boş");
    });

    // --- 11. OLD CUSTOMER CREATE ---
    await runTest("createOldCustomer", async () => {
        const oldCustId = 999;
        const result = await service.createOldCustomer(createdCarId, oldCustId);
        assert(result.success, "Eski sahip eklenemedi");
    });

    // --- 12. OLD CUSTOMER GET ---
    await runTest("getOldCustomers", async () => {
        const result = await service.getOldCustomers(createdCarId);
        assert(result.success, "Eski sahipler getirilemedi");
        assert(result.data!.data![0].oldCustomerId === 999, "Veri hatalı");
    });

    // --- 13. DELETE ---
    await runTest("deleteCar", async () => {
        const result = await service.deleteCar(createdCarId);
        assert(result.success, "Silme başarısız");

        // Silindiğini doğrula (getByVinNumber hata dönmeli)
        const check = await service.getByVinNumber(TEST_VIN);
        assert(check.success === false, "Araç silinmesine rağmen hala bulunuyor!");
    });

    console.log("\n" + "=".repeat(80));
    console.log("✅ TÜM TESTLER BAŞARIYLA TAMAMLANDI.");
}

main();