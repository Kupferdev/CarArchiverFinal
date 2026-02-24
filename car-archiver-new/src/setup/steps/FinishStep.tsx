import React from 'react';

interface FinishStepProps {
  configData: any;
  language: string;
}

export const FinishStep = ({ configData, language }: FinishStepProps) => {
  
  const handleFinalize = async () => {
    // 1. Electron'un ana sürecine (ipcHandlers) verileri gönderiyoruz
    const success = await (window as any).electron.ipcRenderer.invoke('save-config', configData);
    
    if (success) {
      // 2. Kayıt başarılıysa uygulamayı yeniden yükle
      // App.tsx yeniden çalışacak, config'i bulacak ve bizi ana sayfaya alacak.
      window.location.reload(); 
    } else {
      // Hata durumunda (mesela yazma izni yoksa) kullanıcıyı uyar
      const errorMsg = language === 'tr' 
        ? 'Ayarlar kaydedilemedi. Lütfen yönetici izinlerini kontrol edin.' 
        : 'Failed to save settings. Please check administrator permissions.';
      alert(errorMsg);
    }
  };

  return (
    <div className="setup-container" style={{ textAlign: 'center', padding: '20px' }}>
      {/* Başarı İkonu (Opsiyonel) */}
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>

      <h2>
        {language === 'tr' ? 'Kurulum Tamamlandı!' : 'Setup Complete!'}
      </h2>

      <div style={{ margin: '24px 0', color: '#555', fontSize: '15px', lineHeight: '1.6' }}>
        <p>
          {language === 'tr' 
            ? 'Tüm yapılandırmalar başarıyla tamamlandı. Artık uygulamayı kullanmaya başlayabilirsiniz.' 
            : 'All configurations have been successfully completed. You can now start using the application.'}
        </p>
        
        {/* Seçimlerin kısa bir özeti (Kullanıcı ne yaptığını görsün) */}
        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: '#f9f9f9', 
          borderRadius: '8px',
          textAlign: 'left',
          fontSize: '13px'
        }}>
          <strong>{language === 'tr' ? 'Özet:' : 'Summary:'}</strong><br/>
          📍 {language === 'tr' ? 'Kayıt Yolu:' : 'Save Path:'} {configData.savePath}<br/>
          🌐 {language === 'tr' ? 'Dil:' : 'Language:'} {configData.language.toUpperCase()}
        </div>
      </div>

      <div className="footer-action" style={{ justifyContent: 'center' }}>
        <button 
          onClick={handleFinalize}
          className="accept-btn"
          style={{ 
            padding: '12px 40px', 
            backgroundColor: '#007AFF', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)'
          }}
        >
          {language === 'tr' ? 'Uygulamayı Başlat' : 'Launch Application'}
        </button>
      </div>
    </div>
  );
};