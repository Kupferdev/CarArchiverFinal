import React, { useEffect, useState } from 'react';
import { EntityIcon } from '../common/EntityIcon';
import type { Service } from '../../shared/types/service';
import type { Car } from '../../shared/types/car';
import type { CustomerViewDto } from '../../shared/dtos/customerDtos';
import { useTranslation } from 'react-i18next';
import styles from './MainContent.module.css';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useTabStore } from '../../store/tabStore';

const MainContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { stats } = useDashboardStats();
  const { openTab } = useTabStore();
  const [recent, setRecent] = useState<Service[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [customers, setCustomers] = useState<CustomerViewDto[]>([]);
  useEffect(() => {
    void Promise.all([
      window.electron.ipcRenderer.invoke('get-all-services'),
      window.electron.ipcRenderer.invoke('get-all-cars'),
      window.electron.ipcRenderer.invoke('get-all-customers')
    ]).then(([ss, cs, cu]) => {
      if (ss.success) setRecent((ss.data ?? []).sort((a,b) => new Date(b.applicationDate || 0).getTime() - new Date(a.applicationDate || 0).getTime()).slice(0, 8));
      if (cs.success) setCars(cs.data ?? []);
      setCustomers(cu ?? []);
    }).catch(console.error);
  }, []);

  return (
    <div className={styles.dashboardBody}>
    <div className={styles.cardsGrid}>
      {/* 1. KART: Servis Kayıtları */}
      <div 
        className={styles.navCard} 
        onClick={() => openTab({ type: 'service', title: t('cardServiceRecordsTitle') })}
      >
        <div className={styles.navCardHeader}>
          <div className={styles.navCardTitle}>{t('cardServiceRecordsTitle')}</div>
          <div className={`${styles.navCardIcon} ${styles.blue}`}><EntityIcon kind="service" size={20} />
          </div>
        </div>
        <div className={styles.navCardStat}>{t('cardServiceRecordsStat')}</div>
        <div className={styles.navCardCount}>{stats.services} <span>{t('cardServiceRecordsUnit')}</span></div>
      </div>

      {/* 2. KART: Müşteriler */}
      <div 
        className={styles.navCard}
        onClick={() => openTab({ type: 'customer', title: t('cardCustomersTitle') })}
      >
        <div className={styles.navCardHeader}>
          <div className={styles.navCardTitle}>{t('cardCustomersTitle')}</div>
          <div className={`${styles.navCardIcon} ${styles.teal}`}><EntityIcon kind="customer" size={20} />
          </div>
        </div>
        <div className={styles.navCardStat}>{t('cardCustomersStat')}</div>
        <div className={styles.navCardCount}>{stats.customers} <span>{t('cardCustomersUnit')}</span></div>
      </div>

      {/* 3. KART: Araçlar */}
      <div 
        className={styles.navCard}
        onClick={() => openTab({ type: 'car', title: t('cardCarsTitle') })}
      >
        <div className={styles.navCardHeader}>
          <div className={styles.navCardTitle}>{t('cardCarsTitle')}</div>
          <div className={`${styles.navCardIcon} ${styles.amber}`}><EntityIcon kind="car" size={20} />
          </div>
        </div>
        <div className={styles.navCardStat}>{t('cardCarsStat')}</div>
        <div className={styles.navCardCount}>{stats.cars} <span>{t('cardCarsUnit')}</span></div>
      </div>
    </div>
    <section className={styles.recentSection}>
      <div className={styles.recentHeader}><strong>{t('recentServices')}</strong><button onClick={() => openTab({ type:'service', title:t('serviceListTitle') })}>{t('showAll')}</button></div>
      <div className={styles.recentScroll}>
        <table className={styles.recentTable}><thead><tr><th>{t("dashboardApplicationDate")}</th><th>{t("servicePlate")}</th><th>{t("dashboardUser")}</th><th>{t("dashboardComplaint")}</th><th>{t("serviceStatusSection")}</th></tr></thead>
        <tbody>{recent.map(service => <tr key={service.serviceId} onClick={() => service.serviceId && openTab({type:'service',title:cars.find(c=>c.carId===service.carId)?.plateNumber || 'Servis',entityId:service.serviceId,isProfile:true})}>
          <td>{service.applicationDate ? new Intl.DateTimeFormat(i18n.language, {dateStyle:'short'}).format(new Date(service.applicationDate)) : '—'}</td>
          <td>{cars.find(c=>c.carId===service.carId)?.plateNumber || '—'}</td>
          <td>{customers.find(c=>c.id===service.customerId)?.fullName || '—'}</td>
          <td title={service.complaints || ''}><span>{service.complaints || '—'}</span></td><td>{service.isDelivered ? t('serviceDelivered') : t('deliveryPending')}</td>
        </tr>)}{recent.length===0 && <tr><td colSpan={5}>{t("dashboardNoRecent")}</td></tr>}</tbody></table>
      </div>
    </section>
    </div>
  );
};

export default MainContent;