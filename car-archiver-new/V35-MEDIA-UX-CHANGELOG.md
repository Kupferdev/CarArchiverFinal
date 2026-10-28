# CarArchiver v35 — Medya ve Servis Formu Güncellemesi

Kaynak tabanı: CarArchiverFinal-v35-phase1-source.zip (v0.35.0).

## Yeni işlevler
- Servis profili fotoğraf galerisi **yalnızca görüntülenebilir**; ekleme/silme yalnızca kayıtlı bir servisin düzenleme ekranında görünür.
- Bir servis henüz oluşturulmamışsa önce kaydedilmelidir; yeni servis formunda kayıtsız bir servis için medya galerisi gösterilmez.
- Fotoğraf galerisi: tümünü seç, seçimi temizle, seçilenleri topluca sil, tema uyumlu ve yerelleştirilmiş silme onayı.
- Fotoğraf görüntüleyici: pencere kontrol düğmelerinin aşağısında X; önceki/sonraki gezinme, yön tuşları, Esc, büyütme/küçültme, zoom sıfırlama ve fare tekerleği.
- Fotoğraf sınırı: tek seçimde 100 dosya, servis başına 500 dosya (her dosya için güvenlik denetimi ve 16 MB sınırı devam eder). Ham IPC hataları yerine 14 dilde anlaşılır hata mesajları.
- Servis profilinde yazdırma düğmesi yalnızca yazıcı simgesi; erişilebilir başlık/tooltip ve PDF/yazdırma seçenekleri mevcut diyalogda.
- Servis düzenleme ekranında tarih/saat girişleri seçili uygulama dilinde gösterilir. Düzenlenebilir metin girdisi ve yerel takvim açma düğmesi vardır. Veritabanı tarih alanları aynı anlam ve formatta tutulur.
- Servis profili tarih/sürelerinin dil bazlı formatlanması geliştirildi.
- “Teslim edildi” yanlışlıkla işaretlenip kaldırıldığında **yalnızca bu işaretle otomatik eklenen** teslim tarihi temizlenir. Elle yazılmış veya önceden kayıtlı teslim tarihi korunur.

## Dikkat edilmesi gerekenler
- Servis düzenleme ekranındaki fotoğraf ekleme ve silme işlemleri **hemen kaydedilir**; alttaki “İptal” butonuyla geri alınmaz. Bu davranış ilerideki çöp kutusu/geri yükleme özelliğiyle iyileştirilecektir.
- Toplu silme, her medya kaydını sırayla siler. Tamamlanan silmeler geri alınamaz; hata halinde kalan kayıtlar yeniden listelenir.
- Fotoğraflar her zaman yerel `media` klasöründe dosyadır; SQLite içinde yalnızca metadata ve servis bağlantısı bulunur.
- Geri yükleme, kayıt çöp kutusu ve sahipsiz fotoğraf temizliği bu pakette **henüz tamamlanmamıştır**.
- MSIX paketleme, kullanıcı isteğiyle uygulamanın tamamlanmasından sonraya ertelendi.

## Kontroller
- `node scripts/v35-media-ux-check.mjs`: 13 kaynak regresyon kontrolü geçti.
- `node scripts/v35-source-check.mjs`, `node scripts/v34-regression.mjs`, `node scripts/v345-regression.mjs`: geçti.
- `node scripts/smoke-check.mjs`: geçti.
- `node scripts/i18n-audit.mjs --strict --strict-literals`: 14 dilde eksik anahtar/sabit Türkçe JSX 0.
- 133 TypeScript/TSX dosyası sözdizimi denetimi: 0 hata.
- **Tam `npm run verify`, Electron arayüzü ve Windows dosya işlemleri bu çalışma ortamında çalıştırılamadı.** ZIP Windows üzerinde test edilmeli.
