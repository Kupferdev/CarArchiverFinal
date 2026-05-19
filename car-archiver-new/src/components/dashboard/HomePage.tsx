import React from 'react';
import styles from './HomePage.module.css';
import Topbar from './Topbar';
import Tabbar from './Tabbar';
import MainContent from './MainContent';
import RightPanel from './RightPanel';
import FabMenu from './FabMenu';

const HomePage: React.FC = () => {
  return (
    <div className={styles.appContainer}>
      <Topbar />
      <Tabbar />
      
      <div className={styles.contentArea}>
        <main className={styles.mainPanel}>
          <MainContent />
        </main>
        <RightPanel />
      </div>

      <FabMenu />
    </div>
  );
};

export default HomePage;