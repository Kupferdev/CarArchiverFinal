# v35 Çöp Kutusu — toplu işlem güvenliği (21.10.2026)

## Değişiklikler
- `restoreTrashBatch(ids)` tüm seçili kayıtları tek SQLite transaction'ında geri yükler; hata halinde önceki kayıtların geri yüklenmesi de geri alınır.
- `purgeTrashBatch(ids)` tüm girişlerin varlığını işlemden önce kontrol eder, Çöp Kutusu satırlarını tek transaction'da siler. Başarılı commit sonrası yalnızca başka aktif/çöp kaydınca referans verilmeyen fotoğraf dosyalarını temizlemeye çalışır.
- İki yeni IPC kanalı (`restore-trash-batch`, `purge-trash-batch`) ve typed API eşlemeleri eklendi.
- Arayüz, her satır için ayrı IPC çağrısı yerine tek toplu çağrı yapar; partial completion mesajı kaldırıldı.
- Entegrasyon testine başarısız toplu geri yüklemede rollback ve hatalı ID ile toplu kalıcı silme testi eklendi.

## Sınırlar ve kalan işler
- Fotoğraf silme dosya sisteminde gerçekleştiği için SQLite transaction'ı ile tamamen atomik olamaz. Dosya silme başarısız olursa öksüz medya dosyası kalabilir. Kalıcı silme öncesi manifest/journal ve tekrar denenebilir temizlik, ayrıca test edilmeli.
- Birbirinden bağımsız Çöp Kutusu girdilerinde ebeveyn/çocuk ilişkili geri yüklemeler çatışırsa tüm batch reddedilir; hiçbir veri kısmen geri yüklenmez.
- Tek çağrıdaki seçili kayıt sınırı 500'dür; 500 üzeri için UI sayfalama ve gruplama gereklidir.
- `npm run verify` ve `npm run test:trash` bu ortamda `node_modules` eksikliği nedeniyle çalıştırılamadı; Windows üzerinde zorunlu.
- Uygulama klasörü içinde gerçek kullanıcı verileri kullanılmamalı. Testler izole `.tmp-trash-integration` veritabanını kullanıyor.

## Windows doğrulaması
```
npm run test:trash
npm run verify
npm run dev
```
