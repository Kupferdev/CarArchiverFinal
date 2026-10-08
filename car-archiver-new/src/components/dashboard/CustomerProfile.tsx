import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./CustomerProfile.module.css";
import { useToastStore } from "../../store/toastStore";
import { useTabStore } from "../../store/tabStore";
import type { CustomerProfileDto } from "../../shared/ipcApi";
import type { Brand } from "../../shared/types/brand";

const CustomerProfile: React.FC<{ customerId: number }> = ({ customerId }) => {
  const [profile, setProfile] = useState<CustomerProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const { t } = useTranslation();

  // Silme Modalı için Stateler
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRelated, setDeleteRelated] = useState(false);

  const { addToast } = useToastStore();
  const { activeTabId, closeTab, openTab } = useTabStore();

  useEffect(() => {
    const fetchProfile = async () => {
      const [res, brandsRes] = await Promise.all([
        window.electron.ipcRenderer.invoke("get-customer-profile", customerId),
        window.electron.ipcRenderer.invoke("get-all-brands"),
      ]);
      if (res.success) setProfile(res.data ?? null);
      if (brandsRes.success) setBrands(brandsRes.data ?? []);
      setLoading(false);
    };
    fetchProfile();
  }, [customerId]);

  const brandMap = useMemo(() => new Map(brands.map((brand) => [brand.brandId, brand.brandName])), [brands]);

  const handleEditCustomer = () => {
    if (!profile) return;
    openTab({
      type: "customer",
      title: `${profile.customer.firstName} ${profile.customer.lastName} Düzenle`,
      entityId: customerId,
    });
  };

  // --- SİLME İŞLEMLERİ ---
  const confirmDelete = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke(
        "delete-customer",
        {
          id: customerId,
          deleteRelated: deleteRelated,
        },
      );

      if (result.success) {
        const successMsg = deleteRelated
          ? "Müşteri ve bağlı tüm kayıtları başarıyla silindi."
          : "Müşteri başarıyla silindi.";

        addToast(successMsg, "success");
        setIsDeleteModalOpen(false);
        closeTab(activeTabId); // Sildikten sonra sekmeyi direkt kapat!
      } else {
        addToast("Silme işlemi başarısız: " + result.message, "error");
      }
    } catch (error) {
      addToast("Beklenmeyen bir hata oluştu.", "error");
    }
  };

  if (loading)
    return <div className={styles.loading}>Profil Yükleniyor...</div>;
  if (!profile || !profile.customer)
    return <div className={styles.loading}>Müşteri bulunamadı.</div>;

  return (
    <div className={styles.container}>
      {/* SOL PANEL: Müşteri Kartı */}
      <aside className={styles.sidebar}>
        <div className={styles.customerName}>
          {profile.customer.firstName} {profile.customer.lastName}
        </div>

        <div className={styles.infoGroup}>
          <div className={styles.infoLabel}>Kimlik No</div>
          <div className={styles.infoValue}>
            {profile.customer.nationalId || "-"}
          </div>
        </div>
        <div className={styles.infoGroup}>
          <div className={styles.infoLabel}>Vergi No</div>
          <div className={styles.infoValue}>
            {profile.customer.taxNumber || "-"}
          </div>
        </div>

        {/* Telefonlar */}
        <div className={styles.sectionTitle}>Telefonlar</div>
        {profile.phones && profile.phones.length > 0 ? (
          profile.phones.map((p) => (
            <div key={p.phoneNumberId} className={styles.listItem}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              {p.countryCode} {p.phoneNumber}
            </div>
          ))
        ) : (
          <div className={styles.listItem}>Kayıtlı telefon yok.</div>
        )}

        {/* E-Postalar */}
        <div className={styles.sectionTitle}>E-Posta Adresleri</div>
        {profile.emails && profile.emails.length > 0 ? (
          profile.emails.map((e) => (
            <div key={e.emailId} className={styles.listItem}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              {e.customerEmail}
            </div>
          ))
        ) : (
          <div className={styles.listItem}>Kayıtlı e-posta yok.</div>
        )}

        {/* SOL PANEL ALT KISIM: SİLME BUTONU */}
        <div className={styles.sidebarActions}>
          <button
            className={styles.profileEditBtn}
            onClick={handleEditCustomer}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ marginRight: "8px" }}
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Bilgileri Düzenle
          </button>

          <button
            className={styles.profileDeleteBtn}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ marginRight: "8px" }}
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Müşteriyi Sil
          </button>
        </div>
      </aside>

      {/* SAĞ PANEL: Arabalar ve Servisler */}
      <div className={styles.mainContent}>
        {/* Arabalar Kartı */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>Müşterinin Araçları</span>
            <button
              className={styles.profileEditBtn}
              style={{ width: "auto", padding: "7px 12px" }}
              onClick={() => openTab({ type: "car", title: t("carNewTitle"), entityId: 999, parentEntityId: customerId })}
            >
              + {t("carNewButton")}
            </button>
          </div>
          {profile.cars && profile.cars.length > 0 ? (
            <div style={{ display: "grid", gap: "10px" }}>
              {profile.cars.map((car) => (
                <div
                  key={car.carId}
                  style={{ border: "1px solid var(--border-color)", borderRadius: "9px", padding: "14px", cursor: "pointer" }}
                  onDoubleClick={() => openTab({ type: "car", title: car.plateNumber || t("carProfileTitle"), entityId: car.carId, isProfile: true })}
                >
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-main)" }}>
                    {brandMap.get(car.brandId ?? 0) ?? "-"} {car.model ?? ""}
                  </div>
                  <div style={{ marginTop: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                    {car.plateNumber || "-"} · {car.year || "-"} · {car.km === null || car.km === undefined ? "-" : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(car.km)} km
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeOpacity="0.5"
              >
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                <circle cx="7" cy="17" r="2"></circle>
                <path d="M9 17h6"></path>
                <circle cx="17" cy="17" r="2"></circle>
              </svg>
              <span>Kayıtlı araç bulunmuyor.</span>
            </div>
          )}
        </div>

        {/* Servis Geçmişi Kartı */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>Servis Geçmişi</span>
            <button className={styles.profileEditBtn} style={{ width: "auto", padding: "7px 12px" }} onClick={() => openTab({ type: "service", title: t("serviceNewTitle"), entityId: 999 })}>+ {t("serviceNewButton")}</button>
          </div>
          {profile.services && profile.services.length > 0 ? (
            <div style={{ display: "grid", gap: "8px" }}>
              {[...profile.services].sort((a, b) => (b.applicationDate ? new Date(b.applicationDate).getTime() : 0) - (a.applicationDate ? new Date(a.applicationDate).getTime() : 0)).map((service) => (
                <button key={service.serviceId} type="button" onClick={() => openTab({ type: "service", title: `#${service.serviceId}`, entityId: service.serviceId, isProfile: true })} style={{ display: "grid", gridTemplateColumns: "90px minmax(0, 1fr) 20px", gap: "10px", alignItems: "center", width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "9px", background: "var(--bg-panel)", color: "var(--text-main)", textAlign: "left", cursor: "pointer" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{service.applicationDate ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "short" }).format(new Date(service.applicationDate)) : "-"}</span>
                  <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "3px" }}><strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "12px" }}>{service.complaints}</strong><small style={{ color: "var(--text-muted)", fontSize: "10px" }}>{service.km == null ? "-" : `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(service.km)} km`}</small></span>
                  <span style={{ color: "var(--text-muted)", fontSize: "18px" }}>›</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeOpacity="0.5"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
              <span>Daha önce servis kaydı açılmamış.</span>
            </div>
          )}
        </div>
      </div>

      {/* SİLME ONAY MODALI */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Müşteriyi Sil</h3>
            <p className={styles.modalText}>
              <strong>
                {profile.customer.firstName} {profile.customer.lastName}
              </strong>{" "}
              isimli müşteriyi silmek istediğinize emin misiniz? Bu işlem geri
              alınamaz.
            </p>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={deleteRelated}
                onChange={(e) => setDeleteRelated(e.target.checked)}
                className={styles.checkbox}
              />
              Müşteriye ait tüm araç ve servis kayıtlarını da sil.
            </label>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                İptal
              </button>
              <button
                className={styles.deleteConfirmBtn}
                onClick={confirmDelete}
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
