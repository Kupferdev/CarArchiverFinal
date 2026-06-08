import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Topbar.module.css';

const Topbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  // Canlı saat ve dinamik dil formatı
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // DÜZELTME 1: 'tr-TR' yerine i18n.language kullanarak ayların/günlerin o dile göre yazılmasını sağladık
      setTime(now.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', weekday: 'long' }));
    };

    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    return () => clearInterval(intervalId);
  }, [i18n.language]); // Dil değiştiğinde saat formatı da anında güncellenir

  return (
    <div className={styles.topbar}>
      <div className={styles.appIcon}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1.5" fill="var(--accent-blue)" />
          <rect x="9" y="1" width="6" height="6" rx="1.5" fill="var(--text-muted)" />
          <rect x="1" y="9" width="6" height="6" rx="1.5" fill="var(--text-muted)" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" fill="var(--text-muted)" />
        </svg>
      </div>
      
      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {/* DÜZELTME 2: Doğru i18n anahtarını kullandık */}
        <input className={styles.searchInput} placeholder={t('searchPlaceholder')} />
      </div>

      <div className={styles.clock}>
        <div className={styles.clockTime}>{time}</div>
        <div className={styles.clockDate}>{date}</div>
      </div>
    </div>
  );
};

export default Topbar;