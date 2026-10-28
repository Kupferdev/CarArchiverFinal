import React from 'react';
import styles from './HomePage.module.css';
import Topbar from './Topbar';
import Tabbar from './Tabbar';
import MainContent from './MainContent';
import RightPanel from './RightPanel';
import FabMenu from './FabMenu';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import CustomerProfile from './CustomerProfile';
import CarList from './CarList';
import CarForm from './CarForm';
import CarProfile from './CarProfile';
import ServiceList from './ServiceList';
import ServiceForm from './ServiceForm';
import ServiceProfile from './ServiceProfile';
import SettingsPage from './SettingsPage';
import { useTabStore } from '../../store/tabStore';
import { useTranslation } from 'react-i18next';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { activeTabId, tabs } = useTabStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const formTabs = tabs.filter(tab => ['car', 'service', 'customer'].includes(tab.type) && tab.entityId !== undefined && !tab.isProfile);

  const renderTabContent = () => {
    if (activeTabId === 'home') return <MainContent />;
    
    if (activeTab?.type === 'car') {
      if (activeTab.entityId === 999) {
        return null;
      }
      if (activeTab.isProfile && activeTab.entityId !== undefined) {
        return <CarProfile carId={activeTab.entityId} />;
      }
      if (activeTab.entityId !== undefined) {
        return null;
      }
      return <CarList customerId={activeTab.contextCustomerId} contextLabel={activeTab.contextLabel} />;
    }

    if (activeTab?.type === 'service') {
      if (activeTab.entityId === 999) {
        return null;
      }
      if (activeTab.isProfile && activeTab.entityId !== undefined) {
        return <ServiceProfile serviceId={activeTab.entityId} />;
      }
      if (activeTab.entityId !== undefined) {
        return null;
      }
      return <ServiceList customerId={activeTab.contextCustomerId} carId={activeTab.contextCarId} contextLabel={activeTab.contextLabel} />;
    }

    if (activeTab?.type === 'customer') {
      // 1. Yeni Kayıt (999)
      if (activeTab.entityId === 999) return null;
      
      // 2. Profil Görüntüleme (ID'nin tanımsız olmadığını garanti altına alıyoruz)
      if (activeTab.isProfile && activeTab.entityId !== undefined) {
        return <CustomerProfile customerId={activeTab.entityId} />;
      }
      
      // 3. DÜZENLEME MODU (ID'nin tanımsız olmadığını garanti altına alıyoruz)
      if (activeTab.entityId !== undefined) {
        return null; 
      }
      
      // 4. Hiçbiri değilse Listeyi aç
      return <CustomerList />;
    }
    
    if (activeTab?.type === 'settings') return <SettingsPage />;
    return <div style={{ padding: '20px' }}>{t("settingsDevelopment")}</div>;
  };

  return (
    <div className={styles.appContainer}>
      <Topbar />
      <Tabbar />
      <div className={styles.contentArea}>
        <main className={styles.mainPanel}>
          {renderTabContent()}
          {formTabs.map(tab => (
            <div key={tab.id} style={{ display: activeTabId === tab.id ? 'block' : 'none', height: '100%', width: '100%' }}>
              {tab.type === 'car' && <CarForm tabId={tab.id} carId={tab.entityId === 999 ? undefined : tab.entityId} customerId={tab.entityId === 999 ? tab.parentEntityId : undefined} />}
              {tab.type === 'service' && <ServiceForm tabId={tab.id} serviceId={tab.entityId === 999 ? undefined : tab.entityId} carId={tab.entityId === 999 ? tab.parentEntityId : undefined} customerId={tab.entityId === 999 ? tab.contextCustomerId : undefined} />}
              {tab.type === 'customer' && <CustomerForm tabId={tab.id} customerId={tab.entityId === 999 ? undefined : tab.entityId} />}
            </div>
          ))}
        </main>
        {activeTabId === 'home' && <RightPanel />}
      </div>
      {activeTabId === 'home' && <FabMenu />}
    </div>
  );
};

export default HomePage;