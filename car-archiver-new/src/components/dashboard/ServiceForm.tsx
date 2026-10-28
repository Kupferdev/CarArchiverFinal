import { capitalizeSentenceStarts } from '../../utils/textCapitalization';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ServiceForm.module.css";
import { FormField } from "../common/FormField";
import { LocalizedDateTimeField } from "../common/LocalizedDateTimeField";
import { ServicePhotoGallery } from "./ServicePhotoGallery";
import type { Service } from "../../shared/types/service";
import type { Car } from "../../shared/types/car";
import type { Brand } from "../../shared/types/brand";
import type { CustomerViewDto } from "../../shared/dtos/customerDtos";
import type { Part } from "../../shared/types/part";
import { useTabStore } from "../../store/tabStore";
import { useToastStore } from "../../store/toastStore";

interface ServiceFormProps { serviceId?: number; carId?: number; customerId?: number; tabId?: string; }
interface PartDraft { partId?: number; partName: string; quantity: string; unitPrice: string; }

const emptyService: Service = { carId: 0, customerId: null, applicationDate: new Date(), appointmentDate: null, jobDuration: null, deliveryDate: null, km: null, complaints: "", extraRequests: "", advisorNotes: "", faults: [], hasDamageOnReceive: false, damageOnReceive: [], hasDamageDuringRepair: false, damageDuringRepair: [], laborCharge: null, totalCharge: null, targetDeliveryDate: null, isDelivered: false };
const toDateTimeInput = (value?: Date | string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const fromDateTimeInput = (value: string) => value ? new Date(value) : null;
const parseLines = (value: string) => value.split("\n").map((x) => x.trim()).filter(Boolean);
const formatPrice = (kurus: number) => new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(kurus / 100);
const parseUnitPrice = (value: string) => {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ""] = value.replace(",", ".").split(".");
  const kurus = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(kurus) ? kurus : null;
};
const titleCasePart = (value: string) => value.replace(/(^|[\s/-])([a-zçğıöşü])/giu, (_match, prefix: string, letter: string) => prefix + letter.toLocaleUpperCase("tr-TR"));
const formatKm = (value?: number | null) => value == null ? "" : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);

const ServiceForm: React.FC<ServiceFormProps> = ({ serviceId, carId, customerId, tabId }) => {
  const { t } = useTranslation();
  const { openTab, closeTab, renameTab, activeTabId, setTabDirty } = useTabStore();
  const { addToast } = useToastStore();
  const [service, setService] = useState<Service>(emptyService);
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [carPickerOpen, setCarPickerOpen] = useState(false);
  const [carSearch, setCarSearch] = useState("");
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const customerPickerRef = useRef<HTMLDivElement>(null);
  const carPickerRef = useRef<HTMLDivElement>(null);
  const addPartButtonRef = useRef<HTMLButtonElement>(null);
  const deletePartButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastPartTabRef = useRef<number | null>(null);
  const automaticallySetDeliveryDate = useRef<string | null>(null);
  const [customers, setCustomers] = useState<CustomerViewDto[]>([]);
  const [parts, setParts] = useState<PartDraft[]>([]);
  const [faultsText, setFaultsText] = useState("");
  const [damageReceiveText, setDamageReceiveText] = useState("");
  const [damageDuringText, setDamageDuringText] = useState("");
  const [loading, setLoading] = useState(Boolean(serviceId));
  const [saving, setSaving] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState('');
  const formTabId = tabId ?? activeTabId;


  const formSnapshot = JSON.stringify({ service, parts, faultsText, damageReceiveText, damageDuringText });

  useEffect(() => {
    if (!serviceId) {
      setInitialSnapshot(JSON.stringify({
        service: carId ? { ...emptyService, carId, customerId: null } : emptyService,
        parts: [],
        faultsText: '',
        damageReceiveText: '',
        damageDuringText: '',
      }));
    }
  }, [carId, serviceId]);

  useEffect(() => {
    if (!initialSnapshot) return;
    setTabDirty(formTabId, formSnapshot !== initialSnapshot);
  }, [formTabId, formSnapshot, initialSnapshot, setTabDirty]);

  useEffect(() => {
    const load = async () => {
      try {
        const [carRes, customerRes, brandRes] = await Promise.all([
          window.electron.ipcRenderer.invoke("get-all-cars"),
          window.electron.ipcRenderer.invoke("get-all-customers"),
          window.electron.ipcRenderer.invoke("get-all-brands"),
        ]);
        const carList = carRes.success ? (carRes.data ?? []) : [];
        setCars(carList); setCustomers(customerRes ?? []); if (brandRes.success) setBrands(brandRes.data ?? []);
        if (serviceId) {
          const serviceRes = await window.electron.ipcRenderer.invoke("get-service", serviceId);
          if (!serviceRes.success || !serviceRes.data) throw new Error(serviceRes.message);
          const data = serviceRes.data;
          const loadedParts = (data.parts ?? []).map((part: Part) => ({ partId: part.partId, partName: part.partName, quantity: String(part.quantity), unitPrice: (part.unitPriceKurus / 100).toFixed(2) }));
          const loadedFaultsText = (data.service.faults ?? []).join("\n");
          const loadedDamageReceiveText = (data.service.damageOnReceive ?? []).join("\n");
          const loadedDamageDuringText = (data.service.damageDuringRepair ?? []).join("\n");
          automaticallySetDeliveryDate.current = null;
          setService(data.service);
          setParts(loadedParts);
          setFaultsText(loadedFaultsText);
          setDamageReceiveText(loadedDamageReceiveText);
          setDamageDuringText(loadedDamageDuringText);
          setInitialSnapshot(JSON.stringify({ service: data.service, parts: loadedParts, faultsText: loadedFaultsText, damageReceiveText: loadedDamageReceiveText, damageDuringText: loadedDamageDuringText }));
        } else if (carId) {
          const selectedCar = carList.find((car) => car.carId === carId);
          const nextService = { ...emptyService, carId, customerId: selectedCar?.customerId ?? null, km: selectedCar?.km ?? null };
          setService(nextService);
          setInitialSnapshot(JSON.stringify({ service: nextService, parts: [], faultsText: '', damageReceiveText: '', damageDuringText: '' }));
        } else if (customerId) {
          const nextService = { ...emptyService, customerId };
          setService(nextService);
          setInitialSnapshot(JSON.stringify({ service: nextService, parts: [], faultsText: "", damageReceiveText: "", damageDuringText: "" }));
        }
      } catch (error) {
        addToast(t("serviceUnexpectedError"), "error");
      } finally { setLoading(false); }
    };
    void load();
  }, [addToast, carId, customerId, serviceId, t]);

  useEffect(() => {
    if (!carPickerOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (carPickerRef.current && !carPickerRef.current.contains(event.target as Node)) setCarPickerOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [carPickerOpen]);

  const selectedCar = cars.find((car) => car.carId === service.carId);
  const carLabel = (car: Car) => [brands.find((brand) => brand.brandId === car.brandId)?.brandName, car.model].filter(Boolean).join(" ") || "—";
  const filteredCars = cars.filter((car) => {
    if (customerId && car.customerId !== customerId && !(car.oldCustomerId ?? []).some((id) => Number(id) === customerId)) return false;
    const currentCustomer = customers.find((customer) => customer.id === car.customerId);
    const text = [car.plateNumber, carLabel(car), currentCustomer?.fullName].join(" ").toLocaleLowerCase("tr-TR");
    return text.includes(carSearch.trim().toLocaleLowerCase("tr-TR"));
  }).sort((a, b) => (a.plateNumber ?? "").localeCompare(b.plateNumber ?? "", "tr-TR"));
  const selectCar = (car: Car) => {
    setService((current) => ({ ...current, carId: car.carId ?? 0, customerId: customerId ?? car.customerId ?? null, km: car.km ?? null }));
    setCarPickerOpen(false);
    setCarSearch("");
  };
  const selectedPlate = selectedCar?.plateNumber;
  const hasSelectedCar = Boolean(selectedCar);
  useEffect(() => {
    if (!cars.length) return;
    const plate = selectedPlate?.trim() || (serviceId ? t("serviceProfileTitle") : t("serviceNewTitle"));
    const title = serviceId ? `${plate} · ${t("serviceEditShort")}` : (hasSelectedCar ? `${t("serviceNewShort")} · ${plate}` : t("serviceNewTitle"));
    renameTab(formTabId, title);
  }, [formTabId, cars, hasSelectedCar, renameTab, selectedPlate, serviceId, t]);
  useEffect(() => {
    if (!customerPickerOpen) return;
    const close = (event: PointerEvent) => {
      if (customerPickerRef.current && !customerPickerRef.current.contains(event.target as Node)) setCustomerPickerOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [customerPickerOpen]);

  const eligibleCustomers = useMemo(() => {
    if (!selectedCar) return customers;
    const ids = new Set<number>();
    if (selectedCar.customerId) ids.add(selectedCar.customerId);
    if (service.customerId) ids.add(service.customerId);
    (selectedCar.oldCustomerId ?? []).forEach((id) => { const n = Number(id); if (Number.isInteger(n)) ids.add(n); });
    return customers.filter((customer) => ids.has(customer.id));
  }, [customers, selectedCar, service.customerId]);

  const filteredCustomers = eligibleCustomers.filter((customer) => {
    const term = customerSearch.trim().toLocaleLowerCase("tr-TR");
    const phone = customer.phones?.map((item) => `${item.countryCode} ${item.number}`).join(" ") ?? "";
    return `${customer.fullName} ${phone}`.toLocaleLowerCase("tr-TR").includes(term);
  });
  const selectedCustomer = customers.find((customer) => customer.id === service.customerId);
  const canPickCustomer = Boolean(selectedCar);
  const update = <K extends keyof Service>(key: K, value: Service[K]) => setService((current) => ({ ...current, [key]: value }));
  const handleDeliveredChange = (checked: boolean) => {
    setService((current) => {
      if (checked && !current.deliveryDate) {
        const now = new Date();
        automaticallySetDeliveryDate.current = toDateTimeInput(now);
        return { ...current, isDelivered: true, deliveryDate: now };
      }
      if (!checked && automaticallySetDeliveryDate.current && toDateTimeInput(current.deliveryDate) === automaticallySetDeliveryDate.current) {
        automaticallySetDeliveryDate.current = null;
        return { ...current, isDelivered: false, deliveryDate: null };
      }
      automaticallySetDeliveryDate.current = null;
      return { ...current, isDelivered: checked };
    });
  };
  // This is only a suggestion, never a stored or automatic total.
  const suggestedTotal = useMemo(() => {
    const hasLabor = service.laborCharge != null && Number.isFinite(service.laborCharge);
    if (!hasLabor && parts.length === 0) return "";
    let partsKurus = 0;
    for (const part of parts) {
      const price = parseUnitPrice(part.unitPrice);
      const quantity = Number(part.quantity);
      if (price === null || !/^\d+$/.test(part.quantity) || !Number.isSafeInteger(quantity) || quantity <= 0) return "";
      partsKurus += price * quantity;
    }
    const total = (hasLabor ? service.laborCharge! : 0) + partsKurus / 100;
    return Number.isFinite(total) && total >= 0 ? total.toFixed(2) : "";
  }, [parts, service.laborCharge]);
  const updateDeliveryDate = (value: string) => {
    automaticallySetDeliveryDate.current = null;
    const date = fromDateTimeInput(value);
    setService((current) => ({ ...current, deliveryDate: date, isDelivered: date ? true : current.isDelivered }));
  };
  const handleUnitPriceTab = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key !== "Tab" || event.shiftKey) return;
    event.preventDefault();
    lastPartTabRef.current = index;
    addPartButtonRef.current?.focus();
  };
  const handleAddPartTab = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Tab" || event.shiftKey || lastPartTabRef.current === null) return;
    const deleteButton = deletePartButtonRefs.current[lastPartTabRef.current];
    lastPartTabRef.current = null;
    if (!deleteButton) return;
    event.preventDefault();
    deleteButton.focus();
  };

  const save = async () => {
    if (!service.carId) { addToast(t("serviceCarRequired"), "error"); return; }
    const validParts = parts.every((part) => part.partName.trim().length > 0 && part.partName.trim().length <= 200
      && /^\d+$/.test(part.quantity) && Number.isSafeInteger(Number(part.quantity)) && Number(part.quantity) > 0
      && parseUnitPrice(part.unitPrice) !== null
      && Number.isSafeInteger(Number(part.quantity) * (parseUnitPrice(part.unitPrice) ?? 0)));
    if (!validParts) { addToast(t("servicePartInvalid"), "error"); return; }
    setSaving(true);
    try {
      const request = {
        service: { ...service, complaints: service.complaints?.trim() || null, applicationDate: service.applicationDate ?? new Date(), faults: parseLines(faultsText), damageOnReceive: parseLines(damageReceiveText), damageDuringRepair: parseLines(damageDuringText) },
        parts: parts.map((part) => ({ partId: part.partId, partName: titleCasePart(part.partName.trim()), quantity: Number(part.quantity), unitPriceKurus: parseUnitPrice(part.unitPrice)! })),
      };
      const result = serviceId
        ? await window.electron.ipcRenderer.invoke("update-service", { id: serviceId, ...request })
        : await window.electron.ipcRenderer.invoke("add-service", request);
      if (!result.success || !result.data) { addToast(t("serviceUnexpectedError"), "error"); return; }
      setInitialSnapshot(formSnapshot);
      addToast(serviceId ? t("serviceUpdated") : t("serviceCreated"), "success");
      const savedId = result.data.service.serviceId;
      if (savedId) {
        closeTab(formTabId);
        openTab({ type: "service", title: selectedCar?.plateNumber || t("serviceProfileTitle"), entityId: savedId, isProfile: true });
      }
    } catch (error) { addToast(t("serviceUnexpectedError"), "error"); }
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
          <div className={styles.vehiclePicker} ref={carPickerRef}>
            <button type="button" className={`${styles.input} ${styles.vehicleTrigger}`} aria-expanded={carPickerOpen} onClick={() => setCarPickerOpen((open) => !open)}>
              <span className={styles.selectedVehicle}>{selectedCar ? <><strong>{selectedCar.plateNumber || "—"}</strong><small>{carLabel(selectedCar)}</small></> : t("serviceCarSelect")}</span>
              <span className={styles.chevron}>⌄</span>
            </button>
            {carPickerOpen && <div className={styles.vehicleDropdown}>
              <input autoFocus className={styles.vehicleSearch} value={carSearch} onChange={(event) => setCarSearch(event.target.value)} placeholder={t("serviceCarSearchPlaceholder")} aria-label={t("serviceCarSearchPlaceholder")} onKeyDown={(event) => { if (event.key === "Escape") setCarPickerOpen(false); if (event.key === "Enter" && filteredCars[0]) selectCar(filteredCars[0]); }} />
              <div className={styles.vehicleOptions}>
                {filteredCars.length === 0 && <div className={styles.vehicleEmpty}>{t("serviceNoCarMatch")}</div>}
                {filteredCars.map((car) => <button type="button" key={car.carId} className={`${styles.vehicleOption} ${car.carId === service.carId ? styles.vehicleOptionSelected : ""}`} onClick={() => selectCar(car)}>
                  <span><strong>{car.plateNumber || "—"}</strong><small>{carLabel(car)}</small><small>{customers.find((customer) => customer.id === car.customerId)?.fullName ?? ""}</small></span>
                  {car.carId === service.carId && <span className={styles.selectedMark}>✓</span>}
                </button>)}
              </div>
            </div>}
          </div>
          <label>{t("serviceCustomer")}</label>
          <div className={styles.vehiclePicker} ref={customerPickerRef}>
            <button type="button" className={`${styles.input} ${styles.vehicleTrigger}`} disabled={!canPickCustomer} aria-expanded={customerPickerOpen}
              onClick={() => setCustomerPickerOpen((open) => !open)}>
              <span className={styles.selectedVehicle}>{selectedCustomer ? <><strong>{selectedCustomer.fullName}</strong><small>{selectedCustomer.phones?.[0]?.number ?? ""}</small></> : (canPickCustomer ? t("serviceNoCustomer") : t("serviceCarSelect"))}</span>
              <span className={styles.chevron}>⌄</span>
            </button>
            {customerPickerOpen && canPickCustomer && <div className={styles.vehicleDropdown}>
              <input autoFocus className={styles.vehicleSearch} value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder={t("customerSearch")} aria-label={t("customerSearch")} />
              <div className={styles.vehicleOptions}>
                {filteredCustomers.map((customer) => <button type="button" key={customer.id} className={styles.vehicleOption}
                  onClick={() => { update("customerId", customer.id); setCustomerPickerOpen(false); setCustomerSearch(""); }}>
                  <span><strong>{customer.fullName}</strong><small>{customer.phones?.[0] ? `${customer.phones[0].countryCode} ${customer.phones[0].number}` : ""}</small></span>
                  {service.customerId === customer.id && <span className={styles.selectedMark}>✓</span>}
                </button>)}
                {filteredCustomers.length === 0 && <div className={styles.vehicleEmpty}>{t('customerNotFound')}</div>}
              </div>
            </div>}
          </div>
          <div className={styles.twoCol}>
            <LocalizedDateTimeField fieldClassName={styles.field} inputClassName={styles.input} label={t("serviceApplicationDate")} value={toDateTimeInput(service.applicationDate)} onChange={(v) => update("applicationDate", fromDateTimeInput(v))} />
            <LocalizedDateTimeField fieldClassName={styles.field} inputClassName={styles.input} label={t("serviceAppointmentDate")} value={toDateTimeInput(service.appointmentDate)} onChange={(v) => update("appointmentDate", fromDateTimeInput(v))} />
            <FormField fieldClassName={styles.field} inputClassName={styles.input} label={t("serviceKm")} type="text" inputMode="numeric" value={formatKm(service.km)} onChange={(v) => update("km", v.replace(/\D/g, "") ? Number(v.replace(/\D/g, "")) : null)} />
            <FormField fieldClassName={styles.field} inputClassName={styles.input} label={t("serviceJobDuration")} type="number" min="0" value={service.jobDuration ?? ""} onChange={(v) => update("jobDuration", v === "" ? null : Number(v))} />
          </div>
        </section>

        <section className={styles.card}>
          <h3>{t("serviceDamageSection")}</h3>
          <label className={styles.damageOption}><input type="checkbox" checked={service.hasDamageOnReceive} onChange={(e) => update("hasDamageOnReceive", e.target.checked)} /><span className={styles.checkVisual} aria-hidden="true">✓</span><span>{t("serviceDamageOnReceive")}</span></label>
          {service.hasDamageOnReceive && <div className={styles.damageDetail}><textarea className={styles.textareaSmall} value={damageReceiveText} onChange={(e) => setDamageReceiveText(e.target.value)} /><small className={styles.helpText}>{t("serviceOnePerLine")}</small></div>}
          <label className={styles.damageOption}><input type="checkbox" checked={service.hasDamageDuringRepair ?? false} onChange={(e) => update("hasDamageDuringRepair", e.target.checked)} /><span className={styles.checkVisual} aria-hidden="true">✓</span><span>{t("serviceDamageDuringRepair")}</span></label>
          {service.hasDamageDuringRepair && <div className={styles.damageDetail}><textarea className={styles.textareaSmall} value={damageDuringText} onChange={(e) => setDamageDuringText(e.target.value)} /><small className={styles.helpText}>{t("serviceOnePerLine")}</small></div>}
        </section>

        <section className={`${styles.card} ${styles.partsCard}`}>
          <div className={styles.sectionHeader}><h3>{t("servicePartsSection")}</h3><button type="button" className={styles.secondaryButton} ref={addPartButtonRef} onKeyDown={handleAddPartTab} onClick={() => { lastPartTabRef.current = null; setParts((current) => [...current, { partName: "", quantity: "1", unitPrice: "" }]); }}>+ {t("serviceAddPart")}</button></div>
          {parts.length === 0 ? <div className={styles.emptyParts}>{t("serviceNoParts")}</div> : <div className={styles.partsList}>
            <div className={styles.partRowLabels}><span>{t("servicePartName")}</span><span>{t("servicePartQuantity")}</span><span>{t("servicePartPrice")}</span><span>{t("servicePartTotal")}</span><span /></div>
            {parts.map((part, index) => {
              const quantity = Number(part.quantity);
              const unitPriceKurus = parseUnitPrice(part.unitPrice);
              const valid = /^\d+$/.test(part.quantity) && Number.isSafeInteger(quantity) && quantity > 0 && unitPriceKurus !== null && Number.isSafeInteger(quantity * unitPriceKurus);
              return <div className={styles.partRow} key={index}>
                <input className={styles.input} aria-label={t("servicePartName")} value={part.partName} onChange={(e) => setParts((current) => current.map((item, i) => i === index ? { ...item, partName: titleCasePart(e.target.value) } : item))}/>
                <input className={styles.input} type="number" min="1" step="1" aria-label={t("servicePartQuantity")} value={part.quantity} onChange={(e) => setParts((current) => current.map((item, i) => i === index ? { ...item, quantity: e.target.value } : item))}/>
                <input className={styles.input} inputMode="decimal" aria-label={t("servicePartPrice")} onKeyDown={(event) => handleUnitPriceTab(event, index)} value={part.unitPrice} onChange={(e) => setParts((current) => current.map((item, i) => i === index ? { ...item, unitPrice: e.target.value } : item))}/>
                <strong className={styles.lineTotal}>{valid && unitPriceKurus !== null ? formatPrice(quantity * unitPriceKurus) : "—"}</strong>
                <button type="button" ref={(element) => { deletePartButtonRefs.current[index] = element; }} aria-label={t("serviceDelete")} className={styles.removePart} onClick={() => setParts((current) => current.filter((_, i) => i !== index))}>×</button>
              </div>;
            })}
            <div className={styles.partsSummary}><span>{t("servicePartsSum")}:</span><strong>{formatPrice(parts.reduce((sum, part) => {
              const qty = Number(part.quantity);
              const kurus = parseUnitPrice(part.unitPrice);
              return /^\d+$/.test(part.quantity) && Number.isSafeInteger(qty) && qty > 0 && kurus !== null && Number.isSafeInteger(qty * kurus) ? sum + qty * kurus : sum;
            }, 0))}</strong></div>
          </div>}
        </section>
        <section className={styles.card}>
          <h3>{t("serviceFinancialSection")}</h3>
          <div className={styles.twoCol}>
            <FormField fieldClassName={styles.field} inputClassName={styles.input} label={t("serviceLaborCharge")} type="number" min="0" step="0.01" value={service.laborCharge ?? ""} onChange={(v) => update("laborCharge", v === "" ? null : Number(v))} />
            <FormField fieldClassName={styles.field} inputClassName={styles.input} label={t("serviceTotalCharge")} type="number" min="0" step="0.01" placeholder={suggestedTotal} value={service.totalCharge ?? ""} onChange={(v) => update("totalCharge", v === "" ? null : Number(v))} />
            <LocalizedDateTimeField fieldClassName={styles.field} inputClassName={styles.input} label={t("serviceTargetDelivery")} value={toDateTimeInput(service.targetDeliveryDate)} onChange={(v) => update("targetDeliveryDate", fromDateTimeInput(v))} />
            <LocalizedDateTimeField fieldClassName={styles.field} inputClassName={styles.input} label={t("serviceDeliveryDate")} value={toDateTimeInput(service.deliveryDate)} onChange={updateDeliveryDate} />
          </div>
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={service.isDelivered ?? false} onChange={(e) => handleDeliveredChange(e.target.checked)} />
            <span className={styles.checkVisual} aria-hidden="true">✓</span>
            <span className={styles.checkText}>{t("serviceDelivered")}</span>
          </label>
        </section>

        <section className={`${styles.card} ${styles.notesCard}`}>
          <h3>{t("serviceComplaintSection")}</h3>
          <div className={styles.notesGrid}>
            <div className={styles.noteField}><label>{t("serviceComplaints")}</label><textarea className={styles.textarea} value={service.complaints ?? ""} onChange={(e) => update("complaints", e.target.value)} maxLength={4000} /></div>
            <div className={styles.noteField}><label>{t("serviceExtraRequests")}</label><textarea className={styles.textarea} value={service.extraRequests ?? ""} onChange={(e) => update("extraRequests", e.target.value)} maxLength={4000} /></div>
            <div className={styles.noteField}><label>{t("serviceFaults")}</label><textarea className={styles.textarea} value={faultsText} onChange={(e) => setFaultsText(e.target.value)} /><small className={styles.helpText}>{t("serviceOnePerLine")}</small></div>
          </div>
          <div className={styles.noteField} style={{ marginTop: 10 }}>
            <label>{t("advisorNotes")}</label>
            <textarea className={styles.textarea} value={service.advisorNotes ?? ""} onChange={(e) => update("advisorNotes", capitalizeSentenceStarts(e.target.value))} maxLength={10000} style={{ minHeight: 80, width: "100%" }} />
          </div>
        </section>

      </div>
      {serviceId && <ServicePhotoGallery serviceId={serviceId} editable />}
    </div>
    <div className={styles.footer}><button className={styles.cancelButton} onClick={() => closeTab(formTabId)} type="button">{t("cancel")}</button><button className={styles.saveButton} disabled={saving} onClick={() => void save()} type="button">{saving ? t("serviceSaving") : serviceId ? t("serviceSaveChanges") : t("serviceCreate")}</button></div>
  </div>;
};


export default ServiceForm;
