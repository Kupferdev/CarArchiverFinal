import { ProfileActions } from "../common/ProfileActions";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./CustomerProfile.module.css";
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { useToastStore } from "../../store/toastStore";
import { useTabStore } from "../../store/tabStore";
import type { CustomerProfileDto } from "../../shared/ipcApi";
import type { Brand } from "../../shared/types/brand";

const CustomerProfile: React.FC<{ customerId: number }> = ({ customerId }) => {
  const [profile, setProfile] = useState<CustomerProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const { t, i18n } = useTranslation();

  // Silme Modalı için Stateler
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRelated, setDeleteRelated] = useState(false);

  const { addToast } = useToastStore();
  const { activeTabId, closeTab, openTab, renameTab } = useTabStore();

  useEffect(() => {
    const fetchProfile = async () => {
      const [res, brandsRes] = await Promise.all([
        window.electron.ipcRenderer.invoke("get-customer-profile", customerId),
        window.electron.ipcRenderer.invoke("get-all-brands"),
      ]);
      if (res.success) {
        setProfile(res.data ?? null);
        if (res.data?.customer) {
          const profileTab = useTabStore.getState().tabs.find(tab => tab.type === "customer" && tab.entityId === customerId && tab.isProfile);
          if (profileTab) renameTab(profileTab.id, [res.data.customer.firstName, res.data.customer.lastName].filter(Boolean).join(" "));
        }
      }
      if (brandsRes.success) setBrands(brandsRes.data ?? []);
      setLoading(false);
    };
    fetchProfile();
  }, [customerId, renameTab]);

  const brandMap = useMemo(() => new Map(brands.map((brand) => [brand.brandId, brand.brandName])), [brands]);

  const handleEditCustomer = () => {
    if (!profile) return;
    openTab({
      type: "customer",
      title: `${profile.customer.firstName} ${profile.customer.lastName} · ${t("customerEdit")}`,
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
          ? t('customerDeleteSuccessRelated')
          : t('customerDeleteSuccess');

        addToast(successMsg, "success");
        setIsDeleteModalOpen(false);
        closeTab(activeTabId); // Sildikten sonra sekmeyi direkt kapat!
      } else {
        addToast(t('customerDeleteFailed'), 'error');
      }
    } catch (error) {
      addToast(t('serviceUnexpectedError'), 'error');
    }
  };

  if (loading)
    return <div className={styles.loading}>{t("customerLoading")}</div>;
  if (!profile || !profile.customer)
    return <div className={styles.loading}>{t("customerNotFound")}</div>;

  return (
    <div className={styles.container}>
      {/* SOL PANEL: Müşteri Kartı */}
      <aside className={styles.sidebar}>
        <div className={styles.customerName}>
          {profile.customer.firstName} {profile.customer.lastName}
        </div>

        <div className={styles.infoGroup}>
          <div className={styles.infoLabel}>{t("customerNationalId")}</div>
          <div className={styles.infoValue}>
            {profile.customer.nationalId || "-"}
          </div>
        </div>
        <div className={styles.infoGroup}>
          <div className={styles.infoLabel}>{t("customerTaxId")}</div>
          <div className={styles.infoValue}>
            {profile.customer.taxNumber || "-"}
          </div>
        </div>

        <div className={styles.infoGroup}>
          <div className={styles.infoLabel}>{t("customerAddress")}</div>
          <div className={styles.infoValue} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{profile.customer.address || "-"}</div>
        </div>

        {/* Telefonlar */}
        <div className={styles.sectionTitle}>{t("customerPhones")}</div>
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
          <div className={styles.listItem}>{t("customerNoRecords")}</div>
        )}

        {/* E-Postalar */}
        <div className={styles.sectionTitle}>{t("customerEmails")}</div>
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
          <div className={styles.listItem}>{t("customerNoRecords")}</div>
        )}

        {/* SOL PANEL ALT KISIM: SİLME BUTONU */}
        <ProfileActions
          onEdit={handleEditCustomer}
          onDelete={() => setIsDeleteModalOpen(true)}
          deleteLabel={t("customerDelete")}
        />
      </aside>

      {/* SAĞ PANEL: Arabalar ve Servisler */}
      <div className={styles.mainContent}>
        {/* Arabalar Kartı */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>{t("customerVehicles")}</span>
            <div className={styles.headerActions}><button className={styles.profileEditBtn} style={{ width: "auto", padding: "7px 12px" }} onClick={() => openTab({ type: "car", title: `${profile.customer?.firstName ?? ''} Araç Listesi`, contextCustomerId: customerId, contextLabel: [profile.customer?.firstName, profile.customer?.lastName].filter(Boolean).join(' ') })}>{t('showAll')}</button>
            <button
              className={styles.profileEditBtn}
              style={{ width: "auto", padding: "7px 12px" }}
              onClick={() => openTab({ type: "car", title: t("carNewTitle"), entityId: 999, parentEntityId: customerId })}
            >
              + {t("carNewButton")}
            </button></div>
          </div>
          {profile.cars && profile.cars.length > 0 ? (
            <div style={{ display: "grid", gap: "10px" }}>
              {profile.cars.map((car) => (
                <div
                  key={car.carId}
                  style={{ border: "1px solid var(--border-color)", borderRadius: "9px", padding: "14px", cursor: "pointer" }}
                  onDoubleClick={() => openTab({ type: "car", title: car.plateNumber || t("carProfileTitle"), entityId: car.carId, isProfile: true })}
                >
                  <div style={{ fontSize: 'calc(15px * var(--user-font-factor, 1))', fontWeight: 600, color: "var(--text-main)" }}>
                    {brandMap.get(car.brandId ?? 0) ?? "-"} {car.model ?? ""}
                  </div>
                  <div style={{ marginTop: "6px", fontSize: 'calc(12px * var(--user-font-factor, 1))', color: "var(--text-muted)" }}>
                    {car.plateNumber || "-"} · {car.year || "-"} · {car.km === null || car.km === undefined ? "-" : new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 }).format(car.km)} km
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
              <span>{t("customerNoVehicles")}</span>
            </div>
          )}
        </div>

        {/* Servis Geçmişi Kartı */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>{t("carServiceHistory")}</span>
            <div className={styles.headerActions}><button className={styles.profileEditBtn} style={{ width: "auto", padding: "7px 12px" }} onClick={() => openTab({ type: "service", title: t("serviceListTitle"), contextCustomerId: customerId, contextLabel: [profile.customer?.firstName, profile.customer?.lastName].filter(Boolean).join(' ') })}>{t('showAll')}</button>
            <button className={styles.profileEditBtn} style={{ width: "auto", padding: "7px 12px" }} onClick={() => openTab({ type: "service", title: t("serviceNewTitle"), entityId: 999, contextCustomerId: customerId })}>+ {t("serviceNewButton")}</button></div>
          </div>
          {profile.services && profile.services.length > 0 ? (
            <div style={{ display: "grid", gap: "8px" }}>
              {[...profile.services].sort((a, b) => (b.applicationDate ? new Date(b.applicationDate).getTime() : 0) - (a.applicationDate ? new Date(a.applicationDate).getTime() : 0)).map((service) => (
                <button key={service.serviceId} type="button" onClick={() => openTab({ type: "service", title: `#${service.serviceId}`, entityId: service.serviceId, isProfile: true })} style={{ display: "grid", gridTemplateColumns: "90px minmax(0, 1fr) 20px", gap: "10px", alignItems: "center", width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "9px", background: "var(--bg-panel)", color: "var(--text-main)", textAlign: "left", cursor: "pointer" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 'calc(11px * var(--user-font-factor, 1))' }}>{service.applicationDate ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "short" }).format(new Date(service.applicationDate)) : "-"}</span>
                  <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "3px" }}><strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 'calc(12px * var(--user-font-factor, 1))' }}>{service.complaints || "—"}</strong><small style={{ color: "var(--text-muted)", fontSize: 'calc(10px * var(--user-font-factor, 1))' }}>{service.km == null ? "-" : `${new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 }).format(service.km)} km`}</small></span>
                  <span style={{ color: "var(--text-muted)", fontSize: 'calc(18px * var(--user-font-factor, 1))' }}>›</span>
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
              <span>{t("customerNoServices")}</span>
            </div>
          )}
        </div>
      </div>

      {isDeleteModalOpen && <DeleteConfirmDialog
        title={t("customerDeleteTitle")}
        option={t("customerDeleteRelated")}
        checked={deleteRelated}
        onCheckedChange={setDeleteRelated}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={() => void confirmDelete()}
      >{t("customerDeleteCustomerPrompt", { name: [profile.customer.firstName, profile.customer.lastName].filter(Boolean).join(" ") })}</DeleteConfirmDialog>}

    </div>
  );
};

export default CustomerProfile;
