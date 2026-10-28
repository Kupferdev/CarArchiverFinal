import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./CarForm.module.css";
import { useTabStore } from "../../store/tabStore";
import { useToastStore } from "../../store/toastStore";
import type { Car } from "../../shared/types/car";
import type { Brand } from "../../shared/types/brand";
import type { CustomerViewDto } from "../../shared/dtos/customerDtos";
import type { BodyTypeOption, FuelTypeOption } from "../../shared/ipcApi";

const emptyCar: Car = {
  customerId: null,
  brandId: null,
  model: "",
  year: null,
  vinNumber: "",
  plateNumber: "",
  km: null,
  fuelType: null,
  bodyType: null,
  engineVolumeCc: null,
  notes: "",
};

const formatKm = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);
};

const normalizeFirstLetter = (value: string) => {
  const trimmed = value.trimStart();
  if (!trimmed) return "";
  return trimmed.charAt(0).toLocaleUpperCase("tr-TR") + trimmed.slice(1);
};

const CustomerPicker: React.FC<{
  customers: CustomerViewDto[];
  value: number | null;
  onChange: (value: number | null) => void;
  excludedIds?: number[];
}> = ({ customers, value, onChange, excludedIds = [] }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const excluded = useMemo(() => new Set(excludedIds), [excludedIds]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const selected = customers.find((customer) => customer.id === value);
  const filteredCustomers = useMemo(() => {
    const term = search.toLocaleLowerCase("tr-TR").trim();
    return [...customers]
      .filter((customer) => !excluded.has(customer.id) || customer.id === value)
      .sort((a, b) => a.fullName.localeCompare(b.fullName, "tr-TR"))
      .filter((customer) => {
        if (!term) return true;
        const phone = customer.phones?.[0] ? `${customer.phones[0].countryCode} ${customer.phones[0].number}` : "";
        return `${customer.fullName} ${phone}`.toLocaleLowerCase("tr-TR").includes(term);
      });
  }, [customers, excluded, search, value]);

  return (
    <div className={styles.customerPicker} ref={rootRef}>
      <button
        type="button"
        className={`${styles.pickerButton} ${open ? styles.pickerButtonOpen : ""}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selected ? styles.pickerValue : styles.pickerPlaceholder}>
          {selected?.fullName ?? t("carNoCustomer")}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className={styles.customerDropdown}>
          <div className={styles.customerSearchWrap}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input autoFocus className={styles.customerSearch} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("carCustomerSearch")} />
          </div>

          <button
            type="button"
            className={`${styles.customerOption} ${value === null ? styles.customerOptionSelected : ""}`}
            onClick={() => { onChange(null); setOpen(false); setSearch(""); }}
          >
            <span className={styles.customerAvatar}>—</span>
            <span>{t("carNoCustomer")}</span>
          </button>

          <div className={styles.customerOptions}>
            {filteredCustomers.map((customer) => (
              <button
                type="button"
                key={customer.id}
                className={`${styles.customerOption} ${customer.id === value ? styles.customerOptionSelected : ""}`}
                onClick={() => { onChange(customer.id); setOpen(false); setSearch(""); }}
              >
                <span className={styles.customerAvatar}>{customer.fullName.charAt(0).toLocaleUpperCase("tr-TR")}</span>
                <span className={styles.customerOptionText}>
                  <strong>{customer.fullName}</strong>
                  {customer.phones?.[0] && <small>{customer.phones[0].countryCode} {customer.phones[0].number}</small>}
                </span>
                {customer.id === value && <span className={styles.checkMark}>✓</span>}
              </button>
            ))}
            {filteredCustomers.length === 0 && <div className={styles.customerEmpty}>{t("carCustomerNotFound")}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const YearPicker: React.FC<{
  value: number | null | undefined;
  onChange: (value: number | null) => void;
}> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value ? String(value) : "");
  const rootRef = useRef<HTMLDivElement>(null);
  const minYear = 1886;
  const maxYear = new Date().getFullYear() + 1;
  const years = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, index) => maxYear - index),
    [maxYear],
  );

  useEffect(() => {
    setInputValue(value ? String(value) : "");
  }, [value]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const applyTypedYear = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    setInputValue(digits);
    if (digits.length === 4) {
      const year = Number(digits);
      if (year >= minYear && year <= maxYear) onChange(year);
    } else if (!digits) {
      onChange(null);
    }
  };

  const handleBlur = () => {
    if (!inputValue) {
      onChange(null);
      return;
    }
    const year = Number(inputValue);
    if (year >= minYear && year <= maxYear) {
      onChange(year);
    } else {
      setInputValue(value ? String(value) : "");
    }
  };

  return (
    <div className={styles.yearPicker} ref={rootRef}>
      <div className={`${styles.yearInputWrap} ${open ? styles.yearButtonOpen : ""}`}>
        <input
          className={styles.yearInput}
          inputMode="numeric"
          maxLength={4}
          value={inputValue}
          onChange={(event) => applyTypedYear(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          placeholder={t("carYearPlaceholder")}
          aria-label={t("carYear")}
        />
        <button
          type="button"
          className={styles.yearToggle}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((current) => !current)}
          aria-label={t("carYearSelect")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
      </div>
      {open && (
        <div className={styles.yearDropdown}>
          <div className={styles.yearGrid}>
            {years.map((year) => (
              <button
                key={year}
                type="button"
                className={`${styles.yearOption} ${year === value ? styles.yearOptionSelected : ""}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => { onChange(year); setInputValue(String(year)); setOpen(false); }}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OldCustomerPicker: React.FC<{
  customers: CustomerViewDto[];
  existingIds: number[];
  currentCustomerId: number | null;
  onAdd: (customerId: number) => void;
  disabled?: boolean;
}> = ({ customers, existingIds, currentCustomerId, onAdd, disabled = false }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options = useMemo(() => {
    const term = search.toLocaleLowerCase("tr-TR").trim();
    const excluded = new Set([currentCustomerId ?? -1, ...existingIds]);
    return customers
      .filter((customer) => !excluded.has(customer.id))
      .filter((customer) => {
        const phone = customer.phones?.[0] ? `${customer.phones[0].countryCode} ${customer.phones[0].number}` : "";
        return `${customer.fullName} ${phone}`.toLocaleLowerCase("tr-TR").includes(term);
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName, "tr-TR"));
  }, [customers, existingIds, currentCustomerId, search]);

  return (
    <div className={styles.oldCustomerPicker} ref={rootRef}>
      <button type="button" className={styles.addOldCustomerBtn} disabled={disabled} onClick={() => setOpen((v) => !v)} aria-label={t("carAddOldCustomer")}>
        <span>+</span>
      </button>
      {open && !disabled && (
        <div className={styles.oldCustomerDropdown}>
          <div className={styles.customerSearchWrap}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input autoFocus className={styles.customerSearch} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("carCustomerSearch")} />
          </div>
          <div className={styles.customerOptions}>
            {options.map((customer) => (
              <button type="button" key={customer.id} className={styles.customerOption} onClick={() => { onAdd(customer.id); setOpen(false); setSearch(""); }}>
                <span className={styles.customerAvatar}>{customer.fullName.charAt(0).toLocaleUpperCase("tr-TR")}</span>
                <span className={styles.customerOptionText}><strong>{customer.fullName}</strong>{customer.phones?.[0] && <small>{customer.phones[0].countryCode} {customer.phones[0].number}</small>}</span>
              </button>
            ))}
            {options.length === 0 && <div className={styles.customerEmpty}>{t("carCustomerNotFound")}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v5M14 11v5" />
  </svg>
);

const CarForm: React.FC<{ carId?: number; customerId?: number; tabId?: string }> = ({ carId, customerId, tabId }) => {
  const { t, i18n } = useTranslation();
  const { activeTabId, closeTab, openTab, setTabDirty } = useTabStore();
  const { addToast } = useToastStore();
  const [form, setForm] = useState<Car>({ ...emptyCar, customerId: customerId ?? null });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [customers, setCustomers] = useState<CustomerViewDto[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelTypeOption[]>([]);
  const [bodyTypes, setBodyTypes] = useState<BodyTypeOption[]>([]);
  const [newBrand, setNewBrand] = useState("");
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [kmInput, setKmInput] = useState("");
  const [kmFocused, setKmFocused] = useState(false);
  const [loading, setLoading] = useState(!!carId);
  const [originalCustomerId, setOriginalCustomerId] = useState<number | null>(null);
  const [pendingCustomerId, setPendingCustomerId] = useState<number | null>(null);
  const [showCustomerChangePrompt, setShowCustomerChangePrompt] = useState(false);
  const [addPreviousToHistory, setAddPreviousToHistory] = useState(true);
  const [oldCustomerIds, setOldCustomerIds] = useState<number[]>([]);
  const [savingOldCustomer, setSavingOldCustomer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState('');
  const formTabId = tabId ?? activeTabId;


  const formSnapshot = JSON.stringify({ form, oldCustomerIds });

  useEffect(() => {
    if (!carId) {
      setInitialSnapshot(JSON.stringify({
        form: { ...emptyCar, customerId: customerId ?? null },
        oldCustomerIds: [],
      }));
    }
  }, [carId, customerId]);

  useEffect(() => {
    if (!initialSnapshot) return;
    setTabDirty(formTabId, formSnapshot !== initialSnapshot);
  }, [formTabId, formSnapshot, initialSnapshot, setTabDirty]);

  useEffect(() => {
    const load = async () => {
      // Locale-sensitive fuel/body options are fetched exclusively by the language effect below.
      // Never let the initial car fetch overwrite freshly translated dropdown labels.
      const [brandsRes, customersRes] = await Promise.all([
        window.electron.ipcRenderer.invoke("get-all-brands"),
        window.electron.ipcRenderer.invoke("get-all-customers"),
      ]);
      if (brandsRes.success) setBrands(brandsRes.data ?? []);
      setCustomers(customersRes ?? []);

      if (carId) {
        const carRes = await window.electron.ipcRenderer.invoke("get-car", carId);
        if (carRes.success && carRes.data) {
          const loadedOldCustomerIds = (carRes.data.oldCustomerId ?? []).map(Number).filter(Number.isInteger);
          setForm(carRes.data);
          setOriginalCustomerId(carRes.data.customerId ?? null);
          setOldCustomerIds(loadedOldCustomerIds);
          setKmInput(formatKm(carRes.data.km));
          setInitialSnapshot(JSON.stringify({ form: carRes.data, oldCustomerIds: loadedOldCustomerIds }));
        } else addToast(i18n.t("carUnexpectedError"), "error");
        setLoading(false);
      }
    };
    void load();
  }, [carId, addToast, i18n]);

  // Locale switches must only refresh translated option labels; do not reload and overwrite a dirty form.
  useEffect(() => {
    let alive = true;
    void Promise.all([
      window.electron.ipcRenderer.invoke('get-all-fuel-types', i18n.language),
      window.electron.ipcRenderer.invoke('get-all-body-types', i18n.language)
    ]).then(([fuel, body]) => {
      if (!alive) return;
      if (fuel.success) setFuelTypes(fuel.data ?? []);
      if (body.success) setBodyTypes(body.data ?? []);
    }).catch(console.error);
    return () => { alive = false; };
  }, [i18n.language]);

  const sortedBrands = useMemo(() => [...brands].sort((a, b) => a.brandName.localeCompare(b.brandName, "tr-TR")), [brands]);
  const sortedFuelTypes = useMemo(() => [...fuelTypes].sort((a, b) => a.fuelTypeName.localeCompare(b.fuelTypeName, i18n.language)), [fuelTypes, i18n.language]);
  const sortedBodyTypes = useMemo(() => [...bodyTypes].sort((a, b) => a.bodyTypeName.localeCompare(b.bodyTypeName, i18n.language)), [bodyTypes, i18n.language]);
  const setField = <K extends keyof Car>(field: K, value: Car[K]) => setForm((current) => ({ ...current, [field]: value }));

  const handleCustomerChange = (value: number | null) => {
    if (carId && originalCustomerId !== null && value !== originalCustomerId) {
      setPendingCustomerId(value);
      setAddPreviousToHistory(true);
      setShowCustomerChangePrompt(true);
      return;
    }
    setField("customerId", value);
  };

  const confirmCustomerChange = () => {
    setField("customerId", pendingCustomerId);
    setShowCustomerChangePrompt(false);
  };

  const addNewBrand = async () => {
    const value = newBrand.trim();
    if (!value) return;
    const result = await window.electron.ipcRenderer.invoke("add-brand", { brandName: value });
    if (!result.success || !result.data) { addToast(t("carUnexpectedError"), "error"); return; }
    const brand = result.data;
    setBrands((current) => [...current.filter((item) => item.brandId !== brand.brandId), brand].sort((a, b) => a.brandName.localeCompare(b.brandName, "tr-TR")));
    setField("brandId", brand.brandId ?? null);
    setNewBrand("");
    setShowNewBrand(false);
    addToast(t("brandAdded"), "success");
  };

  const addOldCustomer = async (customerId: number) => {
    if (!carId || oldCustomerIds.includes(customerId)) return;
    setSavingOldCustomer(true);
    const result = await window.electron.ipcRenderer.invoke("add-old-customer", { carId, customerId });
    setSavingOldCustomer(false);
    if (!result.success) { addToast(t("carUnexpectedError"), "error"); return; }
    setOldCustomerIds((current) => [...current, customerId]);
    addToast(t("carOldCustomerAdded"), "success");
  };

  const removeOldCustomer = async (customerId: number) => {
    if (!carId) return;
    const result = await window.electron.ipcRenderer.invoke("remove-old-customer", { carId, customerId });
    if (!result.success) { addToast(t("carUnexpectedError"), "error"); return; }
    setOldCustomerIds((current) => current.filter((id) => id !== customerId));
    addToast(t("carOldCustomerRemoved"), "success");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (!form.plateNumber?.trim()) { addToast(t("carPlateRequired"), "error"); return; }

    const payload = {
      customerId: form.customerId ?? null,
      brandId: form.brandId ?? null,
      model: form.model?.trim() || null,
      year: form.year ?? null,
      vinNumber: form.vinNumber?.trim().toLocaleUpperCase("tr-TR") || null,
      plateNumber: form.plateNumber.trim().toLocaleUpperCase("tr-TR"),
      km: form.km ?? null,
      fuelType: form.fuelType ?? null,
      bodyType: form.bodyType ?? null,
      engineVolumeCc: form.engineVolumeCc ?? null,
      notes: form.notes?.trim() || null,
    };

    const customerChanged = carId && originalCustomerId !== null && form.customerId !== originalCustomerId;
    const willRecordPreviousOwner = Boolean(customerChanged && addPreviousToHistory);

    setSubmitting(true);
    const result = carId
      ? await window.electron.ipcRenderer.invoke("update-car", {
          id: carId,
          data: payload,
          oldCustomerIdToAdd: willRecordPreviousOwner ? originalCustomerId : null,
        })
      : await window.electron.ipcRenderer.invoke("add-car", payload);
    setSubmitting(false);

    if (!result.success) { addToast(t("carUnexpectedError"), "error"); return; }

    setInitialSnapshot(formSnapshot);
    addToast(carId ? (willRecordPreviousOwner ? t("carUpdatedWithHistory") : t("carUpdated")) : t("carCreated"), "success");
    const savedId = carId ?? result.data?.carId;
    if (savedId) {
      openTab({ type: "car", title: t("carProfileTitle"), entityId: savedId, isProfile: true });
      closeTab(formTabId);
    }
  };

  const oldCustomers = useMemo(() => oldCustomerIds.map((id) => customers.find((customer) => customer.id === id)).filter((customer): customer is CustomerViewDto => Boolean(customer)), [oldCustomerIds, customers]);

  if (loading) return <div className={styles.container}>{t("carLoading")}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.title}>{carId ? t("carEditTitle") : t("carNewTitle")}</div>
      <form className={styles.formWrapper} onSubmit={submit}>
        <div className={styles.formGrid}>
          <div className={styles.column}>
            <div className={styles.sectionTitle}>{t("carBasicSection")}</div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("carCustomer")}</label>
              <CustomerPicker customers={customers} value={form.customerId ?? null} onChange={handleCustomerChange} excludedIds={oldCustomerIds} />
              {showCustomerChangePrompt && (
                <div className={styles.customerChangePrompt}>
                  <div className={styles.promptTitle}>
                    {t("carCustomerChangeTitle", {
                      previous: customers.find((customer) => customer.id === originalCustomerId)?.fullName ?? "",
                      next: customers.find((customer) => customer.id === pendingCustomerId)?.fullName ?? t("carNoCustomer"),
                    })}
                  </div>
                  <label className={styles.checkboxRow}>
                    <input type="checkbox" checked={addPreviousToHistory} onChange={(event) => setAddPreviousToHistory(event.target.checked)} />
                    <span>{t("carAddPreviousCustomerToHistory")}</span>
                  </label>
                  <div className={styles.promptActions}>
                    <button type="button" className={styles.cancelBtnSmall} onClick={() => setShowCustomerChangePrompt(false)}>{t("cancel")}</button>
                    <button type="button" className={styles.submitBtnSmall} onClick={confirmCustomerChange}>{t("carCustomerChangeContinue")}</button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.compactGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("carBrand")}</label>
                <div className={styles.dynamicRow}>
                  <select className={styles.input} value={form.brandId ?? ""} onChange={(event) => setField("brandId", event.target.value ? Number(event.target.value) : null)}>
                    <option value="">{t("carBrandSelect")}</option>
                    {sortedBrands.map((brand) => <option key={brand.brandId} value={brand.brandId}>{brand.brandName}</option>)}
                  </select>
                  <button type="button" className={styles.addBtn} onClick={() => setShowNewBrand((value) => !value)}>+ {t("brandNew")}</button>
                </div>
                {showNewBrand && (
                  <div className={styles.inlineAddBox}>
                    <input className={styles.input} value={newBrand} maxLength={40} onChange={(event) => setNewBrand(event.target.value)} placeholder={t("brandNewPlaceholder")} />
                    <div className={styles.inlineAddActions}>
                      <button type="button" className={styles.addBtnPrimary} onClick={() => void addNewBrand()}>{t("brandAdd")}</button>
                      <button type="button" className={styles.addBtnSecondary} onClick={() => setShowNewBrand(false)}>{t("cancel")}</button>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t("carModel")}</label>
                <input className={styles.input} maxLength={100} value={form.model ?? ""} onChange={(event) => setField("model", normalizeFirstLetter(event.target.value))} placeholder="" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t("carYear")}</label>
                <YearPicker value={form.year} onChange={(value) => setField("year", value)} />
              </div>
            </div>

            <div className={styles.sectionTitle}>{t("carTechnicalSection")}</div>
            <div className={styles.compactGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("carFuelType")}</label>
                <select className={styles.input} value={form.fuelType ?? ""} onChange={(event) => setField("fuelType", event.target.value ? Number(event.target.value) : null)}>
                  <option value="">{t("carFuelTypeSelect")}</option>
                  {sortedFuelTypes.map((fuel) => <option key={fuel.fuelTypeId} value={fuel.fuelTypeId}>{fuel.fuelTypeName}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("carBodyType")}</label>
                <select className={styles.input} value={form.bodyType ?? ""} onChange={(event) => setField("bodyType", event.target.value ? Number(event.target.value) : null)}>
                  <option value="">{t("carBodyTypeSelect")}</option>
                  {sortedBodyTypes.map((body) => <option key={body.bodyTypeId} value={body.bodyTypeId}>{body.bodyTypeName}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.column}>
            <div className={styles.sectionTitle}>{t("carIdentitySection")}</div>
            <div className={styles.compactGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("carPlate")} *</label>
                <input className={`${styles.input} ${styles.uppercaseInput}`} maxLength={20} value={form.plateNumber ?? ""} onChange={(event) => setField("plateNumber", event.target.value.toLocaleUpperCase("tr-TR"))} placeholder={t("carPlatePlaceholder")} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("carVin")}</label>
                <input className={`${styles.input} ${styles.uppercaseInput}`} maxLength={32} value={form.vinNumber ?? ""} onChange={(event) => setField("vinNumber", event.target.value.toLocaleUpperCase("tr-TR"))} placeholder={t("carVinPlaceholder")} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("carKm")}</label>
                <input className={styles.input} inputMode="numeric" value={kmFocused ? kmInput.replace(/\D/g, "") : formatKm(form.km)} onFocus={() => { setKmFocused(true); setKmInput(form.km == null ? "" : String(Math.trunc(form.km))); }} onChange={(event) => { const raw = event.target.value.replace(/\D/g, ""); setKmInput(raw); setField("km", raw ? Number(raw) : null); }} onBlur={() => { setKmFocused(false); setKmInput(formatKm(form.km)); }} placeholder={t("carKmPlaceholder")} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("carEngineVolume")}</label>
                <div className={styles.unitInputWrap}>
                  <input className={styles.input} type="text" inputMode="numeric" pattern="[0-9]*" value={form.engineVolumeCc ?? ""} onChange={(event) => { const raw = event.target.value.replace(/\D/g, ""); setField("engineVolumeCc", raw ? Number(raw) : null); }} placeholder={t("carEngineVolumePlaceholder")} />
                  <span className={styles.inputUnit}>cc</span>
                </div>
              </div>
            </div>

            <div className={`${styles.formGroup} ${styles.notesGroup}`}>
              <label className={styles.label}>{t("carNotes")}</label>
              <textarea className={styles.textarea} maxLength={2000} value={form.notes ?? ""} onChange={(event) => setField("notes", event.target.value)} placeholder={t("carNotesPlaceholder")} rows={5} />
              <div className={styles.counter}>{(form.notes ?? "").length}/2000</div>
            </div>
          </div>
        </div>

        {carId && (
          <div className={styles.oldCustomersSection}>
            <div className={styles.oldCustomersHeader}>
              <div>
                <div className={styles.sectionTitle}>{t("carOldCustomers")}</div>
                <div className={styles.oldCustomersHint}>{t("carOldCustomersHint")}</div>
              </div>
              <OldCustomerPicker customers={customers} existingIds={oldCustomerIds} currentCustomerId={form.customerId ?? null} onAdd={(id) => void addOldCustomer(id)} disabled={savingOldCustomer} />
            </div>
            <div className={styles.oldCustomerCards}>
              {oldCustomers.map((customer) => (
                <div className={styles.oldCustomerCard} key={customer.id}>
                  <div className={styles.oldCustomerAvatar}>{customer.fullName.charAt(0).toLocaleUpperCase("tr-TR")}</div>
                  <div className={styles.oldCustomerInfo}>
                    <strong>{customer.fullName}</strong>
                    {customer.phones?.[0] && <span>{customer.phones[0].countryCode} {customer.phones[0].number}</span>}
                    {customer.emails?.[0] && <span>{customer.emails[0].address}</span>}
                  </div>
                  <button type="button" className={styles.oldCustomerDelete} disabled={savingOldCustomer} onClick={() => void removeOldCustomer(customer.id)} aria-label={t("carRemoveOldCustomer")}><TrashIcon /></button>
                </div>
              ))}
              {oldCustomers.length === 0 && <div className={styles.oldCustomersEmpty}>{t("carNoOldCustomers")}</div>}
            </div>
          </div>
        )}

        <div className={styles.formFooter}>
          <div />
          <div className={styles.footerActions}>
            <button type="button" className={styles.cancelBtn} disabled={submitting} onClick={() => closeTab(formTabId)}>{t("cancel")}</button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? t("carSaving") : carId ? t("carSaveChanges") : t("carCreate")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CarForm;
