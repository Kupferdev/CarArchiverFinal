import React, { useState, useEffect, useRef } from 'react';
import type { Car } from '../../shared/types/car';
import type { Service } from '../../shared/types/service';
import type { CustomerViewDto } from '../../shared/dtos/customerDtos';
import { useTranslation } from 'react-i18next';
import styles from './Topbar.module.css';
import { useTabStore } from '../../store/tabStore';
import { EntityIcon } from '../common/EntityIcon';
import { useClockStyle } from '../../utils/clockPreferences';

const Topbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { openTab, setActiveTab } = useTabStore();
  const [time, setTime] = useState<string>('');
  const clockStyle = useClockStyle();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setFocused(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  const [cars, setCars] = useState<Car[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<CustomerViewDto[]>([]);
  useEffect(()=>{void Promise.all([
    window.electron.ipcRenderer.invoke('get-all-cars'),window.electron.ipcRenderer.invoke('get-all-services'),window.electron.ipcRenderer.invoke('get-all-customers')
  ]).then(([cs,ss,cu])=>{if(cs.success)setCars(cs.data??[]);if(ss.success)setServices(ss.data??[]);setCustomers(cu??[]);}).catch(console.error)},[]);
  useEffect(() => {
    if (!focused) return;
    void Promise.all([
      window.electron.ipcRenderer.invoke('get-all-cars'),
      window.electron.ipcRenderer.invoke('get-all-services'),
      window.electron.ipcRenderer.invoke('get-all-customers')
    ]).then(([cs,ss,cu]) => {
      if (cs.success) setCars(cs.data ?? []);
      if (ss.success) setServices(ss.data ?? []);
      setCustomers(cu ?? []);
    }).catch(console.error);
  }, [focused]);
  const term=query.trim().toLocaleLowerCase(i18n.language);
  const matchedCars=term?cars.filter(c=>[c.plateNumber,c.vinNumber,c.model].join(' ').toLocaleLowerCase(i18n.language).includes(term)).slice(0,5):[];
  const matchedCustomers=term?customers.filter(c=>[c.fullName,...(c.phones??[]).map(p=>p.number),...(c.emails??[]).map(e=>e.address)].join(' ').toLocaleLowerCase(i18n.language).includes(term)).slice(0,5):[];
  const matchedServices=term?services.filter(s=>[s.complaints,s.extraRequests,s.faults?.join(' '),cars.find(c=>c.carId===s.carId)?.plateNumber].join(' ').toLocaleLowerCase(i18n.language).includes(term)).slice(0,5):[];
  const done=()=>{setFocused(false);setQuery('');};
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', weekday: 'long' }));
    };

    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    return () => clearInterval(intervalId);
  }, [i18n.language]);

  return (
    <div className={styles.topbar}>
      <div className={styles.brandWrap}>
        {/* Only the logo is a Home button. The visible app title stays a
            draggable Windows caption, even when the search occupies the bar. */}
        <button type="button" className={styles.brandHome} onClick={() => setActiveTab('home')} aria-label="Car Service Archiver — Home">
          <span className={styles.appIcon}>
            <img src="/car-archiver-logo.svg" alt="" draggable={false} onDragStart={(event) => event.preventDefault()} style={{width:28,height:28}} />
          </span>
        </button>
        <div className={styles.appTitle}>Car Service Archiver</div>
      </div>

      <div className={styles.searchWrap} ref={searchRef}>
        <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input className={styles.searchInput} placeholder={t('searchPlaceholder')} value={query} onChange={e=>setQuery(e.target.value)} onFocus={()=>setFocused(true)} onClick={()=>setFocused(true)} onKeyDown={e=>{if(e.key==='Escape')done()}} />
        {focused && term && <div className={styles.searchResults}>
          <div className={styles.resultHeading}>{t('searchCars')}</div>
          {matchedCars.map(c=><button key={c.carId} onMouseDown={e=>e.preventDefault()} onClick={()=>{openTab({type:'car',title:c.plateNumber||t('carLabel'),entityId:c.carId,isProfile:true});done()}}><span>{c.plateNumber} · {c.model}</span><EntityIcon kind="car" size={16} /></button>)}
          <div className={styles.resultHeading}>{t('searchCustomers')}</div>
          {matchedCustomers.map(c=><button key={c.id} onMouseDown={e=>e.preventDefault()} onClick={()=>{openTab({type:'customer',title:c.fullName,entityId:c.id,isProfile:true});done()}}><span>{c.fullName}</span><EntityIcon kind="customer" size={16} /></button>)}
          <div className={styles.resultHeading}>{t('searchServices')}</div>
          {matchedServices.map(s=><button key={s.serviceId} onMouseDown={e=>e.preventDefault()} onClick={()=>{openTab({type:'service',title:cars.find(c=>c.carId===s.carId)?.plateNumber||t('serviceListTitle'),entityId:s.serviceId,isProfile:true});done()}}><span>{cars.find(c=>c.carId===s.carId)?.plateNumber||'—'} · {s.complaints||'—'}</span><EntityIcon kind="service" size={16} /></button>)}
          {matchedCars.length+matchedCustomers.length+matchedServices.length===0 && <div className={styles.resultHeading}>{t('searchEmpty')}</div>}
        </div>}
      </div>

      {/* Guaranteed blank caption area: the search and logo must stay usable. */}
      <div className={styles.headerDragArea} aria-hidden="true" />

      <div className={`${styles.clock} ${styles['clock_'+clockStyle]}`}>
        {clockStyle==='clock' && <span aria-hidden="true" className={styles.clockGlyph}>◷</span>}
        <div className={styles.clockTime}>{time}</div>
        <div className={styles.clockDate}>{clockStyle==='compact' ? new Date().toLocaleDateString(i18n.language) : date}</div>
      </div>
    </div>
  );
};

export default Topbar;
