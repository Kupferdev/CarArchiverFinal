import { CustomerService } from "../../services/customerService"; // BURAYI KENDİ DOSYA YOLUNA GÖRE DÜZELT
// Eğer service dosyan "src" içindeyse yukarıdaki gibi, değilse ona göre ayarla.
import { faker } from '@faker-js/faker';

// --- BASİT TEST YARDIMCILARI (Frameworksüz) ---
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

function logPass(message: string) {
    console.log(`${colors.green}✅ BAŞARILI: ${message}${colors.reset}`);
}

function logFail(message: string, error?: any) {
    console.error(`${colors.red}❌ HATA: ${message}${colors.reset}`);
    if (error) console.error(error);
}

function logSection(title: string) {
    console.log(`\n${colors.blue}=== ${title} ===${colors.reset}`);
}

// --- MOCK (SAHTE) REPOSITORY SINIFLARI ---
// Jest kullanmadığımız için manuel mock objeleri oluşturuyoruz.

class MockCustomerRepo {
    // Test senaryosuna göre bu değerleri değiştireceğiz
    shouldFail = false; 
    returnData: any = {};

    async create(data: any) {
        if (this.shouldFail) return { success: false, message: "DB Error" };
        return { success: true, data: { customerId: faker.number.int({ min: 1, max: 1000 }), ...data } };
    }
    async update(id: number, data: any) {
        if (this.shouldFail) return { success: false, message: "Update Error" };
        return { success: true, message: "Updated successfully" };
    }
    async delete(id: number) {
        if (this.shouldFail) return { success: false, message: "Delete Error" };
        return { success: true, message: "Deleted successfully" };
    }
    async getAll() {
        if (this.shouldFail) return { success: false, message: "Fetch Error" };
        return { success: true, data: this.returnData };
    }
    async getByNatId(natId: string) {
        if (this.shouldFail) return { success: false, message: "Not Found" };
        return { success: true, data: { natId, name: faker.person.fullName() }, message: "Found" };
    }
    async getByNameSurname(first: string, last: string) {
        return { success: true, message: "Found" };
    }
}

class MockPhoneRepo {
    async create(data: any) { return { success: true }; }
}

class MockEmailRepo {
    async create(data: any) { return { success: true }; }
}

// --- TEST SENARYOLARI ---

async function runTests() {
    console.log(`${colors.yellow}🚀 Testler Başlatılıyor (npx tsx modu)...${colors.reset}`);

    // Hazırlık
    const mockCustomerRepo = new MockCustomerRepo();
    const mockPhoneRepo = new MockPhoneRepo();
    const mockEmailRepo = new MockEmailRepo();

    // Servisi oluştur (Tip hatalarını yoksaymak için 'as any' kullanıyoruz çünkü tam repo implementasyonu değil)
    const service = new CustomerService(
        mockCustomerRepo as any, 
        mockPhoneRepo as any, 
        mockEmailRepo as any
    );

    // ---------------------------------------------------------
    // TEST 1: Müşteri Oluşturma (Başarılı)
    // ---------------------------------------------------------
    logSection("TEST 1: Create Customer (Success)");
    try {
        const fakeCustomer = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            nationalId: faker.string.numeric(11)
        };
        const phones = [{ number: faker.phone.number() }];
        const emails = [{ address: faker.internet.email() }];

        mockCustomerRepo.shouldFail = false; // Başarılı olmalı
        
        const result = await service.createCustomer(fakeCustomer as any, phones as any, emails as any);

        if (result.success && result.data) {
            logPass(`Müşteri oluşturuldu. ID: ${result.data}`);
        } else {
            logFail("Müşteri oluşturulamadı!", result);
        }
    } catch (e) { logFail("Exception oluştu", e); }

    // ---------------------------------------------------------
    // TEST 2: Müşteri Oluşturma (Repo Hatası)
    // ---------------------------------------------------------
    logSection("TEST 2: Create Customer (DB Failure)");
    try {
        mockCustomerRepo.shouldFail = true; // Hata simüle et
        
        const result = await service.createCustomer({ name: "Test" } as any);

        if (!result.success) {
            logPass(`Beklendiği gibi hata alındı: ${result.message}`);
        } else {
            logFail("Hata alması gerekirken başarılı oldu!");
        }
    } catch (e) { logFail("Exception", e); }

    // ---------------------------------------------------------
    // TEST 3: Müşteri Güncelleme
    // ---------------------------------------------------------
    logSection("TEST 3: Update Customer");
    try {
        mockCustomerRepo.shouldFail = false;
        const result = await service.updateCustomer(123, { firstName: "Update" } as any);

        if (result.success) {
            logPass("Güncelleme başarılı.");
        } else {
            logFail("Güncelleme başarısız.", result);
        }
    } catch (e) { logFail("Exception", e); }

    // ---------------------------------------------------------
    // TEST 4: Müşteri Silme (ID yoksa hata fırlatmalı)
    // ---------------------------------------------------------
    logSection("TEST 4: Delete Customer (Validation Error)");
    try {
        // @ts-ignore: Null gönderip hatayı yakalayacağız
        await service.deleteCustomer(null);
        logFail("ID null olmasına rağmen hata fırlatmadı!");
    } catch (e: any) {
        if (e.message.includes("CustomerId value is null")) {
            logPass("Beklenen 'CustomerId value is null' hatası yakalandı.");
        } else {
            logFail(`Yanlış hata mesajı: ${e.message}`);
        }
    }

    // ---------------------------------------------------------
    // TEST 5: Tüm Müşterileri Getir (Dolu)
    // ---------------------------------------------------------
    logSection("TEST 5: Get All Customers");
    try {
        mockCustomerRepo.shouldFail = false;
        // Mock veri ayarla
        mockCustomerRepo.returnData = [
            { id: 1, name: faker.person.fullName() },
            { id: 2, name: faker.person.fullName() }
        ];

        const result = await service.getAllCustomer();

        if (result.success && Array.isArray(result.data) && result.data.length === 2) {
            logPass(`${result.data.length} adet müşteri başarıyla çekildi.`);
        } else {
            logFail("Müşteri listesi çekilemedi veya sayı yanlış.", result);
        }
    } catch (e) { logFail("Exception", e); }
    
     // ---------------------------------------------------------
    // TEST 6: NatId ile Getir (Faker kullanımı)
    // ---------------------------------------------------------
    logSection("TEST 6: Get By NatId");
    try {
        const randomTc = faker.string.numeric(11);
        mockCustomerRepo.shouldFail = false;
        
        const result = await service.getByNatId(randomTc);
        
        if(result.success) {
             logPass(`TC No (${randomTc}) ile sorgulama başarılı.`);
        } else {
            logFail("TC No sorgulama başarısız.");
        }

    } catch (e) { logFail("Exception", e); }

    console.log(`\n${colors.yellow}🏁 Test Tamamlandı.${colors.reset}`);
}

// Testleri Başlat
runTests();