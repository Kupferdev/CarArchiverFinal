import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MainContent.module.css';

const MainContent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.cardsGrid}>
      {/* 1. KART: Servis Kayıtları */}
      <div className={styles.navCard}>
        <div className={styles.navCardHeader}>
          <div className={styles.navCardTitle}>{t('cardServiceRecordsTitle')}</div>
          <div className={`${styles.navCardIcon} ${styles.blue}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="3" width="11" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5 7h6M5 10h4M5 13h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M13 10l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className={styles.navCardStat}>{t('cardServiceRecordsStat')}</div>
        <div className={styles.navCardCount}>247 <span>{t('cardServiceRecordsUnit')}</span></div>
      </div>

      {/* 2. KART: Müşteriler */}
      <div className={styles.navCard}>
        <div className={styles.navCardHeader}>
          <div className={styles.navCardTitle}>{t('cardCustomersTitle')}</div>
          <div className={`${styles.navCardIcon} ${styles.teal}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="8" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M2 17c0-3.5 2.7-6 6-6s6 2.5 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="15" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M18 15c0-2.2-1.3-4-3-4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <div className={styles.navCardStat}>{t('cardCustomersStat')}</div>
        <div className={styles.navCardCount}>312 <span>{t('cardCustomersUnit')}</span></div>
      </div>

      {/* 3. KART: Arabalar */}
      <div className={styles.navCard}>
        <div className={styles.navCardHeader}>
          <div className={styles.navCardTitle}>{t('cardCarsTitle')}</div>
          <div className={`${styles.navCardIcon} ${styles.amber}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 11L5 6h10l2 5v3H3v-3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              <circle cx="6" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="14" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M5 9h10" stroke="currentColor" strokeWidth="1.1"/>
            </svg>
          </div>
        </div>
        <div className={styles.navCardStat}>{t('cardCarsStat')}</div>
        <div className={styles.navCardCount}>148 <span>{t('cardCarsUnit')}</span></div>
      </div>
    </div>
  );
};

export default MainContent;