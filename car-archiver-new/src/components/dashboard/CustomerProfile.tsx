import React, { useEffect, useState } from 'react';
import styles from './CustomerProfile.module.css';

const CustomerProfile: React.FC<{ customerId: number }> = ({ customerId }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await (window as any).electron.ipcRenderer.invoke('get-customer-profile', customerId);
      if (res.success) {
        setProfile(res.data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [customerId]);

  if (loading) return <div className={styles.loading}>Profil Yükleniyor...</div>;
  if (!profile || !profile.customer) return <div className={styles.loading}>Müşteri bulunamadı.</div>;

  return (
    <div className={styles.container}>
      {/* SOL PANEL: Müşteri Kartı */}
      <aside className={styles.sidebar}>
        <div className={styles.customerName}>
          {profile.customer.firstName} {profile.customer.lastName}
        </div>
        
        <div className={styles.infoGroup}>
          <div className={styles.infoLabel}>Kimlik No</div>
          <div className={styles.infoValue}>{profile.customer.nationalId || '-'}</div>
        </div>
        <div className={styles.infoGroup}>
          <div className={styles.infoLabel}>Vergi No</div>
          <div className={styles.infoValue}>{profile.customer.taxNumber || '-'}</div>
        </div>

        {/* Telefonlar */}
        <div className={styles.sectionTitle}>Telefonlar</div>
        {profile.phones && profile.phones.length > 0 ? (
          profile.phones.map((p: any) => (
            <div key={p.phoneNumberId} className={styles.listItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              {p.countryCode} {p.phoneNumber}
            </div>
          ))
        ) : (
          <div className={styles.listItem}>Kayıtlı telefon yok.</div>
        )}

        {/* E-Postalar */}
        <div className={styles.sectionTitle}>E-Posta Adresleri</div>
        {profile.emails && profile.emails.length > 0 ? (
          profile.emails.map((e: any) => (
            <div key={e.emailId} className={styles.listItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              {e.customerEmail}
            </div>
          ))
        ) : (
          <div className={styles.listItem}>Kayıtlı e-posta yok.</div>
        )}
      </aside>

      {/* SAĞ PANEL: Arabalar ve Servisler */}
      <div className={styles.mainContent}>
        
        {/* Arabalar Kartı */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>Müşteri Arabaları</div>
          {profile.cars && profile.cars.length > 0 ? (
            <div>Araba listesi buraya gelecek...</div>
          ) : (
            <div className={styles.emptyState}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>
              <span>Kayıtlı araba bulunmuyor.</span>
            </div>
          )}
        </div>

        {/* Servis Geçmişi Kartı */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>Servis Geçmişi</div>
          {profile.services && profile.services.length > 0 ? (
            <div>Servis listesi buraya gelecek...</div>
          ) : (
            <div className={styles.emptyState}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
              <span>Daha önce servis kaydı açılmamış.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerProfile;