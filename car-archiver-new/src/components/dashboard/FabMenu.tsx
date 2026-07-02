import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTabStore } from '../../store/tabStore';
import styles from './FabMenu.module.css';

const FabMenu: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { openTab } = useTabStore();

  return (
    <div className={styles.fabWrap}>
      <div className={`${styles.fabMenu} ${isOpen ? styles.open : ''}`}>
        
        {/* 1. YENİ SERVİS KAYDI BUTONU */}
        <div 
          className={styles.fabItem}
          onClick={() => {
            // Servis ekleme sayfasını yaptığımızda burası o formu açacak
            openTab({ type: 'service', title: t('fabNewService') || 'Yeni servis kaydı', entityId: 999 });
            setIsOpen(false); // Menüyü kapat
          }}
        >
          <div className={styles.fabLabel}>{t('fabNewService') || 'Yeni servis kaydı'}</div>
          <button className={`${styles.fabDot} ${styles.blue}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M5 6h5M5 9h3M11 10l1.5 1.5L15 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 2. YENİ MÜŞTERİ BUTONU */}
        <div 
          className={styles.fabItem}
          onClick={() => {
            // entityId: 999 bizim "Yeni Ekleme Formu" anahtarımız
            openTab({ type: 'customer', title: t('fabNewCustomer') || 'Yeni müşteri', entityId: 999 });
            setIsOpen(false); // Menüyü kapat
          }}
        >
          <div className={styles.fabLabel}>{t('fabNewCustomer') || 'Yeni müşteri'}</div>
          <button className={`${styles.fabDot} ${styles.teal}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M1 14c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

      </div>
      
      {/* ANA FAB (ARTI / ÇARPI) BUTONU */}
      <button className={styles.fab} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <line x1="4" y1="4" x2="16" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="4" x2="4" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <line x1="10" y1="4" x2="10" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <line x1="4" y1="10" x2="16" y2="10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default FabMenu;