import React from 'react';
import styles from './Tabbar.module.css';
import { useTabStore } from '../../store/tabStore';

const Tabbar: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabStore();

  return (
    <div className={styles.tabbar}>
      {/* 1. Sabit Ana Sayfa (Home) Sekmesi */}
      <div 
        className={`${styles.tabHome} ${activeTabId === 'home' ? styles.tabHomeActive : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 7L8 2L14 7V14H10V10H6V14H2V7Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* 2. Dinamik Olarak Açılan Sekmeler */}
      {tabs.map((tab) => (
        <div 
          key={tab.id} 
          className={`${styles.tab} ${activeTabId === tab.id ? styles.tabActive : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {/* Sekme tipine göre ikon */}
          <svg className={styles.tabIcon} viewBox="0 0 16 16" fill="none">
            {tab.type === 'car' && (
              <path d="M3 11L5 6h10l2 5v3H3v-3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            )}
            {tab.type === 'customer' && (
              <circle cx="8" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
            )}
            {tab.type === 'service' && (
              <path d="M5 7h6M5 10h4M5 13h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            )}
          </svg>
          
          {tab.title}
          
          <div 
            className={styles.tabClose} 
            onClick={(e) => {
              e.stopPropagation(); // Kapatma butonuna tıklayınca sekmenin aktif olmasını engeller
              closeTab(tab.id);
            }}
          >
            ✕
          </div>
        </div>
      ))}
    </div>
  );
};

export default Tabbar;