# v35 — Windows pencere sürükleme düzeltmesi (27 Ekim 2026)

Bu paket, önceki v35 window-drag hotfix sürümünün üzerine hazırlanmıştır. Electron 30.5.1 ve better-sqlite3 12.6.2 sürümleri, SQLite şeması ve uygulama verileri değişmedi.

## Neden önceki düzeltme yetmedi?

`src/App.css` dosyasındaki `.windowChrome{display:none}` kuralı, Windows için `-webkit-app-region:drag` tanımlansa bile ayrı 30px sürükleme şeridini GİZLİYORDU. Ek olarak `Topbar` içindeki logo/uygulama adı tek bir `button` olarak işaretlenmişti ve arama kutusunun büyüyen kapsayıcısı `no-drag` olduğundan görünen başlıkta sürüklenebilir neredeyse yalnızca saat kalıyordu.

## Değişiklikler

- Windows'ta `windowChrome` şeridi `display:block` ile etkinleştirildi. Sistem düğmeleri için sağ 140px ayrılmaya devam ediliyor.
- Logo yalnızca Home butonu olarak kaldı; uygulama adı native sürükleme alanı oldu.
- Arama ve saat arasında ayrı, en az 64px (dar görünümde 40–48px) boş sürükleme alanı eklendi.
- Sekme çubuğunun BOŞ alanından sürükleme eklendi; sekmeler, kapatma/pin ve ayarlar düğmesi `no-drag` olarak korundu.
- `scripts/window-drag-regression.mjs` bu sınırları ve gizli 30px şeridin görünürlüğünü denetliyor.

## Windows'da kontrol

Uygulamayı kapatın. Kaynakların güncel olduğuna emin olun. Bağımlılık sürümleri değişmediği için halihazırda `npm ci` yapılmış geliştirme klasöründe **yeniden `npm ci` şart değil**.

```cmd
npm run test:window-drag
npm run dev
```

Önce pencereyi sağ üstteki "Aşağı Geri Getir" düğmesiyle normal boyuta alın. Şu noktaları deneyin:
1. En üstteki 30px boş şeritten pencereyi taşıyın.
2. Görünüyorsa `Car Service Archiver` başlığından, ayrıca arama ile saat arasındaki boş alandan taşıyın.
3. Sekme çubuğunda bir sekmenin ÜZERİNDEN DEĞİL boş alandan taşıyın.
4. Logo/Home tıklaması, arama alanı, sekmeler ve ayarlar düğmesi normal çalışmalı.

Kaynak testleri Windows'taki fiziksel fare-sürükleme davranışının yerine geçmez.
