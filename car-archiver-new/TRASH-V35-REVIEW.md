# CarArchiver v35 — Çöp Kutusu test adayı

## Dahil edilenler
- Ayarlar > Veri ve Depolama > Çöp Kutusu (14 dil): listele, geri yükle, kalıcı sil, onay.
- Müşteri, araç, servis, servis fotoğrafı silme IPC akışları artık aynı SQLite transaction'ında JSON ilişki kopyası oluşturur; geri yükleme kayıt kimliklerini korur.
- Müşteriyi ilişkili kayıtları koruyarak silme durumunda araç/servis müşteri bağlarının yeniden kurulması (başkası atanmışsa çakışma nedeniyle geri yükleme engellenir).
- Servis, parça ve fotoğraf metaverisi birlikte geri gelir. Fotoğrafın gerçek dosyası kalıcı silmeye dek media/ içinde korunur.
- Kalıcı silmede yalnızca aktif kayıt ve başka Trash öğesi tarafından kullanılmayan fotoğraf dosyaları temizlenir.
- Migration 11: TrashItems. Otomatik süreli temizleme yok.
- scripts/trash-integration-test.mjs ile fotoğraf, servis, müşteri, araç, rollback ve PK çakışması senaryoları; npm run verify içine test:trash eklendi.

## Test durumu / uyarılar
- npm run test:smoke: **geçti**.
- npm run test:i18n: **14/14 dil anahtar denetimi geçti**. Çöp Kutusu metinleri bileşen içindeki 14 dilli sözlükte tutuluyor.
- Değişen TypeScript/TSX dosyalarının sözdizimi ayrı denetlendi.
- Bu ortamda npm ci bağımlılık indirme zaman aşımına uğradı; node_modules eksik. Tam typecheck, lint ve gerçek better-sqlite3 entegrasyonu **çalıştırılamadı**.
- **Gerçek verilerle silme/geri yükleme yapmadan önce tam yedek alın ve boş test veritabanıyla test edin.** Bu paket henüz Microsoft Store yayın sürümü değildir.

## Windows üzerinde doğrulama
1. Kaynak kodunu ayrı klasöre çıkarın; eski çalışan veri klasörünün üzerine yazmayın.
2. `npm ci` ardından `npm run verify` (özellikle `test:trash`).
3. `npm run dev` için gerekiyorsa `npx electron-rebuild -f -w better-sqlite3`.
4. Geçici/yeni SQLite klasöründe müşteri, araç, servis, parça ve fotoğraf oluşturun; hem ilişkili hem bağımsız silme, geri yükleme ve kalıcı silmeyi deneyin.
5. Başarısız test varsa bu paketi asıl veritabanıyla kullanmayın; tam hata çıktısını paylaşın.
