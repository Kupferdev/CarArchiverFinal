import React from 'react';
import styles from './HomePage.module.css';
import Topbar from './Topbar';
import Tabbar from './Tabbar';
import MainContent from './MainContent';
import RightPanel from './RightPanel';
import FabMenu from './FabMenu';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import CustomerProfile from './CustomerProfile'; // İMPORT EKLENDİ
import { useTabStore } from '../../store/tabStore';

const HomePage: React.FC = () => {
  const { activeTabId, tabs } = useTabStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  const renderTabContent = () => {
    if (activeTabId === 'home') return <MainContent />;
    
    if (activeTab?.type === 'customer') {
      if (activeTab.entityId === 999) return <CustomerForm />;
      if (activeTab.isProfile) return <CustomerProfile customerId={activeTab.entityId} />;
      return <CustomerList />;
    }
    
    return <div style={{ padding: '20px' }}>Geliştirilme Aşamasında...</div>;
  };

  return (
    <div className={styles.appContainer}>
      <Topbar />
      <Tabbar />
      <div className={styles.contentArea}>
        <main className={styles.mainPanel}>{renderTabContent()}</main>
        {activeTabId === 'home' && <RightPanel />}
      </div>
      {activeTabId === 'home' && <FabMenu />}
    </div>
  );
};

export default HomePage;