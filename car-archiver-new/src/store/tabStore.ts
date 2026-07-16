import { create } from 'zustand';

export interface TabPayload {
  type: string;
  title: string;
  entityId?: number;
  isProfile?: boolean;
}

export interface Tab extends TabPayload {
  id: string;
}

interface TabState {
  tabs: Tab[];
  activeTabId: string;
  openTab: (payload: TabPayload) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

export const useTabStore = create<TabState>((set) => ({
  tabs: [],
  activeTabId: 'home',

  openTab: (payload) => set((state) => {
    // Benzersiz sekme ID'si oluşturuyoruz (Aynı kişi için birden fazla aynı sekme açılmasını engeller)
    const tabId = `${payload.type}-${payload.entityId || 'main'}-${payload.isProfile ? 'profile' : 'form'}`;
    
    // Eğer sekme zaten açıksa, sadece ona odaklan (focus ol)
    const existingTab = state.tabs.find((t) => t.id === tabId);
    if (existingTab) {
      return { activeTabId: existingTab.id };
    }

    // Yeni sekme oluştur (entityId ve isProfile değerlerini kaybetmeden ekliyoruz!)
    const newTab: Tab = {
      id: tabId,
      type: payload.type,
      title: payload.title,
      entityId: payload.entityId, // KRİTİK NOKTA: Artık ID yutulmayacak
      isProfile: payload.isProfile // Profil bilgisi de yutulmayacak
    };

    return {
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id
    };
  }),

  closeTab: (id) => set((state) => {
    const newTabs = state.tabs.filter((t) => t.id !== id);
    return {
      tabs: newTabs,
      activeTabId: newTabs.length > 0 ? newTabs[newTabs.length - 1].id : 'home'
    };
  }),

  setActiveTab: (id) => set({ activeTabId: id })
}));