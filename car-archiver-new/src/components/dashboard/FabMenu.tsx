import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTabStore } from '../../store/tabStore';
import styles from './FabMenu.module.css';
import { EntityIcon } from '../common/EntityIcon';

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
            openTab({ type: 'service', title: t('fabNewService'), entityId: 999 });
            setIsOpen(false); // Menüyü kapat
          }}
        >
          <div className={styles.fabLabel}>{t('fabNewService')}</div>
          <button className={`${styles.fabDot} ${styles.blue}`}><EntityIcon kind="service" size={16} /></button>
        </div>

        <div className={styles.fabItem} onClick={() => { openTab({ type: 'car', title: t('carNewTitle'), entityId: 999 }); setIsOpen(false); }}>
          <div className={styles.fabLabel}>{t('carNewTitle')}</div>
          <button className={`${styles.fabDot} ${styles.amber}`} aria-label={t('carNewTitle')} type="button"><EntityIcon kind="car" size={16}/></button>
        </div>
        {/* 2. YENİ MÜŞTERİ BUTONU */}
        <div 
          className={styles.fabItem}
          onClick={() => {
            // entityId: 999 bizim "Yeni Ekleme Formu" anahtarımız
            openTab({ type: 'customer', title: t('fabNewCustomer'), entityId: 999 });
            setIsOpen(false); // Menüyü kapat
          }}
        >
          <div className={styles.fabLabel}>{t('fabNewCustomer')}</div>
          <button className={`${styles.fabDot} ${styles.teal}`}><EntityIcon kind="customer" size={16} /></button>
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