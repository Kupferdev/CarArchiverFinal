# v35 Çöp Kutusu test fikstürü ve sağ panel düzeltmesi — 21.10.2026

## Düzeltmeler
- `scripts/trash-integration-test.mjs`: Müşteri 2001'in eksik bağlantı geri yükleme senaryosundan sonra test fikstürü temizleniyor. Önceden `Customers` ve `Cars` tablolarında 2001 kaldığından 1001 grafiğini silme testindeki global `COUNT(*) === 0` yanlış başarısız oluyordu.
- `src/components/dashboard/RightPanel.tsx` ve `.module.css`: Gelecek Randevular / Teslim Yaklaşan kartlarında şikayet en fazla iki satır, kalan metin ellipsis; tam metin HTML title ile hover'da görülebilir. Tarih ayrı gösterilir.

## Kontroller
- `node --check scripts/trash-integration-test.mjs`: geçti.
- `node scripts/smoke-check.mjs`: geçti.
- `node scripts/v35-source-check.mjs`: 12/12 geçti.
- Tam SQLite, TypeScript, ESLint testleri: bu ortamda npm native bağımlılıkları bulunmadığından çalıştırılamadı. Windows'ta `npm run test:trash` ve ardından `npm run verify` ile doğrulayın.
