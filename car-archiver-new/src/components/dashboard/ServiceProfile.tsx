import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ServiceProfile.module.css";
import type { Service } from "../../shared/types/service";
import type { Part } from "../../shared/types/part";
import type { Car } from "../../shared/types/car";
import type { CustomerViewDto } from "../../shared/dtos/customerDtos";
import { useTabStore } from "../../store/tabStore";
import { useToastStore } from "../../store/toastStore";

const dateTime = (value?: Date | string | null) => value ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "-";
const dateOnly = (value?: Date | string | null) => value ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(value)) : "-";
const money = (value?: number | null) => value == null ? "-" : new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);
const km = (value?: number | null) => value == null ? "-" : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);

const ServiceProfile: React.FC<{ serviceId: number }> = ({ serviceId }) => {
  const { t } = useTranslation();
  const { openTab, activeTabId, renameTab, closeTab } = useTabStore();
  const { addToast } = useToastStore();
  const [service, setService] = useState<Service | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [car, setCar] = useState<Car | null>(null);
  const [customer, setCustomer] = useState<CustomerViewDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [serviceRes, carsRes, customersRes] = await Promise.all([
          window.electron.ipcRenderer.invoke("get-service", serviceId),
          window.electron.ipcRenderer.invoke("get-all-cars"),
          window.electron.ipcRenderer.invoke("get-all-customers"),
        ]);
        if (!serviceRes.success || !serviceRes.data) throw new Error(serviceRes.message);
        const data = serviceRes.data;
        setService(data.service); setParts(data.parts ?? []);
        const selectedCar = carsRes.success ? (carsRes.data ?? []).find((item) => item.carId === data.service.carId) ?? null : null;
        setCar(selectedCar);
        setCustomer((customersRes ?? []).find((item: CustomerViewDto) => item.id === data.service.customerId) ?? null);
        renameTab(activeTabId, `#${serviceId}`);
      } catch (error) { addToast(error instanceof Error ? error.message : t("serviceUnexpectedError"), "error"); }
      finally { setLoading(false); }
    };
    void load();
  }, [activeTabId, addToast, serviceId, renameTab, t]);

  const title = useMemo(() => service ? `${car?.plateNumber ?? "-"} · ${dateOnly(service.applicationDate)}` : `#${serviceId}`, [car, service, serviceId]);
  if (loading) return <div className={styles.loading}>{t("serviceLoading")}</div>;
  if (!service) return <div className={styles.loading}>{t("serviceNotFound")}</div>;

  const remove = async () => {
    if (!window.confirm(t("serviceDeleteConfirm"))) return;
    const result = await window.electron.ipcRenderer.invoke("delete-service", serviceId);
    if (!result.success) { addToast(result.message, "error"); return; }
    addToast(t("serviceDeleted"), "success"); closeTab(activeTabId);
  };

  const openCar = () => car?.carId && openTab({ type: "car", title: car.plateNumber || t("carProfileTitle"), entityId: car.carId, isProfile: true });
  const openCustomer = () => customer?.id && openTab({ type: "customer", title: `${customer.fullName} Profili`, entityId: customer.id, isProfile: true });

  return <div className={styles.container}>
    <div className={styles.header}><div><div className={styles.kicker}>{t("serviceProfileTitle")}</div><h1>{title}</h1><div className={styles.subtitle}>{service.complaints}</div></div><div className={styles.headerActions}><button className={styles.secondaryButton} onClick={() => openTab({ type: "service", title: t("serviceEditTitle"), entityId: serviceId })}>{t("serviceEdit")}</button><button className={styles.deleteButton} onClick={() => void remove()}>{t("serviceDelete")}</button></div></div>
    <div className={styles.grid}>
      <section className={styles.card}><h3>{t("serviceBasicSection")}</h3><div className={styles.infoGrid}>
        <Info label={t("serviceCar")} value={car?.plateNumber ?? "-"} onClick={openCar}/><Info label={t("serviceCustomer")} value={customer?.fullName ?? "-"} onClick={openCustomer}/><Info label={t("serviceApplicationDate")} value={dateTime(service.applicationDate)}/><Info label={t("serviceAppointmentDate")} value={dateTime(service.appointmentDate)}/><Info label={t("serviceKm")} value={km(service.km)}/><Info label={t("serviceJobDuration")} value={service.jobDuration == null ? "-" : `${service.jobDuration} dk`}/>
      </div></section>
      <section className={styles.card}><h3>{t("serviceStatusSection")}</h3><div className={styles.infoGrid}><Info label={t("serviceTargetDelivery")} value={dateTime(service.targetDeliveryDate)}/><Info label={t("serviceDeliveryDate")} value={dateTime(service.deliveryDate)}/><Info label={t("serviceDelivered")} value={service.isDelivered ? t("serviceYes") : t("serviceNo")}/><Info label={t("serviceLaborCharge")} value={money(service.laborCharge)}/><Info label={t("serviceTotalCharge")} value={money(service.totalCharge)}/></div></section>
      <section className={styles.card}><h3>{t("serviceComplaintSection")}</h3><TextBlock label={t("serviceComplaints")} text={service.complaints}/><TextBlock label={t("serviceExtraRequests")} text={service.extraRequests}/><TextList label={t("serviceFaults")} values={service.faults}/></section>
      <section className={styles.card}><h3>{t("serviceDamageSection")}</h3><TextList label={t("serviceDamageOnReceive")} values={service.damageOnReceive}/><TextList label={t("serviceDamageDuringRepair")} values={service.damageDuringRepair}/></section>
      <section className={`${styles.card} ${styles.partsCard}`}><h3>{t("servicePartsSection")}</h3>{parts.length ? <div className={styles.partsTable}>{parts.map((part) => <div className={styles.partRow} key={part.partId}><span>{part.partName}</span><span>{part.partTax == null ? "-" : `${part.partTax}%`}</span><strong>{money(part.partPrice)}</strong></div>)}</div> : <div className={styles.empty}>{t("serviceNoParts")}</div>}</section>
    </div>
  </div>;
};

const Info: React.FC<{label:string;value:string;onClick?:()=>void}> = ({label,value,onClick}) => onClick ? <button className={styles.infoBox} onClick={onClick} type="button"><span>{label}</span><strong>{value}</strong><i>›</i></button> : <div className={styles.infoBox}><span>{label}</span><strong>{value}</strong></div>;
const TextBlock: React.FC<{label:string;text?:string|null}> = ({label,text}) => <div className={styles.textBlock}><span>{label}</span><p>{text || "-"}</p></div>;
const TextList: React.FC<{label:string;values?:string[]|null}> = ({label,values}) => <div className={styles.textBlock}><span>{label}</span>{values?.length ? <ul>{values.map((value,index)=><li key={`${value}-${index}`}>{value}</li>)}</ul> : <p>-</p>}</div>;
export default ServiceProfile;
