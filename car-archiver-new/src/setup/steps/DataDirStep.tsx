import React, { useState } from 'react';

export const DataDirStep = ({ onNext, onBack, updateData, language }: any) => {
  // 'new' veya 'existing' değerini tutar
  const [setupMode, setSetupMode] = useState<'new' | 'existing' | null>(null);
  const [selectedPath, setSelectedPath] = useState('');

  const handleSelectFolder = async () => {
    const path = await (window as any).electron.ipcRenderer.invoke('select-directory');
    
    if (path) {
      setSelectedPath(path);
      updateData({ 
        savePath: path,
        isNewSetup: setupMode === 'new' // Verinin yeni mi eski mi olduğunu config'e not düşüyoruz
      });
    }
  };

  return (
    <>
      <h2 style={{ textAlign: 'center' }}>
        {language === 'tr' ? 'Veri Yapılandırması' : 'Data Configuration'}
      </h2>

      <div className="scroll-area" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* MOD SEÇİMİ */}
        {!setupMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="lang-card" onClick={() => setSetupMode('new')} style={{ justifyContent: 'center', width: '100%' }}>
              {language === 'tr' ? 'Sıfırdan Kurulum Yap' : 'Fresh Installation'}
            </button>
            <button className="lang-card" onClick={() => setSetupMode('existing')} style={{ justifyContent: 'center', width: '100%' }}>
              {language === 'tr' ? 'Mevcut Verilerimi Aktar' : 'Use Existing Data'}
            </button>
          </div>
        ) : (
          /* KLASÖR SEÇİMİ */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#555' }}>
              {setupMode === 'new' 
                ? (language === 'tr' ? 'Verilerin saklanacağı boş bir klasör seçin.' : 'Select an empty folder to store data.')
                : (language === 'tr' ? 'Eski verilerinizin olduğu klasörü seçin.' : 'Select the folder containing your old data.')}
            </p>
            
            <button onClick={handleSelectFolder} style={{ padding: '10px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #007AFF', backgroundColor: '#f0f7ff' }}>
              {language === 'tr' ? 'Klasör Seç' : 'Select Folder'}
            </button>

            {selectedPath && (
              <div style={{ fontSize: '12px', wordBreak: 'break-all', backgroundColor: '#eee', padding: '10px', borderRadius: '5px' }}>
                {selectedPath}
              </div>
            )}
            
            <button onClick={() => { setSetupMode(null); setSelectedPath(''); }} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#007AFF', cursor: 'pointer' }}>
              {language === 'tr' ? '← Seçimi Değiştir' : '← Change Mode'}
            </button>
          </div>
        )}
      </div>

      <div className="footer-action">
        <button className="decline-btn" onClick={onBack}>
          {language === 'tr' ? 'Geri' : 'Back'}
        </button>
        <button 
          disabled={!selectedPath}
          onClick={onNext}
          className="accept-btn"
          style={{ backgroundColor: selectedPath ? '#007AFF' : '#ccc', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 24px' }}
        >
          {language === 'tr' ? 'Devam Et' : 'Continue'}
        </button>
      </div>
    </>
  );
};