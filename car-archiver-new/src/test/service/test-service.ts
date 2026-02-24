import { faker, vi } from "@faker-js/faker";
import { ServiceService } from "../../services/serviceService";
import { Service } from "../../shared/types/service";
import { ServicesRepository } from "../../main/data/drizzle/repositories/servicesRepository";


function assert(cond: any, msg: string) {
  if (!cond) {
    console.error("❌ Test Failed:", msg);
    process.exit(1);
  }
}

function fakeService(): Service {
  return {
    carId: faker.number.int({ min: 1, max: 999 }),
    customerId: faker.number.int({ min: 1, max: 999 }),
    applicationDate: faker.date.past(),
    appointmentDate: faker.date.soon(),
    jobDuration: faker.date.soon(),
    complaints: faker.lorem.words(3),
    faults: [faker.lorem.word()],
    hasDamageOnReceive: false,
  };
}

async function runTests() {
  console.log("🚀 ServiceService Testleri Çalışıyor...\n");

  const repo = new ServicesRepository();
  const service = new ServiceService(repo);

  // CREATE
  console.log("➡ createService test ediliyor...");
  const s1 = fakeService();
  const createRes = await service.createService(s1);

  assert(createRes.status === "success", "createService success dönmedi");
  assert(createRes.data!, "createService data null geldi");
  assert(createRes.data!.data!.serviceId, "serviceId gelmedi");

  const createdId = createRes.data!.data!.serviceId!;
  console.log(`   ✅ createService OK (ID: ${createdId})`);

  // UPDATE
  console.log("➡ updateService test ediliyor...");
  const updateRes = await service.updateService(
    createdId,
    { complaints: "updated complaint", carId: s1.carId } as any
  );

  assert(updateRes.status === "success", "updateService success dönmedi");
  assert(updateRes.data!.data!.complaints === "updated complaint", "Update olmadı");
  console.log("   ✅ updateService OK");

  // GET BY CAR
  console.log("➡ getByCarId test ediliyor...");
  const getCar = await service.getByCarId(s1.carId);

  assert(getCar.status === "success", "getByCarId success dönmedi");
  assert(getCar.data!.data!.length > 0, "getByCarId boş döndü");
  console.log("   ✅ getByCarId OK");

  // GET BY CUSTOMER
  console.log("➡ getByCustomerId test ediliyor...");
  const getCust = await service.getByCustomerId(s1.customerId!);

  assert(getCust.status === "success", "getByCustomerId success dönmedi");
  assert(getCust.data!.data!.length > 0, "getByCustomerId boş döndü");
  console.log("   ✅ getByCustomerId OK");

  // DELETE
  console.log("➡ deleteService test ediliyor...");
  const delRes = await service.deleteService(createdId);

  assert(delRes.status === "success", "deleteService success dönmedi");
  console.log("   ✅ deleteService OK");

  console.log("\n🔥 Tüm testler başarıyla geçti!");
}

runTests().catch((err) => {
  console.error("💥 Test script çöktü:", err);
  process.exit(1);
});