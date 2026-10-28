# Form text UX v17

- `CustomerForm.tsx`: Adres alanında kelime başları Türkçe büyük harfe dönüştürülür; diğer karakterler değiştirilmez.
- `CustomerForm.module.css`: Adres metin alanı 15px font, 1.65 satır yüksekliği, hafif harf boşluğu, 100px minimum yükseklik ve italik placeholder.
- `ServiceForm.tsx`: Danışman notlarında metnin ilk harfi ve `.`, `!`, `?` veya yeni satır sonrası ilk harf Türkçe büyük harfe dönüştürülür. İçerikteki diğer karakterler korunur.
- Ortak yardımcı fonksiyonlar: `src/utils/textCapitalization.ts`.
- DB, migration, IPC veya ücret hesaplamaları değiştirilmedi.
- Basit Node örnekleri doğrulandı; tam `npm run verify` burada node_modules bulunmadığından çalıştırılamadı.
