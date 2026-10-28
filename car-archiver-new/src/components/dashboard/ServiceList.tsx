import { BulkSelectionActions } from "../common/BulkSelectionActions";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ServiceList.module.css";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import type { Service } from "../../shared/types/service";
import type { Car } from "../../shared/types/car";
import type { CustomerViewDto } from "../../shared/dtos/customerDtos";
import { useTabStore } from "../../store/tabStore";
import { useToastStore } from "../../store/toastStore";

const formatDate = (value?: Date | string | null) => value ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "short" }).format(new Date(value)) : "-";
const formatKm = (value?: number | null) => value == null ? "-" : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);
const formatMoney = (value?: number | null) => value == null ? "-" : new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

const ServiceList: React.FC<{ customerId?: number; carId?: number; contextLabel?: string }> = ({ customerId, carId, contextLabel }) => {
  const { t } = useTranslation();
  const { openTab } = useTabStore();
  const { addToast } = useToastStore();
  const [services, setServices] = useState<Service[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [customers, setCustomers] = useState<CustomerViewDto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<number[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [serviceRes, carRes, customerRes] = await Promise.all([
        window.electron.ipcRenderer.invoke("get-all-services"),
        window.electron.ipcRenderer.invoke("get-all-cars"),
        window.electron.ipcRenderer.invoke("get-all-customers"),
      ]);
      if (serviceRes.success) setServices(serviceRes.data ?? []); else addToast(t("serviceUnexpectedError"), "error");
      if (carRes.success) setCars(carRes.data ?? []);
      setCustomers(customerRes ?? []);
      setSelectedIds([]);
    } catch {
      addToast(t("serviceUnexpectedError"), "error");
    } finally { setLoading(false); }
  }, [addToast, t]);

  useEffect(() => { void load(); }, [load]);

  const carMap = useMemo(() => new Map(cars.map((car) => [car.carId, car])), [cars]);
  const customerMap = useMemo(() => new Map(customers.map((customer) => [customer.id, customer])), [customers]);

  const filtered = useMemo(() => {
    const term = search.toLocaleLowerCase("tr-TR").trim();
    return [...services]
      .sort((a, b) => (b.applicationDate ? new Date(b.applicationDate).getTime() : 0) - (a.applicationDate ? new Date(a.applicationDate).getTime() : 0))
      .filter((service) => {
        if (customerId && service.customerId !== customerId) return false;
        if (carId && service.carId !== carId) return false;
        if (!term) return true;
        const car = carMap.get(service.carId);
        const customer = service.customerId ? customerMap.get(service.customerId) : undefined;
        return [car?.plateNumber, car?.model, customer?.fullName, service.complaints, service.extraRequests, service.km?.toString()]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("tr-TR")
          .includes(term);
      });
  }, [services, search, carMap, customerMap, customerId, carId]);

  const view = (service: Service) => service.serviceId && openTab({ type: "service", title: carMap.get(service.carId)?.plateNumber || t("serviceProfileTitle"), entityId: service.serviceId, isProfile: true });
  const edit = (service: Service) => service.serviceId && openTab({ type: "service", title: `${carMap.get(service.carId)?.plateNumber || t("serviceProfileTitle")} · ${t("serviceEditShort")}`, entityId: service.serviceId });
  const add = () => openTab({ type: "service", title: t("serviceNewTitle"), entityId: 999, parentEntityId: carId, contextCustomerId: customerId });
  const remove = (service: Service) => { if (service.serviceId) setDeleteTargets([service.serviceId]); };

  const toggleSelectionMode = () => {
    setIsSelectionMode((previous) => !previous);
    setSelectedIds([]);
  };
  const visibleIds = filtered.map((service) => service.serviceId).filter((id): id is number => typeof id === "number");
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds((current) => checked
      ? [...new Set([...current, ...visibleIds])]
      : current.filter((id) => !visibleIds.includes(id)));
  };
  const toggleSelectOne = (id: number) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };
  const deleteSelected = async () => {
    if (selectedIds.length === 0 || deleting) return;
    setDeleteTargets([...selectedIds]);
  };
  const confirmDelete = async () => {
    if (!deleteTargets.length || deleting) return;
    setDeleting(true);
    let deleted = 0;
    let failed = 0;
    try {
      for (const id of deleteTargets) {
        try {
          const result = await window.electron.ipcRenderer.invoke("delete-service", id);
          if (result.success) deleted += 1;
          else failed += 1;
        } catch { failed += 1; }
      }
      addToast(failed ? t("serviceBulkPartial", {deleted, failed}) : t("serviceDeletedCount", {count: deleted}), failed ? "error" : "success");
      setIsSelectionMode(false);
      setDeleteTargets([]);
      await load();
    } finally { setDeleting(false); }
  };

  return <div className={styles.container}>
    <div className={styles.toolbar}>
      <div className={styles.title}>{contextLabel ? `${contextLabel} ${t("serviceListTitle")}` : t("serviceListTitle")}</div>
      <div className={styles.toolbarRight}>
        <BulkSelectionActions active={isSelectionMode} selectedCount={selectedIds.length}
          onToggle={toggleSelectionMode} onDelete={() => void deleteSelected()}
          deleting={deleting} entityLabel="servis" />
        <input className={styles.searchInput} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("serviceSearchPlaceholder")} />
        <button className={styles.addNewBtn} onClick={add}>+ {t("serviceNewButton")}</button>
      </div>
    </div>
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {isSelectionMode && <th className={styles.checkboxColumn}><input type="checkbox" className={styles.rowCheckbox} checked={allVisibleSelected} onChange={(e) => toggleSelectAll(e.target.checked)} aria-label={t("selectVisibleServices")} /></th>}
            <th>{t("servicePlate")}</th>
            <th>{t("dashboardApplicationDate")}</th>
            <th>{t("serviceCustomer")}</th>
            <th>{t("serviceComplaints")}</th>
            <th>{t("serviceKm")}</th>
            <th>{t("serviceDuration")}</th>
            <th>{t("serviceTotalCharge")}</th>
            <th>{t("serviceDelivered")}</th>
            <th className={styles.actionsHeader}>{t("serviceActions")}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? <tr><td colSpan={isSelectionMode ? 10 : 9} className={styles.emptyState}>{t("serviceLoading")}</td></tr> : filtered.length === 0 ? <tr><td colSpan={isSelectionMode ? 10 : 9} className={styles.emptyState}>{t("serviceNoRecords")}</td></tr> : filtered.map((service) => {
            const car = carMap.get(service.carId);
            const customer = service.customerId ? customerMap.get(service.customerId) : undefined;
            return <tr key={service.serviceId} className={`${styles.tableRow} ${typeof service.serviceId === "number" && selectedIds.includes(service.serviceId) ? styles.selectedRow : ""}`} onDoubleClick={() => view(service)}>
              {isSelectionMode && <td className={styles.checkboxColumn} onClick={(e) => e.stopPropagation()}>{typeof service.serviceId === "number" && <input type="checkbox" className={styles.rowCheckbox} checked={selectedIds.includes(service.serviceId)} onChange={() => toggleSelectOne(service.serviceId as number)} aria-label={t("selectService")} />}</td>}
              <td>{car?.plateNumber ?? "-"}</td>
              <td>{formatDate(service.applicationDate)}</td>
              <td><span className={styles.truncate} title={customer?.fullName ?? "-"}>{customer?.fullName ?? "-"}</span></td>
              <td className={styles.complaintCell}><ComplaintPreview label={t("serviceComplaints")} text={service.complaints} /></td>
              <td>{formatKm(service.km)}</td>
              <td>{service.jobDuration == null ? "—" : `${service.jobDuration} dk`}</td>
              <td>{formatMoney(service.totalCharge)}</td>
              <td><DeliveryStatus delivered={Boolean(service.isDelivered)} yesLabel={t("serviceYes")} noLabel={t("serviceNo")} /></td>
              <td className={styles.actionsCell}>
                <button className={styles.actionBtn} title={t("serviceView")} onClick={(e) => { e.stopPropagation(); view(service); }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/></svg>
                </button>
                <button className={styles.actionBtn} title={t("serviceEditShort")} onClick={(e) => { e.stopPropagation(); edit(service); }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>
                </button>
                <button className={`${styles.actionBtn} ${styles.deleteIconBtn}`} title={t("serviceDelete")} onClick={(e) => { e.stopPropagation(); void remove(service); }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
    {deleteTargets.length > 0 && <DeleteConfirmDialog
      title={deleteTargets.length === 1 ? t("serviceDeleteTitle") : t("serviceDeleteSelectedTitle")}
      onCancel={() => { if (!deleting) setDeleteTargets([]); }}
      onConfirm={() => void confirmDelete()}
      busy={deleting}
    >
      {deleteTargets.length === 1
        ? t("serviceDeleteConfirmation")
        : t("serviceDeleteSelectedPrompt", { count: deleteTargets.length })}
    </DeleteConfirmDialog>}
  </div>;
};

const ComplaintPreview: React.FC<{ label: string; text?: string | null }> = ({ label, text }) => {
  const value = text?.trim() || "—";
  const showTooltip = value !== "—";
  return (
    <div className={styles.tooltipAnchor} tabIndex={showTooltip ? 0 : -1}>
      <span className={styles.truncate}>{value}</span>
      {showTooltip && (
        <div className={styles.tooltipCard} role="tooltip">
          <div className={styles.tooltipLabel}>{label}</div>
          <p>{value}</p>
        </div>
      )}
    </div>
  );
};

const DeliveryStatus: React.FC<{ delivered: boolean; yesLabel: string; noLabel: string }> = ({ delivered, yesLabel, noLabel }) => (
  <span className={`${styles.deliveryStatus} ${delivered ? styles.deliveryYes : styles.deliveryNo}`} title={delivered ? yesLabel : noLabel} aria-label={delivered ? yesLabel : noLabel}>
    {delivered ? (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M6 10.2 8.6 12.8 14 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    )}
  </span>
);

export default ServiceList;
