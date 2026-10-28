import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTabStore } from '../../store/tabStore';
import type { Service } from '../../shared/types/service';
import type { Car } from '../../shared/types/car';
import styles from './RightPanel.module.css';

const RightPanel: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { openTab } = useTabStore();
  const [services, setServices] = useState<Service[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  useEffect(() => {
    void Promise.all([
      window.electron.ipcRenderer.invoke('get-all-services'),
      window.electron.ipcRenderer.invoke('get-all-cars'),
    ]).then(([ss, cs]) => {
      if (ss.success) setServices(ss.data ?? []);
      if (cs.success) setCars(cs.data ?? []);
    }).catch(console.error);
  }, []);
  const now = Date.now();
  const oneMonth = now + 30 * 86400000;
  const upcoming = useMemo(() => services.filter(s => {
    if (s.isDelivered || s.deliveryDate || !s.appointmentDate) return false;
    const d = new Date(s.appointmentDate).getTime();
    return d >= now && d <= oneMonth;
  }).sort((a,b) => new Date(a.appointmentDate!).getTime()-new Date(b.appointmentDate!).getTime()), [services, now, oneMonth]);
  const deliveries = useMemo(() => services.filter(s => {
    if (s.isDelivered || !s.targetDeliveryDate) return false;
    return new Date(s.targetDeliveryDate).getTime() <= oneMonth;
  }).sort((a,b) => new Date(a.targetDeliveryDate!).getTime()-new Date(b.targetDeliveryDate!).getTime()), [services, oneMonth]);
  const description = (s: Service, includeExtra = false) => String(s.complaints || (includeExtra ? s.extraRequests : '') || '—');
  const plate = (carId: number) => cars.find(c => c.carId === carId)?.plateNumber ?? '—';
  const open = (s: Service) => s.serviceId && openTab({ type:'service', title: plate(s.carId), entityId:s.serviceId, isProfile:true });
  const isLate = (d: Date | string | null | undefined) => !!d && new Date(d).getTime() < now;
  const date = (d: Date | string | null | undefined) => d ? new Intl.DateTimeFormat(i18n.language, { dateStyle:'short', timeStyle:'short' }).format(new Date(d)) : '—';
  return <aside className={styles.rightPanel}>
    <section className={styles.panelSection}>
      <div className={styles.panelTitle}>{t('rightPanelUpcoming')} <span>{upcoming.length}</span></div>
      <div className={styles.panelScroll}>
        {upcoming.length ? upcoming.map(s => <button className={styles.panelItem} key={s.serviceId} type="button" onClick={() => open(s)}>
          <div className={styles.panelItemName}>{plate(s.carId)}</div>
          <div className={styles.panelItemSub}><span className={styles.panelDate}>{date(s.appointmentDate)} · </span><span className={styles.panelComplaint} title={description(s, true)}>{description(s, true)}</span></div>
        </button>) : <div className={styles.panelEmpty}>{t('upcomingNone')}</div>}
      </div>
    </section>
    <section className={styles.panelSection}>
      <div className={styles.panelTitle}>{t('rightPanelApproaching')} <span className={styles.warnBadge}>{deliveries.length}</span></div>
      <div className={styles.panelScroll}>
        {deliveries.length ? deliveries.map(s => <button className={styles.panelItem} key={s.serviceId} type="button" onClick={() => open(s)}>
          <div className={styles.panelItemName}>{plate(s.carId)}</div>
          <div className={styles.panelItemSub}>{isLate(s.targetDeliveryDate) && <strong style={{color:'var(--danger, #d85050)',marginRight:6}}>{t('rightPanelOverdue')} · </strong>}<span className={styles.panelDate}>{date(s.targetDeliveryDate)} · </span><span className={styles.panelComplaint} title={description(s)}>{description(s)}</span></div>
        </button>) : <div className={styles.panelEmpty}>{t('deliveryNone')}</div>}
      </div>
    </section>
  </aside>;
};
export default RightPanel;
