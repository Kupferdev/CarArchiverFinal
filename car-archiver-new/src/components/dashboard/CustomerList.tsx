import React, { useEffect, useState } from 'react';
import styles from './CustomerList.module.css';
import { Customer } from '../../shared/types/customer/customer';

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await (window as any).electron.ipcRenderer.invoke('get-all-customers');
        console.log("Arka uçtan gelen veriler:", data); // Konsoldan (F12) verinin gelip gelmediğini kontrol etmek için
        setCustomers(data || []);
      } catch (error) {
        console.error("Müşteri listesi alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Müşteri Listesi</div>
      </div>
      
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>AD SOYAD</th>
              <th>TC KİMLİK NO</th>
              <th>VERGİ NO</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className={styles.emptyState}>Yükleniyor...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyState}>Henüz kayıtlı müşteri bulunmuyor.</td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.customerId} className={styles.tableRow}>
                  <td>#{c.customerId}</td>
                  <td>{c.firstName} {c.lastName || ''}</td>
                  <td>{c.nationalId || '-'}</td>
                  <td>{c.taxNumber || '-'}</td>
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