import React, { useState } from 'react';
import '../../setup/setup.css'; 

const languages = [
  { code: 'en', name: 'English', flag: 'united-kingdom.png' },
  { code: 'es', name: 'Español', flag: 'spain-flag.png' },
  { code: 'fr', name: 'Français', flag: 'france.png' },
  { code: 'de', name: 'Deutsch', flag: 'germany.png' },
  { code: 'pt', name: 'Português', flag: 'portugal.png' },
  { code: 'tr', name: 'Türkçe', flag: 'turkey.png' },
  { code: 'az', name: 'Azerbaijani', flag: 'azerbaijan.png' },
  { code: 'zh', name: '中文', flag: 'china.png' },
  { code: 'ja', name: '日本語', flag: 'japan.png' },
  { code: 'ko', name: '한국어', flag: 'korean.png' },
  { code: 'ru', name: 'Русский', flag: 'russia.png' },
  { code: 'nl', name: 'Nederlands', flag: 'netherlands.png' },
  { code: 'it', name: 'Italiano', flag: 'italia.png' },
  { code: 'pl', name: 'Polski', flag: 'poland.png' },
];

export const LanguageStep = ({ onNext, updateData }: any) => {
  const systemLang = navigator.language.split('-')[0];
  const isSupported = languages.some(lang => lang.code === systemLang);
  const [selected, setSelected] = useState(isSupported ? systemLang : 'en');

  const getFlagUrl = (name: string) => {
    return new URL(`../../assets/flagicons/${name}`, import.meta.url).href;
  };

  const handleNext = () => {
    updateData({ language: selected });
    onNext();
  };

  return (
    <div className="outer-wrapper">
      <div className="scroll-area">
        {languages.map((lang, index) => {
          const isNextSelected = languages[index + 1]?.code === selected;
          const isSelected = selected === lang.code;

          return (
            <div
              key={lang.code}
              className={`lang-card ${isSelected ? 'selected' : ''} ${isNextSelected ? 'prev-of-selected' : ''}`}
              onClick={() => setSelected(lang.code)}
            >
              <img src={getFlagUrl(lang.flag)} className="flag-img" alt={lang.code} />
              <span className="lang-name">{lang.name}</span>
              <img 
                src={new URL('../../assets/icons/check_circle_blue.svg', import.meta.url).href} 
                className="check-icon" 
                alt="selected" 
                style={{ display: isSelected ? 'block' : 'none' }}
              />
            </div>
          );
        })}
      </div>

      <div className="footer-action">
        <button className="next-btn" onClick={handleNext}>
          <img 
            src={new URL('../../assets/icons/right_arrow-blue.svg', import.meta.url).href} 
            alt="İleri" 
          />
        </button>
      </div>
    </div>
  );
};