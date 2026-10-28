import { useTranslation } from 'react-i18next';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EntityIcon } from '../common/EntityIcon';
import styles from './Tabbar.module.css';
import { localizedTabTitle } from '../../utils/tabTitle';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { isPinnableTab, type Tab, useTabStore } from '../../store/tabStore';

interface TabContextState {
  tabId: string;
  x: number;
  y: number;
}

const Tabbar: React.FC = () => {
  const { t } = useTranslation();
  const { tabs, activeTabId, setActiveTab, closeTab, closeTabs, togglePin, openTab } = useTabStore();
  const [contextMenu, setContextMenu] = useState<TabContextState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pendingClose, setPendingClose] = useState<string[] | null>(null);

  const currentTab = useMemo(
    () => tabs.find((tab) => tab.id === contextMenu?.tabId) ?? null,
    [contextMenu?.tabId, tabs],
  );

  useEffect(() => {
    if (!contextMenu) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setContextMenu(null);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setContextMenu(null);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [contextMenu]);

  const performClose = (targetIds: string[]) => {
    if (targetIds.length === 1) closeTab(targetIds[0]);
    else closeTabs(targetIds);
    setContextMenu(null);
    setPendingClose(null);
  };

  const requestClose = (targetIds: string[]) => {
    if (!targetIds.length) return;
    targetIds = targetIds.filter(id => !tabs.find(tab => tab.id === id)?.pinned);
    if (!targetIds.length) return;
    const dirtyCount = tabs.filter((tab) => targetIds.includes(tab.id) && tab.dirty).length;
    if (dirtyCount > 0) {
      setPendingClose(targetIds);
      setContextMenu(null);
      return;
    }
    performClose(targetIds);
  };

  const openContextMenu = (event: React.MouseEvent, tab: Tab) => {
    event.preventDefault();
    setContextMenu({ tabId: tab.id, x: event.clientX, y: event.clientY });
  };

  return (
    <div className={styles.tabbar}>
      <div className={styles.tabScroll}>
      <div
        className={`${styles.tabHome} ${activeTabId === 'home' ? styles.tabHomeActive : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 7L8 2L14 7V14H10V10H6V14H2V7Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`${styles.tab} ${activeTabId === tab.id ? styles.tabActive : ''}`}
          onClick={() => setActiveTab(tab.id)}
          onContextMenu={(event) => openContextMenu(event, tab)}
          onAuxClick={(event) => { if (event.button === 1) { event.preventDefault(); requestClose([tab.id]); } }}
          onMouseDown={(event) => { if (event.button === 1) event.preventDefault(); }}
        >
          {(['car','customer','service'] as string[]).includes(tab.type) && <EntityIcon kind={tab.type as 'car'|'customer'|'service'} size={14} className={styles.tabIcon} />}
          {tab.type==='settings' && <span aria-hidden="true">⚙</span>}

          <span className={styles.tabTitle}>{localizedTabTitle(tab)}</span>

          <div
            className={`${styles.tabDirty} ${tab.dirty ? styles.tabDirtyVisible : ''}`}
            aria-hidden={!tab.dirty}
            title={tab.dirty ? t("tabUnsavedHint") : undefined}
          />

          {isPinnableTab(tab) && <button type="button" className={`${styles.pinButton} ${tab.pinned ? styles.isPinned : ''}`} title={t(tab.pinned ? 'tabUnpin' : 'tabPin')} aria-label={t(tab.pinned ? 'tabUnpin' : 'tabPin')} onClick={e => { e.stopPropagation(); togglePin(tab.id); }}>📌</button>}
          {!tab.pinned && <div
            className={styles.tabClose}
            onClick={(e) => {
              e.stopPropagation();
              requestClose([tab.id]);
            }}
          >
            ✕
          </div>}
        </div>
      ))}

      </div>
      <button type="button" className={styles.settingsGear} title={t("settingsTitle")} aria-label={t("settingsTitle")} onClick={()=>openTab({type:"settings",title:t("settingsTitle")})}>⚙</button>
      {contextMenu && currentTab && (
        <div
          ref={menuRef}
          className={styles.contextMenu}
          style={{ left: Math.min(window.innerWidth - 244, Math.max(12, contextMenu.x - 12)), top: Math.min(window.innerHeight - 180, Math.max(72, contextMenu.y + 8)) }}
          role="menu"
        >
          {isPinnableTab(currentTab) && <button type="button" className={styles.contextMenuItem} onClick={() => {togglePin(currentTab.id);setContextMenu(null);}}>{t(currentTab.pinned ? 'tabUnpin' : 'tabPin')}</button>}
          <button type="button" disabled={!!currentTab.pinned} className={styles.contextMenuItem} onClick={() => requestClose([currentTab.id])}>{t("tabClose")}</button>
          <button type="button" className={styles.contextMenuItem} onClick={() => requestClose(tabs.filter((tab) => tab.id !== currentTab.id).map((tab) => tab.id))}>{t("tabCloseOthers")}</button>
          <button type="button" className={`${styles.contextMenuItem} ${styles.contextMenuDanger}`} onClick={() => requestClose(tabs.map((tab) => tab.id))}>{t("tabCloseAll")}</button>
        </div>
      )}
      {pendingClose && <UnsavedChangesDialog
        count={tabs.filter((tab) => pendingClose.includes(tab.id) && tab.dirty).length}
        onCancel={() => setPendingClose(null)}
        onConfirm={() => performClose(pendingClose)}
      />}
    </div>
  );
};

export default Tabbar;
