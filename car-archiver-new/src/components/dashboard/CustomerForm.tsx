import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import styles from './CustomerForm.module.css';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { capitalizeWordStarts } from '../../utils/textCapitalization';
import { useToastStore } from '../../store/toastStore';
import { useTabStore } from '../../store/tabStore'; // YENİ: Sekme kapatmak için
import type { IApiResponse } from '../../models/response.model';
import type { PhoneNumber } from '../../shared/types/customer/phoneNumber';
import type { Email } from '../../shared/types/customer/email';

interface PhoneInput { countryCode: string; number: string; }
interface EmailInput { address: string; }

const capitalizeFirstLetter = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toLocaleUpperCase('tr-TR') + value.slice(1);
};

const CustomerForm: React.FC<{ customerId?: number; tabId?: string }> = ({ customerId, tabId }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', nationalId: '', taxNumber: '', address: ''
  });
  
  const [phones, setPhones] = useState<PhoneInput[]>([{ countryCode: '', number: '' }]);
  const [emails, setEmails] = useState<EmailInput[]>([{ address: '' }]);
  
  // Silme Modalı için Stateler
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRelated, setDeleteRelated] = useState(false);

  const { addToast } = useToastStore();
  const { activeTabId, closeTab, openTab, setTabDirty } = useTabStore();
  const [initialSnapshot, setInitialSnapshot] = useState('');
  const formTabId = tabId ?? activeTabId;


  const snapshot = JSON.stringify({ formData, phones, emails });

  useEffect(() => {
    if (!initialSnapshot) return;
    setTabDirty(formTabId, snapshot !== initialSnapshot);
  }, [formTabId, initialSnapshot, setTabDirty, snapshot]);

  useEffect(() => {
    if (!customerId) {
      setInitialSnapshot(JSON.stringify({
        formData: { firstName: '', lastName: '', nationalId: '', taxNumber: '', address: '' },
        phones: [{ countryCode: '', number: '' }],
        emails: [{ address: '' }],
      }));
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      const fetchData = async () => {
        const res = await window.electron.ipcRenderer.invoke('get-customer-edit', customerId);
        if (res.success && res.data) {
          const d = res.data;
          setFormData({
            firstName: d.customer.firstName,
            lastName: d.customer.lastName || '',
            nationalId: d.customer.nationalId || '',
            taxNumber: d.customer.taxNumber || '',
            address: d.customer.address || ''
          });
          
          const nextPhones = d.phones && d.phones.length > 0 ? d.phones.map((p: PhoneNumber) => ({ countryCode: p.countryCode, number: p.phoneNumber })) : [{ countryCode: '', number: '' }];
          const nextEmails = d.emails && d.emails.length > 0 ? d.emails.map((e: Email) => ({ address: e.customerEmail })) : [{ address: '' }];
          setPhones(nextPhones);
          setEmails(nextEmails);
          setInitialSnapshot(JSON.stringify({
            formData: {
              firstName: d.customer.firstName,
              lastName: d.customer.lastName || '',
              nationalId: d.customer.nationalId || '',
              taxNumber: d.customer.taxNumber || '',
              address: d.customer.address || ''
            },
            phones: nextPhones,
            emails: nextEmails,
          }));
        }
      };
      fetchData();
    }
  }, [customerId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const nextValue = name === 'address'
      ? capitalizeWordStarts(value)
      : name === 'firstName' || name === 'lastName'
        ? capitalizeFirstLetter(value)
        : value;

    setFormData({ ...formData, [name]: nextValue });
  };

  const updatePhone = (index: number, field: keyof PhoneInput, value: string) => {
    const newPhones = [...phones];
    newPhones[index][field] = value;
    setPhones(newPhones);
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index].address = value;
    setEmails(newEmails);
  };

  const addPhone = () => setPhones([...phones, { countryCode: '', number: '' }]);
  const removePhone = (index: number) => setPhones(phones.filter((_, i) => i !== index));

  const addEmail = () => setEmails([...emails, { address: '' }]);
  const removeEmail = (index: number) => setEmails(emails.filter((_, i) => i !== index));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA') return;
      if (target.tagName === 'BUTTON' && (target as HTMLButtonElement).type === 'submit') {
        return;
      }
      e.preventDefault(); 
      const form = e.currentTarget;
      const focusableElements = form.querySelectorAll('input, button[type="submit"]');
      const focusableArray = Array.from(focusableElements) as HTMLElement[];
      const currentIndex = focusableArray.indexOf(target);
      if (currentIndex > -1 && currentIndex < focusableArray.length - 1) {
        focusableArray[currentIndex + 1].focus(); 
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName) {
      addToast(t('customerFirstRequired'), 'error');
      return;
    }

    if (phones.some(phone => phone.number.trim() && !/^\+\d{1,4}$/.test(phone.countryCode.trim()))) {
      addToast(t('phoneCountryRequired'), 'error');
      return;
    }
    const payload = {
      ...formData,
      phones: phones.filter(p => p.number.trim() !== ''),
      emails: emails.filter(e => e.address.trim() !== '')
    };

    try {
      let result: IApiResponse<number> | IApiResponse<null>;
      if (customerId) {
        const updatePayload = { id: customerId, data: payload };
        result = await window.electron.ipcRenderer.invoke('update-customer', updatePayload);
      } else {
        result = await window.electron.ipcRenderer.invoke('add-customer', payload);
      }
      
if (result.success) {
        setInitialSnapshot(snapshot);
        addToast(customerId ? t('customerUpdated') : t('customerCreated'), 'success');
        
        if (!customerId) {
          // YENİ KAYIT DURUMU: Backend'den dönen yeni müşterinin ID'sini alıyoruz
          // (Backend'in yapısına göre result.id, result.data.id veya result.data şeklinde gelebilir)
          const newCustomerId = result.data; 

          if (newCustomerId && typeof newCustomerId === 'number') {
            // 1. Yeni eklenen kişinin profil sekmesini aç
            openTab({ 
              type: 'customer', 
              title: `${formData.firstName} ${formData.lastName} · ${t("customerViewProfile")}`, 
              entityId: newCustomerId, 
              isProfile: true 
            });
            // 2. Şu anki "Yeni Kayıt" form sekmesini kapat
            closeTab(formTabId);
          } else {
            // Eğer backend'den yeni ID dönmezse (hata payı), formu temizleyip ekranda bırak
            setFormData({ firstName: '', lastName: '', nationalId: '', taxNumber: '', address: '' });
            setPhones([{ countryCode: '', number: '' }]);
            setEmails([{ address: '' }]);
            console.warn("Backend yeni oluşturulan müşterinin ID'sini döndürmediği için profile yönlendirilemedi.");
          }
        }
      } else {
        addToast(t('customerOperationFailed'), 'error');
      }
    } catch (error) {
      addToast(t('serviceUnexpectedError'), 'error');
    }
  };

  // --- SİLME İŞLEMLERİ ---
  const confirmDelete = async () => {
    if (!customerId) return;
    
    try {
      const result = await window.electron.ipcRenderer.invoke('delete-customer', {
        id: customerId,
        deleteRelated: deleteRelated
      });

      if (result.success) {
        const successMsg = deleteRelated 
          ? t('customerDeleteSuccessRelated') 
          : t('customerDeleteSuccess');
        
        addToast(successMsg, 'success');
        setIsDeleteModalOpen(false);
        closeTab(formTabId); // Sildikten sonra içindeysek sekmeyi direkt kapat!
      } else {
        addToast(t('customerDeleteFailed'), 'error');
      }
    } catch (error) {
      addToast(t('serviceUnexpectedError'), 'error');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>{customerId ? t("customerEditForm") : t("customerNewForm")}</div>
      
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className={styles.formWrapper}>
        
        <div className={styles.formGrid}>
          {/* ================= 1. KOLON ================= */}
          <div className={styles.column}>
            <div className={styles.sectionTitle}>{t("customerBasic")}</div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("customerFirstName")} *</label>
              <input className={styles.input} name="firstName" value={formData.firstName} onChange={handleTextChange} placeholder={t("customerFirstName")} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("customerLastName")}</label>
              <input className={styles.input} name="lastName" value={formData.lastName} onChange={handleTextChange} placeholder={t("customerLastName")} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("customerAddress")}</label>
              <textarea className={`${styles.input} ${styles.addressInput}`} name="address" value={formData.address} onChange={handleTextChange} rows={3} placeholder="123 Main Street, No. 8" style={{ resize: "vertical", lineHeight: 1.5 }} />
            </div>
            <div className={styles.sectionTitle} style={{ marginTop: '16px' }}>{t("customerOfficial")}</div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("customerNationalId")}</label>
              <input className={styles.input} name="nationalId" value={formData.nationalId} onChange={handleTextChange} placeholder={t("customerNationalId")} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("customerTaxId")}</label>
              <input className={styles.input} name="taxNumber" value={formData.taxNumber} onChange={handleTextChange} placeholder={t("customerTaxId")} />
            </div>
          </div>

          {/* ================= 2. KOLON ================= */}
          <div className={styles.column}>
            <div className={styles.sectionTitle}>{t("customerPhones")}</div>
            <div className={styles.formGroup}>
              {phones.map((phone, index) => (
                <div key={`phone-${index}`} className={styles.dynamicRow}>
                  <input className={`${styles.input} ${styles.shortInput}`} value={phone.countryCode} onChange={(e) => updatePhone(index, 'countryCode', e.target.value)} placeholder="+__" />
                  <input className={styles.input} value={phone.number} onChange={(e) => updatePhone(index, 'number', e.target.value)} placeholder="5XX XXX XX XX" />
                  {phones.length > 1 && (
                    <button type="button" onClick={() => removePhone(index)} className={`${styles.iconBtn} ${styles.danger}`}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addPhone} className={styles.addBtn}>+ {t("customerAddPhone")}</button>
            </div>
          </div>

          {/* ================= 3. KOLON ================= */}
          <div className={styles.column}>
            <div className={styles.sectionTitle}>{t("customerEmails")}</div>
            <div className={styles.formGroup}>
              {emails.map((email, index) => (
                <div key={`email-${index}`} className={styles.dynamicRow}>
                  <input type="email" className={styles.input} value={email.address} onChange={(e) => updateEmail(index, e.target.value)} placeholder="name@example.com" />
                  {emails.length > 1 && (
                    <button type="button" onClick={() => removeEmail(index)} className={`${styles.iconBtn} ${styles.danger}`}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addEmail} className={styles.addBtn}>+ {t("customerAddEmail")}</button>
            </div>
          </div>
        </div>

        {/* ================= ALT KISIM (BUTONLAR) ================= */}
        <div className={styles.formFooter}>
          
          {/* SOL TARAF: Silme ve Profile Gitme Butonları (Sadece Düzenleme Modunda) */}
          <div className={styles.footerLeftActions}>
            {customerId && (
              <>
                <button type="button" className={styles.deleteBtn} onClick={() => setIsDeleteModalOpen(true)}>
                  {t("customerDeleteTitle")}
                </button>
                <button 
                  type="button" 
                  className={styles.viewProfileBtn} 
                  onClick={() => {
                    openTab({ 
                      type: 'customer', 
                      title: `${formData.firstName} ${formData.lastName} · ${t("customerViewProfile")}`, 
                      entityId: customerId, 
                      isProfile: true 
                    });
                    closeTab(formTabId); // Düzenleme sekmesini kapatıp profili aç
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  {t("customerViewProfile")}
                </button>
              </>
            )}
          </div>
          
          {/* SAĞ TARAF: Kaydetme Butonu */}
          <button type="submit" className={styles.submitBtn}>
            {customerId ? t("customerUpdate") : t("customerSave")}
          </button>
          
        </div>
      </form>

      {isDeleteModalOpen && <DeleteConfirmDialog
        title={t("customerDeleteTitle")}
        option={t("customerDeleteRelated")}
        checked={deleteRelated}
        onCheckedChange={setDeleteRelated}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={() => void confirmDelete()}
      >{t("customerDeletePrompt")}</DeleteConfirmDialog>}

    </div>
  );
};

export default CustomerForm;