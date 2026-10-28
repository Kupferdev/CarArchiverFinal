export interface DashboardInfo {
  id: number;
  languageCode: string;

  // Topbar
  searchPlaceholder: string;

  // Tabbar
  tabCars: string;

  // Main Content (Cards)
  cardServiceRecordsTitle: string;
  cardServiceRecordsStat: string;
  cardServiceRecordsUnit: string;

  cardCustomersTitle: string;
  cardCustomersStat: string;
  cardCustomersUnit: string;

  cardCarsTitle: string;
  cardCarsStat: string;
  cardCarsUnit: string;

  // Right Panel
  rightPanelUpcoming: string;
  rightPanelSeeAll: string;
  rightPanelApproaching: string;

  // FAB Menu
  fabNewService: string;
  fabNewCustomer: string;
  fabNewCar: string;

  carListTitle?: string;
  carSearchPlaceholder?: string;
  carNewTitle?: string;
  carNewButton?: string;
  carEditTitle?: string;
  carProfileTitle?: string;
  carFormSubtitle?: string;
  carBasicSection?: string;
  carIdentitySection?: string;
  carBrand?: string;
  carModel?: string;
  carYear?: string;
  carPlate?: string;
  carVin?: string;
  carKm?: string;
  carCustomer?: string;
  carCustomerSearch?: string;
  carCustomerNotFound?: string;
  carPlateRequired?: string;
  carModelPlaceholder?: string;
  carPlatePlaceholder?: string;
  carVinPlaceholder?: string;
  carKmPlaceholder?: string;
  carYearSelect?: string;
  carYearPlaceholder?: string;
  carFuelType?: string;
  carFuelTypeSelect?: string;
  carTechnicalSection?: string;
  carBodyType?: string;
  carBodyTypeSelect?: string;
  carEngineVolume?: string;
  carEngineVolumePlaceholder?: string;
  carNotes?: string;
  carNotesPlaceholder?: string;
  carOldCustomers?: string;
  carOldCustomersHint?: string;
  carAddOldCustomer?: string;
  carRemoveOldCustomer?: string;
  carNoOldCustomers?: string;
  carOldCustomerAdded?: string;
  carOldCustomerRemoved?: string;
  carCustomerChangeTitle?: string;
  carAddPreviousCustomerToHistory?: string;
  carCustomerChangeContinue?: string;
  carUpdatedWithHistory?: string;
  carNoCustomer?: string;
  carBrandSelect?: string;
  brandNew?: string;
  brandNewPlaceholder?: string;
  brandAdd?: string;
  brandAdded?: string;
  carBrandRequired?: string;
  carModelRequired?: string;
  carCreate?: string;
  carSaveChanges?: string;
  carCreated?: string;
  carUpdated?: string;
  carDeleted?: string;
  carDeleteConfirm?: string;
  carNoRecords?: string;
  carLoading?: string;
  carSaving?: string;
  carNotFound?: string;
  carView?: string;
  carEdit?: string;
  carDelete?: string;
  carActions?: string;
  cancel?: string;
  carUnexpectedError?: string;
  carCurrentUser?: string;
  carCurrentUserHint?: string;
  carCurrentUserBadge?: string;
  carOldUsers?: string;
  carOldUsersProfileHint?: string;
  carNoCurrentUser?: string;
  carNoOldUsersProfile?: string;
  carNoContactInfo?: string;
  carServiceHistory?: string;
  carNoServiceHistory?: string;
  serviceListTitle?: string;
  serviceDate?: string;
  servicePlate?: string;
  serviceSearchPlaceholder?: string;
  serviceNewTitle?: string;
  serviceNewButton?: string;
  serviceEditTitle?: string;
  serviceProfileTitle?: string;
  serviceBasicSection?: string;
  serviceComplaintSection?: string;
  serviceDamageSection?: string;
  serviceFinancialSection?: string;
  servicePartsSection?: string;
  serviceStatusSection?: string;
  serviceCar?: string;
  serviceCarSelect?: string;
  serviceCustomer?: string;
  serviceNoCustomer?: string;
  serviceApplicationDate?: string;
  serviceAppointmentDate?: string;
  serviceDeliveryDate?: string;
  serviceTargetDelivery?: string;
  serviceJobDuration?: string;
  serviceKm?: string;
  serviceComplaints?: string;
  serviceComplaintRequired?: string;
  serviceEditShort?: string;
  serviceNewShort?: string;
  serviceCarSearchPlaceholder?: string;
  serviceNoCarMatch?: string;
  serviceExtraRequests?: string;
  serviceFaults?: string;
  serviceOnePerLine?: string;
  serviceDamageOnReceive?: string;
  serviceDamageDuringRepair?: string;
  serviceLaborCharge?: string;
  serviceTotalCharge?: string;
  serviceDelivered?: string;
  serviceYes?: string;
  serviceNo?: string;
  serviceAddPart?: string;
  servicePartName?: string;
  servicePartQuantity?: string;
  servicePartTotal?: string;
  servicePartInvalid?: string;
  servicePartsSum?: string;
  servicePartPrice?: string;
  serviceNoParts?: string;
  serviceCreate?: string;
  serviceSaveChanges?: string;
  serviceSaving?: string;
  serviceCreated?: string;
  serviceUpdated?: string;
  serviceDeleted?: string;
  serviceDelete?: string;
  serviceDeleteConfirm?: string;
  serviceView?: string;
  serviceActions?: string;
  serviceLoading?: string;
  serviceNotFound?: string;
  serviceNoRecords?: string;
  serviceCarRequired?: string;
  serviceUnexpectedError?: string;
}

export const DashboardInfoTexts: Array<DashboardInfo> = [
  {
    id: 1,
    languageCode: "en",
    searchPlaceholder: "Search by plate, customer name or VIN...",
    tabCars: "Cars",
    cardServiceRecordsTitle: "Service records",
    cardServiceRecordsStat: "Total records",
    cardServiceRecordsUnit: "services",
    cardCustomersTitle: "Customers",
    cardCustomersStat: "Registered customers",
    cardCustomersUnit: "people",
    cardCarsTitle: "Cars",
    cardCarsStat: "Registered cars",
    cardCarsUnit: "vehicles",
    rightPanelUpcoming: "Upcoming appointments",
    rightPanelSeeAll: "see all →",
    rightPanelApproaching: "Approaching delivery",
    fabNewService: "New service record",
    fabNewCustomer: "New customer",
    fabNewCar: "New car",
    serviceEditShort: "Edit", serviceNewShort: "New service", serviceCarSearchPlaceholder: "Search by plate, make, model or customer...", serviceNoCarMatch: "No matching vehicles.", serviceListTitle: "Service records", serviceDate: "Date", servicePlate: "Plate", serviceSearchPlaceholder: "Search by plate, customer, complaint or VIN...", serviceNewTitle: "New service record", serviceNewButton: "New service", serviceEditTitle: "Edit service record", serviceProfileTitle: "Service record", serviceBasicSection: "Service information", serviceComplaintSection: "Service notes", serviceDamageSection: "Damage and inspection", serviceFinancialSection: "Delivery and charges", servicePartsSection: "Used parts", serviceStatusSection: "Status", serviceCar: "Vehicle", serviceCarSelect: "Select a vehicle", serviceCustomer: "Customer", serviceNoCustomer: "No customer", serviceApplicationDate: "Application date", serviceAppointmentDate: "Appointment date", serviceDeliveryDate: "Delivery date", serviceTargetDelivery: "Target delivery", serviceJobDuration: "Job duration (min)", serviceKm: "Mileage", serviceComplaints: "Complaints", serviceComplaintRequired: "Please enter the customer complaint.", serviceExtraRequests: "Extra requests", serviceFaults: "Faults", serviceOnePerLine: "One item per line", serviceDamageOnReceive: "Damage on arrival", serviceDamageDuringRepair: "Damage during repair", serviceLaborCharge: "Labor charge", serviceTotalCharge: "Total charge", serviceDelivered: "Delivered", serviceYes: "Yes", serviceNo: "No", serviceAddPart: "Add part", servicePartName: "Part name", servicePartQuantity: "Quantity", servicePartPrice: "Unit price", servicePartTotal: "Row total", servicePartInvalid: "Check part name, quantity and unit price.", servicePartsSum: "Parts total", serviceNoParts: "No parts recorded for this service.", serviceCreate: "Save service", serviceSaveChanges: "Save changes", serviceSaving: "Saving...", serviceCreated: "Service record created.", serviceUpdated: "Service record updated.", serviceDeleted: "Service record deleted.", serviceDelete: "Delete", serviceDeleteConfirm: "Delete this service record and its changed-part records?", serviceView: "View", serviceActions: "Actions", serviceLoading: "Loading...", serviceNotFound: "Service record not found.", serviceNoRecords: "No service records found.", serviceCarRequired: "Please select a vehicle.", serviceUnexpectedError: "An unexpected error occurred.",
    carListTitle: "Car list", carSearchPlaceholder: "Search by plate, VIN, model or customer...", carNewTitle: "New car", carNewButton: "New car", carEditTitle: "Edit car", carProfileTitle: "Car profile", carFormSubtitle: "Record the vehicle information used in service history.", carBasicSection: "Basic information", carIdentitySection: "Vehicle identification", carBrand: "Brand", carModel: "Model", carYear: "Year", carPlate: "Plate", carVin: "VIN", carKm: "Mileage", carCustomer: "Customer", carCustomerSearch: "Search customers...", carCustomerNotFound: "No customer found.", carNoCustomer: "No customer", carBrandSelect: "Select a brand", brandNew: "New brand", brandNewPlaceholder: "Ford", brandAdd: "Add", brandAdded: "Brand saved.", carPlateRequired: "Please enter a plate number.", carModelPlaceholder: "Fiesta", carPlatePlaceholder: "", carVinPlaceholder: "WF0...", carKmPlaceholder: "180000", carYearSelect: "Select a year", carYearPlaceholder: "1997", carTechnicalSection: "Technical information", carFuelType: "Fuel type", carFuelTypeSelect: "Select fuel type", carBodyType: "Body type", carBodyTypeSelect: "Select body type", carEngineVolume: "Engine displacement", carEngineVolumePlaceholder: "1398", carNotes: "Notes", carNotesPlaceholder: "Triger kayışı 165.000 km'de değiştirildi...", carOldCustomers: "Previous users", carOldCustomersHint: "Users previously linked to this vehicle.", carAddOldCustomer: "Add previous user", carRemoveOldCustomer: "Remove previous user", carNoOldCustomers: "No previous users.", carOldCustomerAdded: "Previous user added.", carOldCustomerRemoved: "Previous user removed.", carCustomerChangeTitle: "Move {{previous}} to previous users and assign this vehicle to {{next}}?", carAddPreviousCustomerToHistory: "Add the previous user to this vehicle's previous user list.", carCustomerChangeContinue: "Continue", carBrandRequired: "Please select a brand.", carModelRequired: "Please enter a model.", carCreate: "Save car", carSaveChanges: "Save changes", carCreated: "Car created.", carUpdated: "Car updated.", carUpdatedWithHistory: "Car updated. Previous user moved to history.", carDeleted: "Car deleted.", carDeleteConfirm: "Delete this car? Its related service records may also be affected.", carNoRecords: "No cars found.", carLoading: "Loading...", carSaving: "Saving...", carNotFound: "Car not found.", carView: "View", carEdit: "Edit", carDelete: "Delete", carActions: "Actions", cancel: "Cancel", carUnexpectedError: "An unexpected error occurred.", carCurrentUser: "User", carCurrentUserHint: "The customer currently linked to this vehicle.", carCurrentUserBadge: "Current user", carOldUsers: "Previous users", carOldUsersProfileHint: "Customers previously linked to this vehicle.", carNoCurrentUser: "No current user is linked to this vehicle.", carNoOldUsersProfile: "No previous users recorded.", carNoContactInfo: "No contact information", carServiceHistory: "Service history", carNoServiceHistory: "No service records have been added for this vehicle yet."
  },
  {
    id: 2,
    languageCode: "es",
    searchPlaceholder: "Buscar por matrícula, nombre del cliente o VIN...",
    tabCars: "Coches",
    cardServiceRecordsTitle: "Registros de servicio",
    cardServiceRecordsStat: "Registros totales",
    cardServiceRecordsUnit: "servicios",
    cardCustomersTitle: "Clientes",
    cardCustomersStat: "Clientes registrados",
    cardCustomersUnit: "personas",
    cardCarsTitle: "Coches",
    cardCarsStat: "Coches registrados",
    cardCarsUnit: "vehículos",
    rightPanelUpcoming: "Próximas citas",
    rightPanelSeeAll: "ver todo →",
    rightPanelApproaching: "Entrega próxima",
    fabNewService: "Nuevo registro de servicio",
    fabNewCustomer: "Nuevo cliente",
    fabNewCar: "Nuevo coche"
  },
  {
    id: 3,
    languageCode: "fr",
    searchPlaceholder: "Rechercher par plaque, nom de client ou VIN...",
    tabCars: "Voitures",
    cardServiceRecordsTitle: "Carnets d'entretien",
    cardServiceRecordsStat: "Total des enregistrements",
    cardServiceRecordsUnit: "services",
    cardCustomersTitle: "Clients",
    cardCustomersStat: "Clients enregistrés",
    cardCustomersUnit: "personnes",
    cardCarsTitle: "Voitures",
    cardCarsStat: "Voitures enregistrées",
    cardCarsUnit: "véhicules",
    rightPanelUpcoming: "Prochains rendez-vous",
    rightPanelSeeAll: "tout voir →",
    rightPanelApproaching: "Livraison imminente",
    fabNewService: "Nouvel enregistrement de service",
    fabNewCustomer: "Nouveau client",
    fabNewCar: "Nouvelle voiture"
  },
  {
    id: 4,
    languageCode: "de",
    searchPlaceholder: "Suche nach Kennzeichen, Kundenname oder Fahrgestellnummer...",
    tabCars: "Autos",
    cardServiceRecordsTitle: "Serviceberichte",
    cardServiceRecordsStat: "Gesamteinträge",
    cardServiceRecordsUnit: "Services",
    cardCustomersTitle: "Kunden",
    cardCustomersStat: "Registrierte Kunden",
    cardCustomersUnit: "Personen",
    cardCarsTitle: "Autos",
    cardCarsStat: "Registrierte Autos",
    cardCarsUnit: "Fahrzeuge",
    rightPanelUpcoming: "Anstehende Termine",
    rightPanelSeeAll: "alle ansehen →",
    rightPanelApproaching: "Bevorstehende Lieferung",
    fabNewService: "Neuer Servicebericht",
    fabNewCustomer: "Neuer Kunde",
    fabNewCar: "Neues Auto"
  },
  {
    id: 5,
    languageCode: "pt",
    searchPlaceholder: "Pesquise por placa, nome do cliente ou VIN...",
    tabCars: "Carros",
    cardServiceRecordsTitle: "Registros de serviço",
    cardServiceRecordsStat: "Total de registros",
    cardServiceRecordsUnit: "serviços",
    cardCustomersTitle: "Clientes",
    cardCustomersStat: "Clientes registrados",
    cardCustomersUnit: "pessoas",
    cardCarsTitle: "Carros",
    cardCarsStat: "Carros registrados",
    cardCarsUnit: "veículos",
    rightPanelUpcoming: "Próximas consultas",
    rightPanelSeeAll: "ver tudo →",
    rightPanelApproaching: "Entrega próxima",
    fabNewService: "Novo registro de serviço",
    fabNewCustomer: "Novo cliente",
    fabNewCar: "Novo carro"
  },
  {
    id: 6,
    languageCode: "zh",
    searchPlaceholder: "按车牌、客户名称或车辆识别码搜索...",
    tabCars: "汽车",
    cardServiceRecordsTitle: "服务记录",
    cardServiceRecordsStat: "总记录数",
    cardServiceRecordsUnit: "次服务",
    cardCustomersTitle: "客户",
    cardCustomersStat: "注册客户",
    cardCustomersUnit: "人",
    cardCarsTitle: "汽车",
    cardCarsStat: "注册汽车",
    cardCarsUnit: "辆车",
    rightPanelUpcoming: "即将到来的预约",
    rightPanelSeeAll: "查看全部 →",
    rightPanelApproaching: "即将交付",
    fabNewService: "新服务记录",
    fabNewCustomer: "新客户",
    fabNewCar: "新车"
  },
  {
    id: 7,
    languageCode: "tr",
    searchPlaceholder: "Plaka, müşteri adı veya VIN ile ara...",
    tabCars: "Araçlar",
    cardServiceRecordsTitle: "Servis kayıtları",
    cardServiceRecordsStat: "Toplam kayıt",
    cardServiceRecordsUnit: "servis",
    cardCustomersTitle: "Müşteriler",
    cardCustomersStat: "Kayıtlı müşteri",
    cardCustomersUnit: "kişi",
    cardCarsTitle: "Araçlar",
    cardCarsStat: "Kayıtlı araç",
    cardCarsUnit: "araç",
    rightPanelUpcoming: "Gelecek randevular",
    rightPanelSeeAll: "tümü →",
    rightPanelApproaching: "Teslim yaklaşan",
    fabNewService: "Yeni servis kaydı",
    fabNewCustomer: "Yeni müşteri",
    fabNewCar: "Yeni araç",
    serviceEditShort: "Düzenle", serviceNewShort: "Yeni Servis", serviceCarSearchPlaceholder: "Plaka, marka, model veya kullanıcı ara...", serviceNoCarMatch: "Eşleşen araç bulunamadı.", serviceListTitle: "Servis Kayıtları", serviceDate: "Tarih", servicePlate: "Plaka", serviceSearchPlaceholder: "Plaka, müşteri, şikayet veya araç ile ara...", serviceNewTitle: "Yeni Servis Kaydı", serviceNewButton: "Yeni Servis", serviceEditTitle: "Servis Kaydını Düzenle", serviceProfileTitle: "Servis Kaydı", serviceBasicSection: "Servis Bilgileri", serviceComplaintSection: "Servis Notları", serviceDamageSection: "Hasar ve Kontrol", serviceFinancialSection: "Teslim ve Ücretler", servicePartsSection: "Kullanılan Parçalar", serviceStatusSection: "Durum", serviceCar: "Araç", serviceCarSelect: "Araç seçin", serviceCustomer: "Kullanıcı", serviceNoCustomer: "Kullanıcı seçilmedi", serviceApplicationDate: "Başvuru Tarihi", serviceAppointmentDate: "Randevu Tarihi", serviceDeliveryDate: "Teslim Tarihi", serviceTargetDelivery: "Hedef Teslim", serviceJobDuration: "İş Süresi (dk)", serviceKm: "Kilometre", serviceComplaints: "Şikayet", serviceComplaintRequired: "Lütfen müşteri şikayetini girin.", serviceExtraRequests: "Ek Talepler", serviceFaults: "Arızalar", serviceOnePerLine: "Her satıra bir kayıt", serviceDamageOnReceive: "Girişte mevcut hasar", serviceDamageDuringRepair: "Onarım sırasında oluşan hasar", serviceLaborCharge: "İşçilik Ücreti", serviceTotalCharge: "Toplam Ücret", serviceDelivered: "Teslim edildi", serviceYes: "Evet", serviceNo: "Hayır", serviceAddPart: "Parça Ekle", servicePartName: "Parça adı", servicePartQuantity: "Adet", servicePartPrice: "Birim ücret", servicePartTotal: "Satır toplamı", servicePartInvalid: "Parça adı, adet ve birim ücreti kontrol edin.", servicePartsSum: "Parça toplamı", serviceNoParts: "Bu servis kaydında kullanılan parça bulunmuyor.", serviceCreate: "Servis Kaydını Kaydet", serviceSaveChanges: "Değişiklikleri Kaydet", serviceSaving: "Kaydediliyor...", serviceCreated: "Servis kaydı oluşturuldu.", serviceUpdated: "Servis kaydı güncellendi.", serviceDeleted: "Servis kaydı silindi.", serviceDelete: "Sil", serviceDeleteConfirm: "Bu servis kaydını silmek istediğinize emin misiniz? Bu kayda bağlı kullanılan parçalar da silinir. Bu işlem geri alınamaz.", serviceView: "Görüntüle", serviceActions: "İşlemler", serviceLoading: "Yükleniyor...", serviceNotFound: "Servis kaydı bulunamadı.", serviceNoRecords: "Servis kaydı bulunamadı.", serviceCarRequired: "Lütfen araç seçin.", serviceUnexpectedError: "Beklenmeyen bir hata oluştu.",
    carListTitle: "Araç Listesi", carSearchPlaceholder: "Plaka, VIN, model veya müşteri ile ara...", carNewTitle: "Yeni Araç", carNewButton: "Yeni Araç", carEditTitle: "Araç Düzenle", carProfileTitle: "Araç Profili", carFormSubtitle: "Servis geçmişinde kullanılacak araç bilgilerini kaydedin.", carBasicSection: "Temel Bilgiler", carIdentitySection: "Araç Bilgileri", carBrand: "Marka", carModel: "Model", carYear: "Yıl", carPlate: "Plaka", carVin: "VIN", carKm: "Kilometre", carCustomer: "Müşteri", carCustomerSearch: "Müşteri ara...", carCustomerNotFound: "Müşteri bulunamadı.", carNoCustomer: "Müşteri seçilmedi", carBrandSelect: "Marka seçin", brandNew: "Yeni marka", brandNewPlaceholder: "Marka adı", brandAdd: "Ekle", brandAdded: "Marka kaydedildi.", carPlateRequired: "Lütfen plaka girin.", carModelPlaceholder: "Model adı", carPlatePlaceholder: "", carVinPlaceholder: "WF0...", carKmPlaceholder: "180000", carYearSelect: "Yıl seçin", carYearPlaceholder: "1997", carTechnicalSection: "Teknik Bilgiler", carFuelType: "Yakıt Tipi", carFuelTypeSelect: "Yakıt tipi seçin", carBodyType: "Kasa Tipi", carBodyTypeSelect: "Kasa tipi seçin", carEngineVolume: "Motor Hacmi", carEngineVolumePlaceholder: "1398", carNotes: "Notlar", carNotesPlaceholder: "Triger kayışı 165.000 km'de değiştirildi...", carOldCustomers: "Eski Kullanıcılar", carOldCustomersHint: "Daha önce bu araçla ilişkilendirilmiş kullanıcılar.", carAddOldCustomer: "Eski kullanıcı ekle", carRemoveOldCustomer: "Eski kullanıcıyı kaldır", carNoOldCustomers: "Kayıtlı eski kullanıcı yok.", carOldCustomerAdded: "Eski kullanıcı eklendi.", carOldCustomerRemoved: "Eski kullanıcı kaldırıldı.", carCustomerChangeTitle: "{{previous}} eski kullanıcılara taşınıp araç {{next}} adına mı kaydedilsin?", carAddPreviousCustomerToHistory: "Önceki kullanıcıyı bu aracın eski kullanıcılar listesine ekle.", carCustomerChangeContinue: "Devam Et", carBrandRequired: "Lütfen marka seçin.", carModelRequired: "Lütfen model girin.", carCreate: "Aracı Kaydet", carSaveChanges: "Değişiklikleri Kaydet", carCreated: "Araç oluşturuldu.", carUpdated: "Araç güncellendi.", carUpdatedWithHistory: "Araç güncellendi. Önceki kullanıcı eski kullanıcılara taşındı.", carDeleted: "Araç silindi.", carDeleteConfirm: "Bu araç silinsin mi? Bağlı servis kayıtları da etkilenebilir.", carNoRecords: "Kayıtlı araç bulunamadı.", carLoading: "Yükleniyor...", carSaving: "Kaydediliyor...", carNotFound: "Araç bulunamadı.", carView: "Görüntüle", carEdit: "Düzenle", carDelete: "Sil", carActions: "İşlemler", cancel: "İptal", carUnexpectedError: "Beklenmeyen bir hata oluştu.", carCurrentUser: "Kullanıcı", carCurrentUserHint: "Bu araçla şu anda ilişkilendirilmiş kullanıcı.", carCurrentUserBadge: "Mevcut Kullanıcı", carOldUsers: "Eski Kullanıcılar", carOldUsersProfileHint: "Daha önce bu araçla ilişkilendirilmiş kullanıcılar.", carNoCurrentUser: "Bu araçla ilişkilendirilmiş mevcut kullanıcı yok.", carNoOldUsersProfile: "Kayıtlı eski kullanıcı bulunmuyor.", carNoContactInfo: "İletişim bilgisi bulunmuyor", carServiceHistory: "Servis Geçmişi", carNoServiceHistory: "Bu araç için henüz servis kaydı bulunmuyor."
  },
  {
    id: 8,
    languageCode: "ja",
    searchPlaceholder: "ナンバープレート、顧客名、またはVINで検索...",
    tabCars: "車",
    cardServiceRecordsTitle: "サービス記録",
    cardServiceRecordsStat: "総記録数",
    cardServiceRecordsUnit: "サービス",
    cardCustomersTitle: "顧客",
    cardCustomersStat: "登録顧客",
    cardCustomersUnit: "人",
    cardCarsTitle: "車",
    cardCarsStat: "登録車両",
    cardCarsUnit: "台の車",
    rightPanelUpcoming: "今後の予約",
    rightPanelSeeAll: "すべて見る →",
    rightPanelApproaching: "納期が近い",
    fabNewService: "新しいサービス記録",
    fabNewCustomer: "新しい顧客",
    fabNewCar: "新しい車"
  },
  {
    id: 9,
    languageCode: "ko",
    searchPlaceholder: "번호판, 고객 이름 또는 차대 번호로 검색...",
    tabCars: "자동차",
    cardServiceRecordsTitle: "서비스 기록",
    cardServiceRecordsStat: "전체 기록",
    cardServiceRecordsUnit: "건의 서비스",
    cardCustomersTitle: "고객",
    cardCustomersStat: "등록된 고객",
    cardCustomersUnit: "명",
    cardCarsTitle: "자동차",
    cardCarsStat: "등록된 자동차",
    cardCarsUnit: "대의 차량",
    rightPanelUpcoming: "다가오는 예약",
    rightPanelSeeAll: "모두 보기 →",
    rightPanelApproaching: "배송 임박",
    fabNewService: "새 서비스 기록",
    fabNewCustomer: "새 고객",
    fabNewCar: "새 자동차"
  },
  {
    id: 10,
    languageCode: "ru",
    searchPlaceholder: "Поиск по номеру, имени клиента или VIN...",
    tabCars: "Автомобили",
    cardServiceRecordsTitle: "Записи об обслуживании",
    cardServiceRecordsStat: "Всего записей",
    cardServiceRecordsUnit: "услуг",
    cardCustomersTitle: "Клиенты",
    cardCustomersStat: "Зарегистрированные клиенты",
    cardCustomersUnit: "человек",
    cardCarsTitle: "Автомобили",
    cardCarsStat: "Зарегистрированные автомобили",
    cardCarsUnit: "транспортных средств",
    rightPanelUpcoming: "Предстоящие встречи",
    rightPanelSeeAll: "смотреть все →",
    rightPanelApproaching: "Скорая выдача",
    fabNewService: "Новая запись об обслуживании",
    fabNewCustomer: "Новый клиент",
    fabNewCar: "Новый автомобиль"
  },
  {
    id: 11,
    languageCode: "nl",
    searchPlaceholder: "Zoeken op kenteken, klantnaam of VIN...",
    tabCars: "Auto's",
    cardServiceRecordsTitle: "Servicegegevens",
    cardServiceRecordsStat: "Totaal aantal records",
    cardServiceRecordsUnit: "services",
    cardCustomersTitle: "Klanten",
    cardCustomersStat: "Geregistreerde klanten",
    cardCustomersUnit: "personen",
    cardCarsTitle: "Auto's",
    cardCarsStat: "Geregistreerde auto's",
    cardCarsUnit: "voertuigen",
    rightPanelUpcoming: "Aankomende afspraken",
    rightPanelSeeAll: "bekijk alles →",
    rightPanelApproaching: "Naderende levering",
    fabNewService: "Nieuw service record",
    fabNewCustomer: "Nieuwe klant",
    fabNewCar: "Nieuwe auto"
  },
  {
    id: 12,
    languageCode: "az",
    searchPlaceholder: "Nömrə, müştəri adı və ya VIN ilə axtarış...",
    tabCars: "Avtomobillər",
    cardServiceRecordsTitle: "Servis qeydləri",
    cardServiceRecordsStat: "Ümumi qeyd",
    cardServiceRecordsUnit: "servis",
    cardCustomersTitle: "Müştərilər",
    cardCustomersStat: "Qeydiyyatda olan müştəri",
    cardCustomersUnit: "nəfər",
    cardCarsTitle: "Avtomobillər",
    cardCarsStat: "Qeydiyyatda olan avtomobil",
    cardCarsUnit: "avtomobil",
    rightPanelUpcoming: "Gələcək görüşlər",
    rightPanelSeeAll: "hamısı →",
    rightPanelApproaching: "Təslimatı yaxınlaşan",
    fabNewService: "Yeni servis qeydi",
    fabNewCustomer: "Yeni müştəri",
    fabNewCar: "Yeni avtomobil"
  },
  {
    id: 13,
    languageCode: "it",
    searchPlaceholder: "Cerca per targa, nome del cliente o VIN...",
    tabCars: "Auto",
    cardServiceRecordsTitle: "Record di servizio",
    cardServiceRecordsStat: "Record totali",
    cardServiceRecordsUnit: "servizi",
    cardCustomersTitle: "Clienti",
    cardCustomersStat: "Clienti registrati",
    cardCustomersUnit: "persone",
    cardCarsTitle: "Auto",
    cardCarsStat: "Auto registrate",
    cardCarsUnit: "veicoli",
    rightPanelUpcoming: "Prossimi appuntamenti",
    rightPanelSeeAll: "vedi tutto →",
    rightPanelApproaching: "Consegna imminente",
    fabNewService: "Nuovo record di servizio",
    fabNewCustomer: "Nuovo cliente",
    fabNewCar: "Nuova auto"
  },
  {
    id: 14,
    languageCode: "pl",
    searchPlaceholder: "Szukaj po rejestracji, nazwisku klienta lub VIN...",
    tabCars: "Samochody",
    cardServiceRecordsTitle: "Rejestry serwisowe",
    cardServiceRecordsStat: "Całkowita liczba rekordów",
    cardServiceRecordsUnit: "usług",
    cardCustomersTitle: "Klienci",
    cardCustomersStat: "Zarejestrowani klienci",
    cardCustomersUnit: "osób",
    cardCarsTitle: "Samochody",
    cardCarsStat: "Zarejestrowane samochody",
    cardCarsUnit: "pojazdów",
    rightPanelUpcoming: "Nadchodzące wizyty",
    rightPanelSeeAll: "zobacz wszystko →",
    rightPanelApproaching: "Zbliżająca się dostawa",
    fabNewService: "Nowy rejestr serwisowy",
    fabNewCustomer: "Nowy klient",
    fabNewCar: "Nowy samochód"
  }
];