import React from 'react';
import styles from './Tabbar.module.css';

const Tabbar: React.FC = () => {
  return (
    <div className={styles.tabbar}>
      <div className={`${styles.tabHome} ${styles.tabHomeActive}`}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 7L8 2L14 7V14H10V10H6V14H2V7Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className={`${styles.tab} ${styles.tabActive}`}>
        <svg className={styles.tabIcon} viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M4 6h5M4 9h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <rect x="7" y="1" width="8" height="6" rx="1.5" fill="var(--bg-main)" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
        Arabalar
        <div className={styles.tabClose}>✕</div>
      </div>
      <div className={styles.tab}>
        <svg className={styles.tabIcon} viewBox="0 0 16 16" fill="none">
          <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M1 14c0-3 2-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Enver Ali
        <div className={styles.tabClose}>✕</div>
      </div>
    </div>
  );
};

export default Tabbar;