import React, { useEffect, useState } from 'react';
import styles from './ToastContainer.module.css';
import { useToastStore, ToastType } from '../../store/toastStore';

// Her bir bildirim kendi süresini ve animasyonunu kendi yönetsin diye alt bileşen yaptık
const ToastItem: React.FC<{ id: string; message: string; type: ToastType; onRemove: (id: string) => void }> = ({ id, message, type, onRemove }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 5 saniye sonra "ayrılıyor" (leaving) durumuna geç
    const timer = setTimeout(() => {
      setIsLeaving(true);
    }, 5000); 

    return () => clearTimeout(timer);
  }, []);

  // Animasyon (slideDown) bittiği an DOM'dan (Store'dan) tamamen sil
  const handleAnimationEnd = () => {
    if (isLeaving) {
      onRemove(id);
    }
  };

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${isLeaving ? styles.leaving : ''}`}
      onClick={() => setIsLeaving(true)} // Tıklanınca direk geri gitme animasyonunu başlatır
      onAnimationEnd={handleAnimationEnd}
      title="Kapatmak için tıklayın"
    >
      <span>{message}</span>
    </div>
  );
};


const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;