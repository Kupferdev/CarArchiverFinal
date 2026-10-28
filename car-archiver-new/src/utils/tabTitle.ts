import i18n from '../i18n';
import type { Tab } from '../store/tabStore';
export function localizedTabTitle(tab: Tab): string {
  const t = (key: string) => i18n.t(key);
  if (tab.type === 'settings') return t('settingsTitle');
  if ((tab.contextCustomerId || tab.contextCarId) && tab.entityId === undefined) {
    const base = tab.type === 'car' ? t('carListTitle') : t('serviceListTitle');
    return [tab.contextLabel, base].filter(Boolean).join(' - ');
  }
  if (tab.entityId === undefined) {
    return tab.type === 'car' ? t('carListTitle') : tab.type === 'service' ? t('serviceListTitle') : t('customerListTitle');
  }
  if (tab.entityId === 999) {
    return tab.type === 'car' ? t('carNewTitle') : tab.type === 'service' ? t('serviceNewTitle') : t('customerNew');
  }
  const raw = (tab.contextLabel || tab.title).replace(/\s*(?:·|[-–—])?\s*(?:Profili|Araç Listesi|Servis Kayıtları)\s*$/i, '').trim();
  if (tab.type === 'customer') {
    if (tab.isProfile) return `${raw} - ${t('customerProfileTab')}`;
    return `${raw} - ${t('customerEdit')}`;
  }
  if (!tab.isProfile && tab.type === 'car') return `${raw} - ${t('carEditTitle')}`;
  if (!tab.isProfile && tab.type === 'service') return `${raw} - ${t('serviceEditShort')}`;
  return raw || tab.title;
}
