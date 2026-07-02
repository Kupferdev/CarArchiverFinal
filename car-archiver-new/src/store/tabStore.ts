import { create } from 'zustand';

export type TabType = 'home' | 'car' | 'customer' | 'service';

export interface Tab {
  id: string;
  type: TabType;
  title: string;
  entityId?: number;
  isProfile?: boolean;
}

interface TabStore {
  tabs: Tab[];
  activeTabId: string;
  openTab: (tab: Omit<Tab, 'id'>) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTabId: 'home',

  openTab: (tab) => {
    const { tabs } = get();

    // Aynı entity zaten açıksa sadece aktif et
    const existing = tabs.find(
      (t) => t.type === tab.type && t.entityId === tab.entityId
    );
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }

    const id = `${tab.type}-${tab.entityId ?? Date.now()}`;
    set({ tabs: [...tabs, { ...tab, id }], activeTabId: id });
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get();
    const idx = tabs.findIndex((t) => t.id === id);
    const remaining = tabs.filter((t) => t.id !== id);

    let nextActive = activeTabId;
    if (activeTabId === id) {
      if (remaining.length > 0) {
        nextActive = remaining[Math.max(0, idx - 1)].id;
      } else {
        nextActive = 'home';
      }
    }

    set({ tabs: remaining, activeTabId: nextActive });
  },

  setActiveTab: (id) => set({ activeTabId: id }),
}));