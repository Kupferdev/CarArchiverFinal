import React from 'react';
import styles from './HomePage.module.css';
import Topbar from './Topbar';
import Tabbar from './Tabbar';
import MainContent from './MainContent';
import RightPanel from './RightPanel';
import FabMenu from './FabMenu';
import { useTabStore } from '../../store/tabStore'; // Store eklendi

const HomePage: React.FC = () => {
  const { activeTabId } = useTabStore();

  return (
    <div className={styles.appContainer}>
      <Topbar />
      <Tabbar />
      
      <div className={styles.contentArea}>
        <main className={styles.mainPanel}>
          {/* Aktif sekme 'home' ise gösterge panelini bas, değilse geçici bir boş sayfa göster */}
          {activeTabId === 'home' ? (
            <MainContent />
          ) : (
            <div style={{ color: 'var(--text-main)', padding: '20px' }}>
              <h2>Burası yakında dolacak</h2>
              <p>Aktif Sekme ID: {activeTabId}</p>
            </div>
          )}
        </main>
        
        {/* Sağ paneli sadece ana sayfadayken (home) göster */}
        {activeTabId === 'home' && <RightPanel />}
      </div>

      {/* FAB menüyü de dilersen sadece ana sayfada gösterebilirsin */}
      {activeTabId === 'home' && <FabMenu />}
    </div>
  );
};

export default HomePage;