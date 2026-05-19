import { Brand } from "../../../../shared/types/brand";
import { useDb } from "../../drizzle/drizzleDb";
import { Brands } from "../../drizzle/schemas/brandsSchema";
import { getDb } from "../../db";

const baseCarBrands: Array<Brand> = [
  { brandName: "Abarth" },
  { brandName: "Acura" },
  { brandName: "Aixam" },
  { brandName: "Alfa Romeo" },
  { brandName: "Alpine" },
  { brandName: "Ariel" },
  { brandName: "Aston Martin" },
  { brandName: "Audi" },
  { brandName: "BAC (Briggs Automotive Company)" },
  { brandName: "Bentley" },
  { brandName: "BMW" },
  { brandName: "Bugatti" },
  { brandName: "Buick" },
  { brandName: "BYD" },
  { brandName: "Cadillac" },
  { brandName: "Caterham" },
  { brandName: "Changan" },
  { brandName: "Chery" },
  { brandName: "Chevrolet" },
  { brandName: "Chrysler" },
  { brandName: "Citroën" },
  { brandName: "Cupra" },
  { brandName: "Dacia" },
  { brandName: "Daewoo" },
  { brandName: "Daihatsu" },
  { brandName: "Datsun" },
  { brandName: "DeLorean" },
  { brandName: "Dodge" },
  { brandName: "Dongfeng" },
  { brandName: "DS Automobiles" },
  { brandName: "Eunos" },
  { brandName: "FAW" },
  { brandName: "Ferrari" },
  { brandName: "Fiat" },
  { brandName: "Fisker" },
  { brandName: "Ford" },
  { brandName: "Geely" },
  { brandName: "Genesis" },
  { brandName: "GMC" },
  { brandName: "Great Wall (GWM)" },
  { brandName: "Haval" },
  { brandName: "Holden" },
  { brandName: "Honda" },
  { brandName: "Hummer" },
  { brandName: "Hyundai" },
  { brandName: "Infiniti" },
  { brandName: "Isuzu" },
  { brandName: "Jaguar" },
  { brandName: "Jeep" },
  { brandName: "KGM (SsangYong)" },
  { brandName: "Kia" },
  { brandName: "Koenigsegg" },
  { brandName: "Lada" },
  { brandName: "Lamborghini" },
  { brandName: "Lancia" },
  { brandName: "Land Rover" },
  { brandName: "Lexus" },
  { brandName: "Li Auto" },
  { brandName: "Lincoln" },
  { brandName: "Lotus" },
  { brandName: "Lucid" },
  { brandName: "Lynk & Co" },
  { brandName: "Mahindra" },
  { brandName: "Maserati" },
  { brandName: "Maybach" },
  { brandName: "Mazda" },
  { brandName: "McLaren" },
  { brandName: "Mercedes-Benz" },
  { brandName: "MG" },
  { brandName: "Mini" },
  { brandName: "Mitsubishi" },
  { brandName: "Morgan" },
  { brandName: "Nio" },
  { brandName: "Nissan" },
  { brandName: "Oldsmobile" },
  { brandName: "Opel" },
  { brandName: "Pagani" },
  { brandName: "Perodua" },
  { brandName: "Peugeot" },
  { brandName: "Pininfarina" },
  { brandName: "Plymouth" },
  { brandName: "Polestar" },
  { brandName: "Pontiac" },
  { brandName: "Porsche" },
  { brandName: "Proton" },
  { brandName: "Ram" },
  { brandName: "Renault" },
  { brandName: "Rimac" },
  { brandName: "Rivian" },
  { brandName: "Rolls-Royce" },
  { brandName: "Saab" },
  { brandName: "Saturn" },
  { brandName: "Scania" },
  { brandName: "Scion" },
  { brandName: "SEAT" },
  { brandName: "Skoda" },
  { brandName: "Smart" },
  { brandName: "Spyker" },
  { brandName: "Subaru" },
  { brandName: "Suzuki" },
  { brandName: "Tata Motors" },
  { brandName: "Tesla" },
  { brandName: "Toyota" },
  { brandName: "Vanderhall" },
  { brandName: "Vauxhall" },
  { brandName: "VinFast" },
  { brandName: "Volkswagen" },
  { brandName: "Volvo" },
  { brandName: "Wiesmann" },
  { brandName: "Wuling" },
  { brandName: "XPeng" },
  { brandName: "Zagato" },
  { brandName: "Zeekr" },
  { brandName: "Zenvo" },
];

export async function createBrandsTable() {
  const db = getDb();
  const orm = useDb();

  const createBrandsTableSql = `
    CREATE TABLE IF NOT EXISTS Brands(
      brandId   INTEGER PRIMARY KEY AUTOINCREMENT,
      brandName TEXT    NOT NULL UNIQUE
    )
  `;

  try {
    db.exec(createBrandsTableSql);
    console.log("❇️ Brands table created.");

    await orm.insert(Brands).values(baseCarBrands).onConflictDoNothing();
    console.log("❇️ Base brands seeded.");
  } catch (err) {
    console.error("🆘 Brands table creation failed:", (err as Error).message);
    throw err;
  }
}