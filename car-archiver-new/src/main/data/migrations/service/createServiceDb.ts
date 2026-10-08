import { getDb } from "../../db";


export function createServicesTable() {

    const db = getDb();

    const createServicesTableSql = `
        CREATE TABLE IF NOT EXISTS Services(
            serviceId INTEGER PRIMARY KEY AUTOINCREMENT,
            carId INTEGER NOT NULL,
            customerId INTEGER NULL,
            applicationDate DATETIME NULL,
            appointmentDate DATETIME NULL,
            jobDuration INTEGER NULL,
            deliveryDate DATETIME NULL,
            km REAL NULL,
            complaints TEXT NOT NULL,
            extraRequests TEXT NULL,
            faults JSON NULL,
            hasDamageOnReceive BOOLEAN NOT NULL,
            damageOnReceive JSON NULL,
            hasDamageDuringRepair BOOLEAN NULL,
            damageDuringRepair JSON NULL,
            laborCharge REAL NULL,
            totalCharge REAL NULL,
            targetDeliveryDate DATETIME NULL,
            isDelivered BOOLEAN NULL,
            FOREIGN KEY (carId) REFERENCES Cars(carId) ON DELETE CASCADE,
            FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE SET NULL
        )
    `;


    try{
        db.exec(createServicesTableSql);
        console.log("❇️ Services table created");
    }catch(err){
        console.log("🆘 Services table not created", (err as Error).message);
        throw err;
    }

}

