import React, { useEffect, useState, useCallback } from 'react';
import styles from './CustomerList.module.css';
import { CustomerViewDto } from '../../shared/dto\'s/customerDtos';
import { useTabStore } from '../../store/tabStore';
import { useToastStore } from '../../store/toastStore';

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerViewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ÇOKLU SEÇİM STATELERİ
  const [isSelectionMode, setIsSelectionMode] = useState(false); // YENİ: Seçim Modu
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);

  // Modal Stateleri
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerViewDto | null>(null);
  const [deleteRelated, setDeleteRelated] = useState(false);

  const { openTab } = useTabStore();
  const { addToast } = useToastStore();

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await (window as any).electron.ipcRenderer.invoke('get-all-customers');
      if (data && data.length > 0) {
        const sortedData = data.sort((a: CustomerViewDto, b: CustomerViewDto) => b.id - a.id);
        setCustomers(sortedData);
      } else {
        setCustomers([]);
      }
      setSelectedIds([]); 
      setIsSelectionMode(false); // Veri yenilenince seçim modunu da kapat
    } catch (error) {
      console.error("Müşteri listesi alınamadı:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleViewProfile = (customer: CustomerViewDto) => {
    openTab({ type: 'customer', title: `${customer.fullName} Profili`, entityId: customer.id, isProfile: true });
  };

  const handleEditCustomer = (customer: CustomerViewDto) => {
    openTab({ type: 'customer', title: `${customer.fullName} Düzenle`, entityId: customer.id });
  };

  const handleAddCustomer = () => {
    openTab({ type: 'customer', title: 'Yeni Müşteri', entityId: 999 });
  };

  // --- ÇOKLU SEÇİM METOTLARI ---
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds([]); // Moddan çıkarken veya girerken seçimleri sıfırla
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredCustomers.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const openDeleteModal = (customer: CustomerViewDto) => {
    setCustomerToDelete(customer);
    setIsBulkDeleteMode(false);
    setDeleteRelated(false);
    setIsDeleteModalOpen(true);
  };

  const openBulkDeleteModal = () => {
    setIsBulkDeleteMode(true);
    setDeleteRelated(false);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCustomerToDelete(null);
    setIsBulkDeleteMode(false);
  };

  const confirmDelete = async () => {
    try {
      if (isBulkDeleteMode) {
        // TOPLU SİLME
        const result = await (window as any).electron.ipcRenderer.invoke('delete-customers-bulk', {
          ids: selectedIds,
          deleteRelated: deleteRelated
        });

        if (result.success) {
          const successMsg = deleteRelated 
            ? `${selectedIds.length} müşteri ve bağlı kayıtları silindi.` 
            : `${selectedIds.length} müşteri başarıyla silindi.`;
          addToast(successMsg, 'success');
          
          setIsSelectionMode(false); // Silme başarılıysa seçim modunu kapat
          setSelectedIds([]);
        } else {
          addToast('Toplu silme başarısız: ' + result.message, 'error');
        }

      } else {
        // TEKLİ SİLME
        if (!customerToDelete) return;
        const result = await (window as any).electron.ipcRenderer.invoke('delete-customer', {
          id: customerToDelete.id,
          deleteRelated: deleteRelated
        });

        if (result.success) {
          const successMsg = deleteRelated 
            ? 'Müşteri ve bağlı tüm kayıtları başarıyla silindi.' 
            : 'Müşteri başarıyla silindi.';
          addToast(successMsg, 'success');
        } else {
          addToast('Silme işlemi başarısız: ' + result.message, 'error');
        }
      }

      fetchCustomers();
      closeDeleteModal();
    } catch (error) {
      console.error(error);
      addToast('Beklenmeyen bir hata oluştu.', 'error');
    }
  };

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return c.fullName.toLowerCase().includes(term) || 
           c.nationalId?.includes(term) || 
           c.taxNumber?.includes(term) || 
           c.phones?.some(p => p.number.includes(term) || p.countryCode.includes(term)) || 
           c.emails?.some(e => e.address.toLowerCase().includes(term));
  });

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.title}>Müşteri Listesi</div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          
{/* SEÇİM MODU AÇIKSA GÖSTERİLECEK BUTONLAR */}
          {isSelectionMode ? (
            <>
              {selectedIds.length > 0 && (
                <button className={`${styles.actionBtn} ${styles.bulkDeleteIconBtn}`} onClick={openBulkDeleteModal} title="Seçilenleri Sil">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  <span style={{ marginLeft: '6px', fontSize: '13px', fontWeight: 600 }}>{selectedIds.length}</span>
                </button>
              )}
              {/* VAZGEÇ (KUTU İÇİNDE ÇARPI İKONU) */}
              <button className={`${styles.selectionModeBtn} ${styles.cancelIconBtn}`} onClick={toggleSelectionMode} title="Seçim Modunu Kapat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                </svg>
              </button>
            </>
          ) : (
            /* SEÇİM MODU KAPALIYSA (KUTU İÇİNDE TİK İKONU) */
            <button className={styles.selectionModeBtn} onClick={toggleSelectionMode} title="Çoklu Seçim Modu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </button>
          )}

          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="İsim, telefon, e-posta ile ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className={styles.addNewBtn} onClick={handleAddCustomer}>
            + Yeni Müşteri
          </button>
        </div>
      </div>
      
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {/* SADECE SEÇİM MODU AÇIKSA CHECKBOX SÜTUNUNU GÖSTER */}
              {isSelectionMode && (
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    className={styles.rowCheckbox}
                    checked={filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              <th>AD SOYAD</th>
              <th>TELEFON</th>
              <th>E-POSTA</th>
              <th style={{ textAlign: 'right' }}>İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isSelectionMode ? 5 : 4} className={styles.emptyState}>Yükleniyor...</td></tr>
            ) : filteredCustomers.length === 0 ? (
              <tr><td colSpan={isSelectionMode ? 5 : 4} className={styles.emptyState}>Kayıt bulunamadı.</td></tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c.id} className={`${styles.tableRow} ${selectedIds.includes(c.id) ? styles.selectedRow : ''}`} onDoubleClick={() => handleViewProfile(c)}>
                  
                  {/* SADECE SEÇİM MODU AÇIKSA CHECKBOX'I GÖSTER */}
                  {isSelectionMode && (
                    <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className={styles.rowCheckbox}
                        checked={selectedIds.includes(c.id)}
                        onChange={() => toggleSelectOne(c.id)}
                      />
                    </td>
                  )}

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
                    {/* Tekli Silme Butonu (Seçim Modunda Bile Görünebilir) */}
                    <button className={`${styles.actionBtn} ${styles.deleteIconBtn}`} onClick={() => openDeleteModal(c)} title="Sil">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>{isBulkDeleteMode ? 'Toplu Silme İşlemi' : 'Müşteriyi Sil'}</h3>
            <p className={styles.modalText}>
              {isBulkDeleteMode 
                ? `${selectedIds.length} adet müşteriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
                : <strong>{customerToDelete?.fullName}</strong>} {isBulkDeleteMode ? '' : 'isimli müşteriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'}
            </p>
            
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={deleteRelated} 
                onChange={(e) => setDeleteRelated(e.target.checked)} 
                className={styles.checkbox}
              />
              Müşteri(ler)e ait tüm araç ve servis kayıtlarını da sil.
            </label>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={closeDeleteModal}>İptal</button>
              <button className={styles.deleteConfirmBtn} onClick={confirmDelete}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;