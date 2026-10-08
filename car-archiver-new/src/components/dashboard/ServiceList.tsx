import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ServiceList.module.css";
import type { Service } from "../../shared/types/service";
import type { Car } from "../../shared/types/car";
import type { CustomerViewDto } from "../../shared/dtos/customerDtos";
import { useTabStore } from "../../store/tabStore";
import { useToastStore } from "../../store/toastStore";

const formatDate = (value?: Date | string | null) => value ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "short" }).format(new Date(value)) : "-";
const formatKm = (value?: number | null) => value == null ? "-" : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);
const formatMoney = (value?: number | null) => value == null ? "-" : new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(value);

const ServiceList: React.FC = () => {
  const { t } = useTranslation();
  const { openTab } = useTabStore();
  const { addToast } = useToastStore();
  const [services, setServices] = useState<Service[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [customers, setCustomers] = useState<CustomerViewDto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [serviceRes, carRes, customerRes] = await Promise.all([
        window.electron.ipcRenderer.invoke("get-all-services"),
        window.electron.ipcRenderer.invoke("get-all-cars"),
        window.electron.ipcRenderer.invoke("get-all-customers"),
      ]);
      if (serviceRes.success) setServices(serviceRes.data ?? []); else addToast(serviceRes.message, "error");
      if (carRes.success) setCars(carRes.data ?? []);
      setCustomers(customerRes ?? []);
    } catch {
      addToast(t("serviceUnexpectedError"), "error");
    } finally { setLoading(false); }
  }, [addToast, t]);

  useEffect(() => { void load(); }, [load]);

  const carMap = useMemo(() => new Map(cars.map((car) => [car.carId, car])), [cars]);
  const customerMap = useMemo(() => new Map(customers.map((customer) => [customer.id, customer])), [customers]);

  const filtered = useMemo(() => {
    const term = search.toLocaleLowerCase("tr-TR").trim();
    return [...services].sort((a, b) => (b.applicationDate ? new Date(b.applicationDate).getTime() : 0) - (a.applicationDate ? new Date(a.applicationDate).getTime() : 0)).filter((service) => {
      if (!term) return true;
      const car = carMap.get(service.carId);
      const customer = service.customerId ? customerMap.get(service.customerId) : undefined;
      return [car?.plateNumber, car?.model, customer?.fullName, service.complaints, service.extraRequests, service.km?.toString()].filter(Boolean).join(" ").toLocaleLowerCase("tr-TR").includes(term);
    });
  }, [services, search, carMap, customerMap]);

  const view = (service: Service) => service.serviceId && openTab({ type: "service", title: `#${service.serviceId}`, entityId: service.serviceId, isProfile: true });
  const edit = (service: Service) => service.serviceId && openTab({ type: "service", title: t("serviceEditTitle"), entityId: service.serviceId });
  const add = () => openTab({ type: "service", title: t("serviceNewTitle"), entityId: 999 });
  const remove = async (service: Service) => {
    if (!service.serviceId || !window.confirm(t("serviceDeleteConfirm"))) return;
    const result = await window.electron.ipcRenderer.invoke("delete-service", service.serviceId);
    if (result.success) { addToast(t("serviceDeleted"), "success"); void load(); }
    else addToast(result.message, "error");
  };

  return <div className={styles.container}>
    <div className={styles.toolbar}>
      <div className={styles.title}>{t("serviceListTitle")}</div>
      <div className={styles.toolbarRight}>
        <input className={styles.searchInput} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("serviceSearchPlaceholder")} />
        <button className={styles.addNewBtn} onClick={add}>+ {t("serviceNewButton")}</button>
      </div>
    </div>
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead><tr><th>{t("serviceDate")}</th><th>{t("servicePlate")}</th><th>{t("serviceCustomer")}</th><th>{t("serviceComplaints")}</th><th>{t("serviceKm")}</th><th>{t("serviceTotalCharge")}</th><th className={styles.actionsHeader}>{t("serviceActions")}</th></tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={7} className={styles.emptyState}>{t("serviceLoading")}</td></tr> : filtered.length === 0 ? <tr><td colSpan={7} className={styles.emptyState}>{t("serviceNoRecords")}</td></tr> : filtered.map((service) => {
            const car = carMap.get(service.carId);
            const customer = service.customerId ? customerMap.get(service.customerId) : undefined;
            return <tr key={service.serviceId} className={styles.tableRow} onDoubleClick={() => view(service)}>
              <td>{formatDate(service.applicationDate)}</td>
              <td>{car?.plateNumber ?? "-"}</td>
              <td>{customer?.fullName ?? "-"}</td>
              <td className={styles.complaintCell}>{service.complaints}</td>
              <td>{formatKm(service.km)}</td>
              <td>{formatMoney(service.totalCharge)}</td>
              <td className={styles.actionsCell}>
                <button className={styles.actionBtn} title={t("serviceView")} onClick={(e) => { e.stopPropagation(); view(service); }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/></svg>
                </button>
                <button className={styles.actionBtn} title={t("serviceEdit")} onClick={(e) => { e.stopPropagation(); edit(service); }}>
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
  </div>;
};
export default ServiceList;
