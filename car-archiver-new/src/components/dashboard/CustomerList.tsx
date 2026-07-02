import React, { useEffect, useState } from 'react';
import styles from './CustomerList.module.css';
import { CustomerViewDto } from '../../shared/dto\'s/customerDtos';
import { useTabStore } from '../../store/tabStore';

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerViewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { openTab } = useTabStore();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await (window as any).electron.ipcRenderer.invoke('get-all-customers');
        if (data && data.length > 0) {
          const sortedData = data.sort((a: CustomerViewDto, b: CustomerViewDto) => b.id - a.id);
          setCustomers(sortedData);
        } else {
          setCustomers([]);
        }
      } catch (error) {
        console.error("Müşteri listesi alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleViewProfile = (customer: CustomerViewDto) => {
    openTab({ type: 'customer', title: `${customer.fullName} Profili`, entityId: customer.id, isProfile: true });
  };

  const handleEditCustomer = (customer: CustomerViewDto) => {
    openTab({ type: 'customer', title: `${customer.fullName} Düzenle`, entityId: customer.id });
  };

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    const matchName = c.fullName.toLowerCase().includes(term);
    const matchNationalId = c.nationalId?.includes(term);
    const matchTaxNumber = c.taxNumber?.includes(term);
    const matchPhone = c.phones?.some(p => p.number.includes(term) || p.countryCode.includes(term));
    const matchEmail = c.emails?.some(e => e.address.toLowerCase().includes(term));

    return matchName || matchNationalId || matchTaxNumber || matchPhone || matchEmail;
  });

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.title}>Müşteri Listesi</div>
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="İsim, telefon, e-posta veya TC ile ara..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>AD SOYAD</th>
              <th>TELEFON</th>
              <th>E-POSTA</th>
              <th style={{ textAlign: 'right' }}>İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className={styles.emptyState}>Yükleniyor...</td></tr>
            ) : filteredCustomers.length === 0 ? (
              <tr><td colSpan={4} className={styles.emptyState}>Kayıt bulunamadı.</td></tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c.id} className={styles.tableRow} onDoubleClick={() => handleViewProfile(c)}>
                  <td style={{ fontWeight: 500 }}>{c.fullName}</td>
                  <td>
                    {c.phones && c.phones.length > 0 ? `${c.phones[0].countryCode} ${c.phones[0].number}` : '-'}
                    {c.phones && c.phones.length > 1 && <span style={{fontSize: '10px', marginLeft: '6px', color: 'var(--accent-blue)'}}>+{c.phones.length - 1}</span>}
                  </td>
                  <td>
                    {c.emails && c.emails.length > 0 ? c.emails[0].address : '-'}
                    {c.emails && c.emails.length > 1 && <span style={{fontSize: '10px', marginLeft: '6px', color: 'var(--accent-blue)'}}>+{c.emails.length - 1}</span>}
                  </td>
                  <td className={styles.actionsCell}>
                    <button className={styles.actionBtn} onClick={() => handleViewProfile(c)} title="Profili Görüntüle">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </button>
                    <button className={styles.actionBtn} onClick={() => handleEditCustomer(c)} title="Düzenle">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;