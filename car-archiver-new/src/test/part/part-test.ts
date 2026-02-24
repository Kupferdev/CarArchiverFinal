// Gerekli importlar (Dosya yollarını projene göre düzenle)
import { faker } from '@faker-js/faker';
import { PartsRepository } from "../../../src/main/data/drizzle/repositories/partsRepository";
import { PartService } from "../../services/partService";
import { Part } from "../../shared/types/part";

// Renkli ve düzenli loglama için yardımcı fonksiyon
const logStep = (step: string, data: any) => {
    console.log(`\n🔹 --- ${step} ---`);
    console.dir(data, { depth: null, colors: true });
};

async function main() {
    console.log("🚀 PartService Test Simülasyonu Başlıyor...\n");

    // 1. Dependency Injection (Repository'i Servise veriyoruz)
    const partsRepo = new PartsRepository();
    const partService = new PartService(partsRepo);

    // --- TEST VERİSİ HAZIRLIĞI ---
    // NOT: Bu ID'lerin veritabanında gerçekten var olması lazım (Cars ve Services tablolarında)
    const TEST_CAR_ID = 1; 
    const TEST_SERVICE_ID = 1;

    // Faker ile rastgele 3 parça oluşturuyoruz
    const mockParts: Part[] = Array.from({ length: 30 }).map(() => ({
        carId: TEST_CAR_ID,
        serviceId: TEST_SERVICE_ID,
        partName: faker.vehicle.type(), // Örn: "Alternator", "Brake Pad"
        partPrice: parseFloat(faker.commerce.price({ min: 100, max: 5000, dec: 2 })), // String gelir, float yapıyoruz
        partTax: 20 // %20 KDV
    }));

    console.log(`📦 ${mockParts.length} adet sahte parça verisi oluşturuldu.`);

    try {
        // --- 1. CREATE TESTİ (Toplu Ekleme) ---
        const createRes = await partService.createParts(mockParts);
        logStep("1. CREATE SONUCU", createRes);

        if (!createRes.success || !createRes.data || createRes.data.length === 0) {
            console.error("❌ Parçalar eklenemediği için test durduruldu.");
            return;
        }

        // Testlere devam etmek için eklenen parçalardan ilkini seçiyoruz
        // createParts metodu 'addedParts' yani 'Part[]' döndüğü için data[0] bize objeyi verir.
        const testPart = createRes.data[0]; 
        
        console.log(`👉 Teste ID'si ${testPart.partId} olan '${testPart.partName}' parçası ile devam ediliyor...`);


        // --- 2. READ TESTİ (GetByCarId) ---
        const getRes = await partService.getByCarId(TEST_CAR_ID);
        logStep(`2. GET (CarID: ${TEST_CAR_ID}) SONUCU`, {
            success: getRes.success,
            message: getRes.message,
            totalCount: getRes.data?.length, // Konsolu boğmamak için sadece sayısını yazdırıyoruz
            firstItem: getRes.data?.[0]
        });


        // --- 3. UPDATE TESTİ ---
        if (testPart.partId) {
            // Veriyi değiştiriyoruz
            const updatedPartData: Part = {
                ...testPart,
                partName: `${testPart.partName} (GÜNCELLENDİ)`,
                partPrice: 9999.99
            };

            const updateRes = await partService.updatePart(updatedPartData);
            logStep("3. UPDATE SONUCU", updateRes);
        }


        // --- 4. DELETE TESTİ ---
        if (testPart.partId) {
            const deleteRes = await partService.deletePart(testPart.partId);
            logStep("4. DELETE SONUCU", deleteRes);
        }

    } catch (error) {
        console.error("🔥 BEKLENMEYEN SİSTEM HATASI:", error);
    }
}

// Testi çalıştır
main();