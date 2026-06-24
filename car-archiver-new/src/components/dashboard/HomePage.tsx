import React from 'react';
import styles from './HomePage.module.css';
import Topbar from './Topbar';
import Tabbar from './Tabbar';
import MainContent from './MainContent';
import RightPanel from './RightPanel';
import FabMenu from './FabMenu';
import CustomerList from './CustomerList'; // Yeni listemizi import ettik
import { useTabStore } from '../../store/tabStore';

const HomePage: React.FC = () => {
  const { activeTabId, tabs } = useTabStore();
  
  // Aktif sekmenin tüm verilerini buluyoruz (type'ını anlamak için)
  const activeTab = tabs.find(t => t.id === activeTabId);

  // Hangi bileşenin render edileceğine karar veren fonksiyon
  const renderTabContent = () => {
    if (activeTabId === 'home') return <MainContent />;
    if (activeTab?.type === 'customer') return <CustomerList />;
    // İleride buraya if (activeTab?.type === 'car') return <CarList /> ekleyeceğiz.
    
    return (
      <div style={{ color: 'var(--text-main)', padding: '20px' }}>
        <h2>Geliştirilme Aşamasında</h2>
        <p>Aktif Sekme Tipi: {activeTab?.type}</p>
      </div>
    );
  };

  return (
    <div className={styles.appContainer}>
      <Topbar />
      <Tabbar />
      
      <div className={styles.contentArea}>
        {/* mainPanel artık dinamik içerik basıyor */}
        <main className={styles.mainPanel}>
          {renderTabContent()}
        </main>
        
        {/* Sağ paneli sadece ana sayfadayken gösteriyoruz */}
        {activeTabId === 'home' && <RightPanel />}
      </div>

      {activeTabId === 'home' && <FabMenu />}
    </div>
  );
};

export default HomePage;