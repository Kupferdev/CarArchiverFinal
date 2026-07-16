import React, { useState, useEffect } from 'react';
import styles from './CustomerForm.module.css';

interface PhoneInput { countryCode: string; number: string; }
interface EmailInput { address: string; }

const CustomerForm: React.FC<{ customerId?: number }> = ({ customerId }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', nationalId: '', taxNumber: ''
  });
  
  const [phones, setPhones] = useState<PhoneInput[]>([{ countryCode: '+90', number: '' }]);
  const [emails, setEmails] = useState<EmailInput[]>([{ address: '' }]);
  
  const [status, setStatus] = useState<{type: 'success' | 'error' | '', msg: string}>({ type: '', msg: '' });

  useEffect(() => {
    if (customerId) {
      const fetchData = async () => {
        const res = await (window as any).electron.ipcRenderer.invoke('get-customer-edit', customerId);
        if (res.success && res.data) {
          const d = res.data;
          setFormData({
            firstName: d.customer.firstName,
            lastName: d.customer.lastName || '',
            nationalId: d.customer.nationalId || '',
            taxNumber: d.customer.taxNumber || ''
          });
          
          if (d.phones && d.phones.length > 0) {
            setPhones(d.phones.map((p: any) => ({ countryCode: p.countryCode, number: p.phoneNumber })));
          }
          if (d.emails && d.emails.length > 0) {
            setEmails(d.emails.map((e: any) => ({ address: e.customerEmail })));
          }
        }
      };
      fetchData();
    }
  }, [customerId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const addPhone = () => setPhones([...phones, { countryCode: '+90', number: '' }]);
  const removePhone = (index: number) => setPhones(phones.filter((_, i) => i !== index));

  const addEmail = () => setEmails([...emails, { address: '' }]);
  const removeEmail = (index: number) => setEmails(emails.filter((_, i) => i !== index));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      
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
    setStatus({ type: '', msg: '' });

    if (!formData.firstName) {
      setStatus({ type: 'error', msg: 'Ad alanı zorunludur!' });
      return;
    }

    const payload = {
      ...formData,
      phones: phones.filter(p => p.number.trim() !== ''),
      emails: emails.filter(e => e.address.trim() !== '')
    };

    try {
      let result;
      if (customerId) {
        const updatePayload = { id: customerId, data: payload };
        result = await (window as any).electron.ipcRenderer.invoke('update-customer', updatePayload);
      } else {
        result = await (window as any).electron.ipcRenderer.invoke('add-customer', payload);
      }
      
      if (result.success) {
        setStatus({ type: 'success', msg: customerId ? 'Müşteri başarıyla güncellendi!' : 'Müşteri başarıyla eklendi!' });
        
        if (!customerId) {
          setFormData({ firstName: '', lastName: '', nationalId: '', taxNumber: '' });
          setPhones([{ countryCode: '+90', number: '' }]);
          setEmails([{ address: '' }]);
        }
      } else {
        setStatus({ type: 'error', msg: 'İşlem başarısız: ' + result.message });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'Bir hata oluştu.' });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>{customerId ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}</div>
      
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className={styles.formWrapper}>
        
        <div className={styles.formGrid}>
          
          {/* ================= 1. KOLON (Temel ve Resmi Bilgiler) ================= */}
          <div className={styles.column}>
            <div className={styles.sectionTitle}>Temel Bilgiler</div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Ad *</label>
              <input className={styles.input} name="firstName" value={formData.firstName} onChange={handleTextChange} placeholder="Müşteri adı" />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Soyad</label>
              <input className={styles.input} name="lastName" value={formData.lastName} onChange={handleTextChange} placeholder="Müşteri soyadı" />
            </div>

            <div className={styles.sectionTitle} style={{ marginTop: '16px' }}>Resmi Bilgiler</div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Kimlik No</label>
              <input className={styles.input} name="nationalId" value={formData.nationalId} onChange={handleTextChange} placeholder="11 Haneli" maxLength={11} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Vergi No</label>
              <input className={styles.input} name="taxNumber" value={formData.taxNumber} onChange={handleTextChange} placeholder="Kurumsal" />
            </div>
          </div>

          {/* ================= 2. KOLON (Telefon Numaraları) ================= */}
          <div className={styles.column}>
            <div className={styles.sectionTitle}>Telefon Numaraları</div>
            
            <div className={styles.formGroup}>
              {phones.map((phone, index) => (
                <div key={`phone-${index}`} className={styles.dynamicRow}>
                  <input className={`${styles.input} ${styles.shortInput}`} value={phone.countryCode} onChange={(e) => updatePhone(index, 'countryCode', e.target.value)} placeholder="+90" />
                  <input className={styles.input} value={phone.number} onChange={(e) => updatePhone(index, 'number', e.target.value)} placeholder="5XX XXX XX XX" />
                  {phones.length > 1 && (
                    <button type="button" onClick={() => removePhone(index)} className={`${styles.iconBtn} ${styles.danger}`}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addPhone} className={styles.addBtn}>+ Telefon Ekle</button>
            </div>
          </div>

          {/* ================= 3. KOLON (E-Posta Adresleri) ================= */}
          <div className={styles.column}>
            <div className={styles.sectionTitle}>E-Posta Adresleri</div>
            
            <div className={styles.formGroup}>
              {emails.map((email, index) => (
                <div key={`email-${index}`} className={styles.dynamicRow}>
                  <input type="email" className={styles.input} value={email.address} onChange={(e) => updateEmail(index, e.target.value)} placeholder="ornek@mail.com" />
                  {emails.length > 1 && (
                    <button type="button" onClick={() => removeEmail(index)} className={`${styles.iconBtn} ${styles.danger}`}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addEmail} className={styles.addBtn}>+ E-Posta Ekle</button>
            </div>
          </div>

        </div>

        {/* ================= ALT KISIM (Buton ve Hata Mesajı) ================= */}
        <div className={styles.formFooter}>
          {status.msg && (
            <div className={`${styles.message} ${styles[status.type]}`}>
              {status.msg}
            </div>
          )}
          <button type="submit" className={styles.submitBtn}>
            {customerId ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
        
      </form>
    </div>
  );
};

export default CustomerForm;