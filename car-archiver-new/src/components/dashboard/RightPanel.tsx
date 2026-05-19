import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './RightPanel.module.css';

const RightPanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.rightPanel}>
      <div className={styles.panelSection}>
        <div className={styles.panelTitle}>
          {t('rightPanelUpcoming')}
          <a href="#all">{t('rightPanelSeeAll')}</a>
        </div>
        {/* Statik Örnek Veriler */}
        <div className={styles.panelItem}>
          <div className={styles.panelItemName}>34 ABC 123</div>
          <div className={styles.panelItemSub}>Bugün 14:00 · Yağ değişimi</div>
        </div>
        <div className={styles.panelItem}>
          <div className={styles.panelItemName}>06 XY 4521</div>
          <div className={styles.panelItemSub}>Yarın 09:30 · Fren kontrolü</div>
        </div>
      </div>

      <div className={styles.panelDivider}></div>

      <div className={styles.panelSection}>
        <div className={styles.panelTitle}>
          {t('rightPanelApproaching')}
          <span className={styles.warnBadge}>4</span>
        </div>
        <div className={styles.panelItem}>
          <div className={styles.panelItemName}>BMW 3 Serisi</div>
          <div className={styles.panelItemSub}>Yarın · Ahmet Y.</div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;