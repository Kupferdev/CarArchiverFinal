import { create } from 'zustand';

export interface TabPayload {
  type: string;
  title: string;
  entityId?: number;
  parentEntityId?: number;
  contextCustomerId?: number;
  contextCarId?: number;
  contextLabel?: string;
  isProfile?: boolean;
}

export interface Tab extends TabPayload {
  id: string;
  dirty?: boolean;
  pinned?: boolean;
}

interface TabState {
  tabs: Tab[];
  activeTabId: string;
  openTab: (payload: TabPayload) => void;
  closeTab: (id: string) => void;
  closeTabs: (ids: string[]) => void;
  setActiveTab: (id: string) => void;
  renameTab: (id: string, title: string) => void;
  setTabDirty: (id: string, dirty: boolean) => void;
  togglePin: (id: string) => void;
}

// Preserve customer names, plate numbers and user-entered labels exactly as stored.
const capitalizeTabTitle = (title: string): string => title;

// Only stable navigation tabs can be pinned: never new/edit forms whose unsaved data cannot be restored.
export const isPinnableTab = (tab: Pick<TabPayload, 'type' | 'entityId' | 'isProfile'>): boolean =>
  tab.type === 'settings' ||
  (['car', 'customer', 'service'].includes(tab.type) && (tab.entityId === undefined || (tab.isProfile === true && tab.entityId > 0 && tab.entityId !== 999)));

const pinnedKey = 'cararchiver-pinned-tabs-v34';
const restorePinned = (): Tab[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(pinnedKey) || '[]') as Tab[];
    return Array.isArray(raw) ? raw.filter(tab => tab.pinned && tab.id && isPinnableTab(tab)).map(tab => ({...tab, dirty:false})) : [];
  } catch { return []; }
};
const persistPinned = (tabs: Tab[]) => {
  try { localStorage.setItem(pinnedKey, JSON.stringify(tabs.filter(tab => tab.pinned && isPinnableTab(tab)).map(({dirty: _dirty, ...tab}) => tab))); } catch { /* Storage may be restricted */ }
};
export const useTabStore = create<TabState>((set) => ({
  tabs: restorePinned(),
  activeTabId: 'home',

  openTab: (payload) => set((state) => {
    const tabId = `${payload.type}-${payload.entityId || 'main'}-${payload.isProfile ? 'profile' : 'form'}-${payload.contextCustomerId ? `customer${payload.contextCustomerId}` : payload.contextCarId ? `car${payload.contextCarId}` : 'all'}`;
    const existingTab = state.tabs.find((t) => t.id === tabId);
    if (existingTab) {
      return { activeTabId: existingTab.id };
    }

    const newTab: Tab = {
      id: tabId,
      type: payload.type,
      title: capitalizeTabTitle(payload.title),
      entityId: payload.entityId,
      parentEntityId: payload.parentEntityId,
      contextCustomerId: payload.contextCustomerId,
      contextCarId: payload.contextCarId,
      contextLabel: payload.contextLabel,
      isProfile: payload.isProfile,
      dirty: false,
    };

    return {
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    };
  }),

  closeTab: (id) => set((state) => {
    const newTabs = state.tabs.filter((t) => t.id !== id || t.pinned);
    return {
      tabs: newTabs,
      activeTabId: state.activeTabId === id && !newTabs.some(t => t.id === id)
        ? (newTabs.length > 0 ? newTabs[newTabs.length - 1].id : 'home')
        : state.activeTabId,
    };
  }),

  closeTabs: (ids) => set((state) => {
    const closing = new Set(ids);
    const newTabs = state.tabs.filter((t) => !closing.has(t.id) || t.pinned);
    return {
      tabs: newTabs,
      activeTabId: closing.has(state.activeTabId) && !newTabs.some(t => t.id === state.activeTabId)
        ? (newTabs.length > 0 ? newTabs[newTabs.length - 1].id : 'home')
        : state.activeTabId,
    };
  }),

  setActiveTab: (id) => set({ activeTabId: id }),

  renameTab: (id, title) => set((state) => {
    const tabs = state.tabs.map(tab => tab.id === id ? {...tab, title: capitalizeTabTitle(title)} : tab);
    if (tabs.some(tab => tab.id === id && tab.pinned)) persistPinned(tabs);
    return { tabs };
  }),

  togglePin: (id) => set(state => {
    const tabs = state.tabs.map(tab => tab.id === id && isPinnableTab(tab) ? { ...tab, pinned: !tab.pinned } : tab);
    persistPinned(tabs);
    return { tabs };
  }),
  setTabDirty: (id, dirty) => set((state) => ({
    tabs: state.tabs.map((tab) => (tab.id === id && tab.dirty !== dirty ? { ...tab, dirty } : tab)),
  })),
}));
