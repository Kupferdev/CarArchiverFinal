# CarArchiver v32 — Toplu geliştirme önizlemesi

Bu paket **v31 üzerine** yapılan 11 maddelik toplu çalışmanın test önizlemesidir. Tamamlanmamış bölümleri gizlemeyin; kaynak kod, veri ve migration değişikliklerini gerçek yedek üzerinde test etmeden üretime almayın.

## Kodlanan işler

1. Yeni servis formunda araç seçilmeden manuel kullanıcı seçimi pasif. Aramalı, opak kullanıcı seçici. Araç seçiminin mevcut kullanıcıyı seçme davranışı korunuyor.
2. Müşteri profilinden yeni servis açılınca müşteri önceden seçiliyor; araç seçenekleri müşteri ilişkisine göre daraltılıyor.
3. Sekmeleri fare orta tuşuyla kapatma, kirli formlar için mevcut kaydedilmemiş değişiklik onayı.
4–5. Müşteri/araç profilinden "Tümünü Gör" ile normal Araç/Servis liste bileşenleri, aynı arama/silme/aksiyonlar ve bağlamsal filtreler.
6. Servis profilinde A4 yazdırma/PDF akışı (Chromium yazdırma iletişim kutusu), danışman notlarını dahil etme seçeneği.
7. Sağ panelde veritabanına bağlı gelecek randevular ve teslim bekleyenler; eşit yükseklikte kaydırılabilir kutular. Global arama ve ortak servis/araç/müşteri ikon bileşeni.
8. Ana sayfada son servisler tablosu; hızlı ekleme menüsünde Yeni Araç.
9. Windows platformunda temaya bağlı native titlebar overlay renkleri ve yeni uygulama simgesi (platforma göre yuvarlatılmış pencere köşeleri OS kontrolündedir).
10. Sekme biçiminde Ayarlar, Lacivert/Koyu/Açık/Dim tema seçimi, dil, veri konumu, geri bildirim taslağı, hakkında.
11. Yeni eklenen 28 metin anahtarı 14 dile çevrildi; `scripts/i18n-coverage.mjs` denetim komutu eklendi.

## Tamamlanmayan / özellikle test gerektirenler

- **11. madde hâlâ TAM DEĞİL.** Önceden var olan `dashboardTexts.ts` çevirilerinde TR/EN haricindeki 12 dilde 142'şer anahtar eksik, toplam **1.704 eksik karşılık** mevcut. Bunlar İngilizce fallback ile görünür. Eski sabit UI metinlerinin tümü de i18n'e taşınmadı. Otomatik denetim: `node scripts/i18n-coverage.mjs`.
- Global aramanın yeni kayıtlar sonrasında tazelenmesi ve büyük veri performansı gerçek ortamda gözden geçirilmeli.
- A4 yazdırma, Windows yazıcı/PDF çıktısı, çok sayfalı notlar ve tablo kırılması gerçek Electron'da denenmeli.
- Windows titlebar overlay ve pencere sürükleme/yeniden boyutlandırma, Windows 10/11 üzerinde ayrıca doğrulanmalı; pencere köşeleri işletim sisteminin kontrolündedir.
- Tema stilinin tamamı henüz dört tema için piksel piksel doğrulanmadı. Sabit arka plan kullanan eski alanlarda renk uyumsuzlukları olabilir.
- Ayarlar ekranındaki geri bildirim **otomatik gönderim yapmaz**; iletişim adresi henüz belirlenmediğinden yalnızca taslak kopyalar.
- Tam `npm run verify` bu çalışma ortamında başarıyla çalıştırılamadı: bağımlılık kurulumu zaman aşımına uğradı. TypeScript AST ile 118 kaynak dosyasının sözdizimi temiz; `node scripts/smoke-check.mjs` başarılı.

## Kullanıcıda önerilen testler

1. Önce eski SQLite veritabanı ve v31 kaynak kodunu yedekleyin.
2. `npm ci` ve `npm run verify` çalıştırın.
3. Müşteri profilinden servis oluşturmayı ve araç ilişkisini doğrulayın.
4. Birkaç filtreli liste açıp arama, çoklu silme ve `+ Yeni ...` bağlamlarını kontrol edin.
5. Örnek servis kaydından PDF önizlemesi çıkarın. Danışman notlarının varsayılan olarak gizli olduğunu doğrulayın.
6. Farklı monitör boyutlarında açık/koyu/dim/lacivert temaları, Windows pencere kontrollerini ve arama kutusunu deneyin.
