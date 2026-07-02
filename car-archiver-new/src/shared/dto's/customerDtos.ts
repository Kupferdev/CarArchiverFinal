// src/shared/dtos/customer.dtos.ts

// Yardımcı Alt Tipler
export interface EmailInput {
  address: string;
  type?: string; // Örn: "personal", "work" (Opsiyonel)
}

export interface PhoneInput {
  number: string;
  countryCode: string; // Örn: "+90"
  type?: string;       // Örn: "mobile", "office" (Opsiyonel)
}

// 1. Müşteri Oluşturma İsteği (Request)
export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  nationalId: string;
  
  // Artık dizi olarak geliyorlar
  emails?: EmailInput[]; 
  phones?: PhoneInput[];
}

// 2. Müşteri Görüntüleme (View)
export interface CustomerViewDto {
  id: number;
  fullName: string;
  nationalId?: string; // Bu satırı ekle
  taxNumber?: string;  // Havada kalan arkadaşı buraya ekle
  phones?: { countryCode: string; number: string }[];
  emails?: { address: string }[];
}