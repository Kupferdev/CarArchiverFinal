# Silme Akışları v19

- Müşteri listesindeki mevcut silme penceresi yeni ortak DeleteConfirmDialog bileşenini kullanır; müşteri profili ve müşteri düzenleme ekranı da aynı bileşeni kullanır.
- Araç liste tekli ve toplu silmelerinde aynı pencere kullanılır. Bağlı servisleri silme kutusu varsayılan kapalıdır.
- Araç için Services.carId NOT NULL + ON DELETE CASCADE olduğundan kutu kapalıyken bağlı servis varsa araç silme işlemi reddedilir; servisleri sessizce silmeyiz. Kutucuk açıksa servis ve parts ilişkileri FK cascade ile kaldırılır. Toplu araç silme tek transaction'dır.
- Servis listesi tekli/toplu, servis profili tekli silme aynı onay penceresini kullanır. Yalnızca seçili servis kayıtları ve kendi Parts kayıtları silinir; müşteri/araç korunur.
- Para birimi, fiyatlandırma, yeni migration ve mevcut ekranların diğer alanları değişmedi.
- Kontroller: npm run test:smoke geçti; TS/TSX transpile syntax kontrolü geçti. Tam npm run verify ve gerçek SQLite testleri bu ortamda çalıştırılmadı. Kullanıcı gerçek SQLite yedeği alarak ilk çalıştırmada doğrulamalı.
