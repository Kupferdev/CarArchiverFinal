import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ServiceForm.module.css";
import type { Service } from "../../shared/types/service";
import type { Car } from "../../shared/types/car";
import type { CustomerViewDto } from "../../shared/dtos/customerDtos";
import type { Part } from "../../shared/types/part";
import { useTabStore } from "../../store/tabStore";
import { useToastStore } from "../../store/toastStore";

interface ServiceFormProps { serviceId?: number; carId?: number; }
interface PartDraft { partName: string; partTax: string; partPrice: string; }

const emptyService: Service = { carId: 0, customerId: null, applicationDate: new Date(), appointmentDate: null, jobDuration: null, deliveryDate: null, km: null, complaints: "", extraRequests: "", faults: [], hasDamageOnReceive: false, damageOnReceive: [], hasDamageDuringRepair: false, damageDuringRepair: [], laborCharge: null, totalCharge: null, targetDeliveryDate: null, isDelivered: false };
const toDateTimeInput = (value?: Date | string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const fromDateTimeInput = (value: string) => value ? new Date(value) : null;
const parseLines = (value: string) => value.split("\n").map((x) => x.trim()).filter(Boolean);
const formatKm = (value?: number | null) => value == null ? "" : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);

const ServiceForm: React.FC<ServiceFormProps> = ({ serviceId, carId }) => {
  const { t } = useTranslation();
  const { openTab, closeTab, activeTabId } = useTabStore();
  const { addToast } = useToastStore();
  const [service, setService] = useState<Service>(emptyService);
  const [cars, setCars] = useState<Car[]>([]);
  const [customers, setCustomers] = useState<CustomerViewDto[]>([]);
  const [parts, setParts] = useState<PartDraft[]>([]);
  const [faultsText, setFaultsText] = useState("");
  const [damageReceiveText, setDamageReceiveText] = useState("");
  const [damageDuringText, setDamageDuringText] = useState("");
  const [loading, setLoading] = useState(Boolean(serviceId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [carRes, customerRes] = await Promise.all([
          window.electron.ipcRenderer.invoke("get-all-cars"),
          window.electron.ipcRenderer.invoke("get-all-customers"),
        ]);
        const carList = carRes.success ? (carRes.data ?? []) : [];
        setCars(carList); setCustomers(customerRes ?? []);
        if (serviceId) {
          const serviceRes = await window.electron.ipcRenderer.invoke("get-service", serviceId);
          if (!serviceRes.success || !serviceRes.data) throw new Error(serviceRes.message);
          const data = serviceRes.data;
          setService(data.service);
          setParts((data.parts ?? []).map((part: Part) => ({ partName: part.partName, partTax: part.partTax?.toString() ?? "", partPrice: part.partPrice?.toString() ?? "" })));
          setFaultsText((data.service.faults ?? []).join("\n"));
          setDamageReceiveText((data.service.damageOnReceive ?? []).join("\n"));
          setDamageDuringText((data.service.damageDuringRepair ?? []).join("\n"));
        } else if (carId) {
          const selectedCar = carList.find((car) => car.carId === carId);
          setService((current) => ({ ...current, carId, customerId: selectedCar?.customerId ?? null, km: selectedCar?.km ?? null }));
        }
      } catch (error) {
        addToast(error instanceof Error ? error.message : t("serviceUnexpectedError"), "error");
      } finally { setLoading(false); }
    };
    void load();
  }, [addToast, carId, serviceId, t]);

  const selectedCar = cars.find((car) => car.carId === service.carId);
  const eligibleCustomers = useMemo(() => {
    if (!selectedCar) return customers;
    const ids = new Set<number>();
    if (selectedCar.customerId) ids.add(selectedCar.customerId);
    if (service.customerId) ids.add(service.customerId);
    (selectedCar.oldCustomerId ?? []).forEach((id) => { const n = Number(id); if (Number.isInteger(n)) ids.add(n); });
    return customers.filter((customer) => ids.has(customer.id));
  }, [customers, selectedCar, service.customerId]);

  const update = <K extends keyof Service>(key: K, value: Service[K]) => setService((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!service.carId) { addToast(t("serviceCarRequired"), "error"); return; }
    if (!service.complaints.trim()) { addToast(t("serviceComplaintRequired"), "error"); return; }
    setSaving(true);
    try {
      const request = {
        service: { ...service, applicationDate: service.applicationDate ?? new Date(), faults: parseLines(faultsText), damageOnReceive: parseLines(damageReceiveText), damageDuringRepair: parseLines(damageDuringText) },
        parts: parts.filter((part) => part.partName.trim()).map((part) => ({ partName: part.partName.trim(), partTax: part.partTax === "" ? null : Number(part.partTax), partPrice: part.partPrice === "" ? null : Number(part.partPrice) })),
      };
      const result = serviceId
        ? await window.electron.ipcRenderer.invoke("update-service", { id: serviceId, ...request })
        : await window.electron.ipcRenderer.invoke("add-service", request);
      if (!result.success || !result.data) { addToast(result.message, "error"); return; }
      addToast(serviceId ? t("serviceUpdated") : t("serviceCreated"), "success");
      const savedId = result.data.service.serviceId;
      if (savedId) {
        closeTab(activeTabId);
        openTab({ type: "service", title: `#${savedId}`, entityId: savedId, isProfile: true });
      }
    } catch (error) { addToast(error instanceof Error ? error.message : t("serviceUnexpectedError"), "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className={styles.loading}>{t("serviceLoading")}</div>;

  return <div className={styles.container}>
    <div className={styles.title}>{serviceId ? t("serviceEditTitle") : t("serviceNewTitle")}</div>
    <div className={styles.formScroll}>
      <div className={styles.grid}>
        <section className={styles.card}>
          <h3>{t("serviceBasicSection")}</h3>
          <label>{t("serviceCar")}</label>
          <select className={styles.input} value={service.carId || ""} onChange={(e) => { const id = Number(e.target.value); const car = cars.find((item) => item.carId === id); update("carId", id); update("customerId", car?.customerId ?? null); update("km", car?.km ?? null); }}>
            <option value="">{t("serviceCarSelect")}</option>
            {cars.map((car) => <option key={car.carId} value={car.carId}>{car.plateNumber || "-"}{car.model ? ` · ${car.model}` : ""}</option>)}
          </select>
          <label>{t("serviceCustomer")}</label>
          <select className={styles.input} value={service.customerId ?? ""} onChange={(e) => update("customerId", e.target.value ? Number(e.target.value) : null)}>
            <option value="">{t("serviceNoCustomer")}</option>
            {eligibleCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.fullName}</option>)}
          </select>
          <div className={styles.twoCol}>
            <Field label={t("serviceApplicationDate")} type="datetime-local" value={toDateTimeInput(service.applicationDate)} onChange={(v) => update("applicationDate", fromDateTimeInput(v))} />
            <Field label={t("serviceAppointmentDate")} type="datetime-local" value={toDateTimeInput(service.appointmentDate)} onChange={(v) => update("appointmentDate", fromDateTimeInput(v))} />
            <Field label={t("serviceKm")} type="text" inputMode="numeric" value={formatKm(service.km)} onChange={(v) => update("km", v.replace(/\D/g, "") ? Number(v.replace(/\D/g, "")) : null)} />
            <Field label={t("serviceJobDuration")} type="number" min="0" value={service.jobDuration ?? ""} onChange={(v) => update("jobDuration", v === "" ? null : Number(v))} />
          </div>
        </section>

        <section className={styles.card}>
          <h3>{t("serviceComplaintSection")}</h3>
          <label>{t("serviceComplaints")}</label>
          <textarea className={styles.textarea} value={service.complaints} onChange={(e) => update("complaints", e.target.value)} maxLength={4000} />
          <label>{t("serviceExtraRequests")}</label>
          <textarea className={styles.textareaSmall} value={service.extraRequests ?? ""} onChange={(e) => update("extraRequests", e.target.value)} maxLength={4000} />
          <label>{t("serviceFaults")}</label>
          <textarea className={styles.textareaSmall} placeholder={t("serviceOnePerLine")} value={faultsText} onChange={(e) => setFaultsText(e.target.value)} />
        </section>

        <section className={styles.card}>
          <h3>{t("serviceDamageSection")}</h3>
          <label className={styles.checkLabel}><input type="checkbox" checked={service.hasDamageOnReceive} onChange={(e) => update("hasDamageOnReceive", e.target.checked)} /> {t("serviceDamageOnReceive")}</label>
          {service.hasDamageOnReceive && <textarea className={styles.textareaSmall} placeholder={t("serviceOnePerLine")} value={damageReceiveText} onChange={(e) => setDamageReceiveText(e.target.value)} />}
          <label className={styles.checkLabel}><input type="checkbox" checked={service.hasDamageDuringRepair ?? false} onChange={(e) => update("hasDamageDuringRepair", e.target.checked)} /> {t("serviceDamageDuringRepair")}</label>
          {service.hasDamageDuringRepair && <textarea className={styles.textareaSmall} placeholder={t("serviceOnePerLine")} value={damageDuringText} onChange={(e) => setDamageDuringText(e.target.value)} />}
        </section>

        <section className={styles.card}>
          <h3>{t("serviceFinancialSection")}</h3>
          <div className={styles.twoCol}>
            <Field label={t("serviceLaborCharge")} type="number" min="0" step="0.01" value={service.laborCharge ?? ""} onChange={(v) => update("laborCharge", v === "" ? null : Number(v))} />
            <Field label={t("serviceTotalCharge")} type="number" min="0" step="0.01" value={service.totalCharge ?? ""} onChange={(v) => update("totalCharge", v === "" ? null : Number(v))} />
            <Field label={t("serviceTargetDelivery")} type="datetime-local" value={toDateTimeInput(service.targetDeliveryDate)} onChange={(v) => update("targetDeliveryDate", fromDateTimeInput(v))} />
            <Field label={t("serviceDeliveryDate")} type="datetime-local" value={toDateTimeInput(service.deliveryDate)} onChange={(v) => update("deliveryDate", fromDateTimeInput(v))} />
          </div>
          <label className={styles.checkLabel}><input type="checkbox" checked={service.isDelivered ?? false} onChange={(e) => update("isDelivered", e.target.checked)} /> {t("serviceDelivered")}</label>
        </section>

        <section className={`${styles.card} ${styles.partsCard}`}>
          <div className={styles.sectionHeader}><h3>{t("servicePartsSection")}</h3><button type="button" className={styles.secondaryButton} onClick={() => setParts((current) => [...current, { partName: "", partTax: "", partPrice: "" }])}>+ {t("serviceAddPart")}</button></div>
          {parts.length === 0 ? <div className={styles.emptyParts}>{t("serviceNoParts")}</div> : <div className={styles.partsList}>{parts.map((part, index) => <div className={styles.partRow} key={index}><input className={styles.input} placeholder={t("servicePartName")} value={part.partName} onChange={(e) => setParts((current) => current.map((item, i) => i === index ? { ...item, partName: e.target.value } : item))}/><input className={styles.input} type="number" min="0" step="0.01" placeholder={t("servicePartTax")} value={part.partTax} onChange={(e) => setParts((current) => current.map((item, i) => i === index ? { ...item, partTax: e.target.value } : item))}/><input className={styles.input} type="number" min="0" step="0.01" placeholder={t("servicePartPrice")} value={part.partPrice} onChange={(e) => setParts((current) => current.map((item, i) => i === index ? { ...item, partPrice: e.target.value } : item))}/><button type="button" className={styles.removePart} onClick={() => setParts((current) => current.filter((_, i) => i !== index))}>×</button></div>)}</div>}
        </section>
      </div>
    </div>
    <div className={styles.footer}><button className={styles.cancelButton} onClick={() => closeTab(activeTabId)} type="button">{t("cancel")}</button><button className={styles.saveButton} disabled={saving} onClick={() => void save()} type="button">{saving ? t("serviceSaving") : serviceId ? t("serviceSaveChanges") : t("serviceCreate")}</button></div>
  </div>;
};

const Field: React.FC<{label:string; type:string; value:string|number; onChange:(value:string)=>void; min?:string; step?:string}> = ({label,type,value,onChange,min,step}) => <div className={styles.field}><label>{label}</label><input className={styles.input} type={type} min={min} step={step} value={value} onChange={(e) => onChange(e.target.value)} /></div>;
export default ServiceForm;
