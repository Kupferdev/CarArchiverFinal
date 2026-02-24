// response.model.ts

// 1. Durum Enum'ı (Aynen kalabilir, Validation eklendi)
export enum ResponseStatus {
  SUCCESS = "success",
  FAIL = "fail",       // İş kuralı hatası (örn: bakiye yetersiz)
  ERROR = "error",     // Sistem hatası (örn: db bağlantı koptu)
  VALIDATION_ERROR = "validation_error" // Form validasyon hatası
}

// 2. Validasyon Hatası Tipi
export interface ValidationError {
  field: string;
  message: string;
}

// 3. Sayfalama Metadatası
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

// 4. Ana Response Interface'i
export interface IApiResponse<T = any> {
  success: boolean;
  status: ResponseStatus;
  message: string;
  code?: string;           // i18n veya frontend mantığı için (örn: 'USER_NOT_FOUND')
  data?: T;
  validationErrors?: ValidationError[]; // Hangi alanlarda hata var?
  meta?: PaginationMeta;   // Liste dönüyorsak sayfalama bilgisi
}

// 5. Helper Class (Factory Pattern) - .NET'teki gibi temiz kullanım için
export class ServiceResponse {
  
  // Başarılı Tekil Veri
  static success<T>(data: T, message: string = "Operation successful"): IApiResponse<T> {
    return {
      success: true,
      status: ResponseStatus.SUCCESS,
      message,
      data
    };
  }

  // Başarılı Liste (Sayfalamalı)
  static successPaginated<T>(
    data: T[], 
    totalRecords: number, 
    page: number, 
    pageSize: number,
    message: string = "List fetched successfully"
  ): IApiResponse<T[]> {
    return {
      success: true,
      status: ResponseStatus.SUCCESS,
      message,
      data,
      meta: {
        page,
        pageSize,
        totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize)
      }
    };
  }

  // İş Kuralı Hatası (Örn: "Stok yetersiz")
  static fail(message: string, code?: string): IApiResponse<null> {
    return {
      success: false,
      status: ResponseStatus.FAIL,
      message,
      code
    };
  }

  // Sistem Hatası (Try-Catch blokları için)
  static error(error: any, message: string = "An unexpected error occurred"): IApiResponse<null> {
    console.error("System Error:", error); // Loglama burada yapılır
    return {
      success: false,
      status: ResponseStatus.ERROR,
      message: message + (error.message ? `: ${error.message}` : ''),
      data: null // Error detayını güvenlik için data'ya koymuyoruz, logluyoruz.
    };
  }

  // Validasyon Hatası (Formlar için)
  static validationError(errors: ValidationError[], message: string = "Validation failed"): IApiResponse<null> {
    return {
      success: false,
      status: ResponseStatus.VALIDATION_ERROR,
      message,
      validationErrors: errors
    };
  }
}
