import React, { useEffect, useState } from 'react';
import styles from './CustomerProfile.module.css';

const CustomerProfile: React.FC<{ customerId?: number }> = ({ customerId }) => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!customerId) return;

    // useEffect içinde await kullanabilmek için iç içe bir async fonksiyon yazıyoruz
    const fetchProfile = async () => {
      try {
        const response = await (window as any).electron.ipcRenderer.invoke('get-customer-profile', customerId);
        
        if (response && response.success) {
          setProfile(response.data); // data'yı state'e atadık (kullanılmama uyarısı gitti)
        }
      } catch (error) {
        console.error("Profil çekilirken hata oluştu:", error);
      }
    };

    fetchProfile();
  }, [customerId]);

  if (!profile) return <div style={{ padding: '20px' }}>Yükleniyor...</div>;

  return (
    <div className={styles.profileContainer}>
      <aside className={styles.sidebar}>
        <h3>{profile.customer.firstName} {profile.customer.lastName}</h3>
        <p>Kimlik No: {profile.customer.nationalId || '-'}</p>
        <p>Vergi No: {profile.customer.taxNumber || '-'}</p>

        {/* TELEFONLAR */}
        <div style={{ marginTop: '24px' }}>
          <h5 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
            Telefonlar
          </h5>
          {profile.phones && profile.phones.length > 0 ? (
            profile.phones.map((p: any) => (
              <div key={p.phoneNumberId} style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {p.countryCode} {p.phoneNumber}
              </div>
            ))
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Kayıtlı telefon yok.</div>
          )}
        </div>

        {/* E-POSTALAR */}
        <div style={{ marginTop: '16px' }}>
          <h5 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
            E-Posta Adresleri
          </h5>
          {profile.emails && profile.emails.length > 0 ? (
            profile.emails.map((e: any) => (
              <div key={e.emailId} style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {e.customerEmail}
              </div>
            ))
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Kayıtlı e-posta yok.</div>
          )}
        </div>
      </aside>

      <main className={styles.content}>
        <section>
          <h4>Müşteri Arabaları</h4>
          {profile.cars && profile.cars.length > 0 ? (
            profile.cars.map((car: any) => (
              <div key={car.carId} className={styles.card}>{car.brand} - {car.model}</div>
            ))
          ) : (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Kayıtlı araba yok.</p>
          )}
        </section>

        <section>
          <h4>Servis Geçmişi</h4>
          {profile.services && profile.services.length > 0 ? (
            profile.services.map((service: any) => (
              <div key={service.serviceId} className={styles.card}>
                Servis Tarihi: {service.date} - Detay: {service.description}
              </div>
            ))
          ) : (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Servis kaydı yok.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default CustomerProfile; // Default export hatasını çözer