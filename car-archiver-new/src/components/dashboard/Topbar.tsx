import React, { useState, useEffect } from 'react';
import styles from './Topbar.module.css';

const Topbar: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  // Canlı saat mantığı
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' }));
    };

    updateClock(); // İlk render'da hemen çalıştır
    const intervalId = setInterval(updateClock, 1000); // Her saniye güncelle

    return () => clearInterval(intervalId); // Bileşen ekrandan kalkarsa sayacı temizle
  }, []);

  return (
    <div className={styles.topbar}>
      <div className={styles.appIcon}>
        {/* Senin tasarımındaki kutucuklu ikon */}
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
        {/* İleride i18n bağladığımızda buradaki placeholder dinamikleşecek */}
        <input className={styles.searchInput} placeholder="Plaka, müşteri adı veya VIN ile ara..." />
      </div>

      <div className={styles.clock}>
        <div className={styles.clockTime}>{time}</div>
        <div className={styles.clockDate}>{date}</div>
      </div>
    </div>
  );
};

export default Topbar;