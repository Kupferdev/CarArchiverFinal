# Car Service Archiver – Gizlilik Politikası TASLAĞI

**Durum:** Hukuki ve teknik inceleme bekleyen taslak. **Yayımlanmış veya onaylanmış bir gizlilik politikası değildir.**
**Sürüm:** Taslak 0.1 · **Hazırlanma tarihi:** 21 Ekim 2026
**Geliştirici/veri sorumlusu iletişim bilgileri:** [Yasal ad/unvan ve gerekli iletişim bilgileri eklenecek]
**Destek:** carservicearchiver.support@gmail.com
**Herkese açık politika adresi:** [Partner Center başvurusu öncesinde oluşturulacak HTTPS URL]

## 1. Uygulamanın amacı
Car Service Archiver, araç, müşteri, parça ve servis kayıtlarını yönetmek için tasarlanmış bir Windows masaüstü uygulamasıdır.

## 2. Cihazda tutulan bilgiler
Kullanıcının girdiği müşteri iletişim bilgileri, araç bilgileri, servis notları, kullanılan parçalar ve servis fotoğrafları kullanıcının seçtiği yerel depolama konumundaki SQLite veritabanında ve fotoğraf klasörlerinde tutulacak şekilde tasarlanmıştır. Uygulama ayarları Windows kullanıcı veri alanında tutulabilir. Kayıtların hukuka uygun toplanması, kullanılması ve korunması için uygulamayı kullanan işletmenin kendi yükümlülükleri söz konusudur.

## 3. Aktarım, yedekleme ve dışa aktarma
Kaynak kodda servis kayıtlarını geliştiriciye otomatik ileten bir özellik tespit edilmemiştir. Üretim sürümünde harici HTTP/WebSocket isteklerine karşı uygulama içi kısıtlama bulunur. Bunun tüm çalışma ortamlarındaki ağ trafiğinin bağımsız olarak doğrulandığı anlamına gelmediğini önemle belirtiriz. Kullanıcı tarafından başlatılan yedekleme, geri yükleme ve CSV dışa aktarma işlemlerinde veriler kullanıcının seçtiği konuma yazılabilir ve kullanıcı o konumun güvenliğinden sorumludur.

## 4. Destek yazışmaları
Geri bildirim özelliği, kullanıcının e-posta uygulamasında `carservicearchiver.support@gmail.com` adresine hitap eden bir taslak açar. Kullanıcı e-postayı inceleyip kendisi gönderir; uygulama veritabanını ve fotoğrafları otomatik ekleyecek şekilde tasarlanmamıştır. Kullanıcı destek e-postası gönderdiğinde paylaştığı bilgiler e-posta sağlayıcılarının sistemlerinde işlenebilir. Destek e-postalarının saklama süresi, erişim yetkileri ve silme prosedürü yayından önce doldurulmalıdır: **[İNCELEME GEREKİYOR]**.

## 5. Bilgi güvenliği ve saklama
Yerel verilerin yedeklenmesi, yetkisiz erişimden korunması ve silinmesi cihazı ve uygulamayı işleten kullanıcıya bağlıdır. Uygulamanın güncellenmesi ve silinmesinin seçilen harici veri klasörüne etkisi gerçek Windows paket testleriyle doğrulanmalıdır.

## 6. Haklar ve başvuru
İlgili kişilerin erişim, düzeltme, silme ve diğer hakları uygulanabilir mevzuata ve işlemenin taraflarına göre değişebilir. Geliştiriciye yapılan destek yazışmaları için iletişim adresi yukarıda yer alır. İşletmelerin kendi müşterilerine karşı veri sorumluluğu ayrı değerlendirilmelidir.

## Yayın öncesi zorunlu incelemeler
- Yasal yayıncı adı/unvanı, yetki alanı ve destek e-postalarının saklanma süresi tamamlanmalı.
- Tam bağımlılık/ağ analizi ve kurulu sürüm paketlemesi doğrulanmalı.
- KVKK ve geçerli diğer mevzuatlar için uzman incelemesi yapılmalı.
- Nihai politika bir HTTPS URL'de yayımlanmalı ve Partner Center'daki URL ile eşleşmeli.
- Uygulama içindeki 14 dildeki gizlilik bildirimi nihai metinle tutarlı hâle getirilmeli.
