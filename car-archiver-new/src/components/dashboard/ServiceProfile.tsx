import { ProfileActions } from "../common/ProfileActions";
import { ServicePhotoGallery } from "./ServicePhotoGallery";
import { buildServicePrintHtml } from "../../utils/printService";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ServiceProfile.module.css";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import type { Service } from "../../shared/types/service";
import type { Part } from "../../shared/types/part";
import type { Car } from "../../shared/types/car";
import type { Brand } from "../../shared/types/brand";
import type { CustomerViewDto } from "../../shared/dtos/customerDtos";
import type { BodyTypeOption, FuelTypeOption } from "../../shared/ipcApi";
import { useTabStore } from "../../store/tabStore";
import { useToastStore } from "../../store/toastStore";

const dateTime = (value: Date | string | null | undefined, locale: string) => value ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "-";
const dateOnly = (value: Date | string | null | undefined, locale: string) => value ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value)) : "-";
const money = (value?: number | null) => value == null ? "-" : new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const km = (value?: number | null) => value == null ? "-" : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);

const ServiceProfile: React.FC<{ serviceId: number }> = ({ serviceId }) => {
  const { t, i18n } = useTranslation();
  const locale = ({ en:"en-US", tr:"tr-TR", fr:"fr-FR", de:"de-DE", es:"es-ES", pt:"pt-PT", zh:"zh-CN", ja:"ja-JP", ko:"ko-KR", ru:"ru-RU", nl:"nl-NL", az:"az-AZ", it:"it-IT", pl:"pl-PL" } as Record<string,string>)[i18n.language.split("-")[0]] ?? i18n.language;
  const { openTab, activeTabId, renameTab, closeTab } = useTabStore();
  const { addToast } = useToastStore();
  const [service, setService] = useState<Service | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [car, setCar] = useState<Car | null>(null);
  const [customer, setCustomer] = useState<CustomerViewDto | null>(null);
  const [brandMap, setBrandMap] = useState<Map<number, string>>(new Map());
  const [fuelTypeMap, setFuelTypeMap] = useState<Map<number, string>>(new Map());
  const [bodyTypeMap, setBodyTypeMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [includeAdvisorNotes, setIncludeAdvisorNotes] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [printBusy, setPrintBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [serviceRes, carsRes, customersRes, brandsRes, fuelRes, bodyRes] = await Promise.all([
          window.electron.ipcRenderer.invoke("get-service", serviceId),
          window.electron.ipcRenderer.invoke("get-all-cars"),
          window.electron.ipcRenderer.invoke("get-all-customers"),
          window.electron.ipcRenderer.invoke("get-all-brands"),
          window.electron.ipcRenderer.invoke("get-all-fuel-types", i18n.language),
          window.electron.ipcRenderer.invoke("get-all-body-types", i18n.language),
        ]);
        if (!serviceRes.success || !serviceRes.data) throw new Error(serviceRes.message);
        const data = serviceRes.data;
        setService(data.service);
        setParts(data.parts ?? []);
        const selectedCar = carsRes.success ? (carsRes.data ?? []).find((item) => item.carId === data.service.carId) ?? null : null;
        setCar(selectedCar);
        setCustomer((customersRes ?? []).find((item: CustomerViewDto) => item.id === data.service.customerId) ?? null);

        if (brandsRes.success) {
          setBrandMap(new Map((brandsRes.data ?? []).filter((brand: Brand) => typeof brand.brandId === "number").map((brand: Brand) => [brand.brandId as number, brand.brandName] as [number, string])));
        }
        if (fuelRes.success) {
          setFuelTypeMap(new Map((fuelRes.data ?? []).map((item: FuelTypeOption) => [item.fuelTypeId, item.fuelTypeName])));
        }
        if (bodyRes.success) {
          setBodyTypeMap(new Map((bodyRes.data ?? []).map((item: BodyTypeOption) => [item.bodyTypeId, item.bodyTypeName])));
        }
        renameTab(activeTabId, selectedCar?.plateNumber || t("serviceProfileTitle"));
      } catch (error) {
        addToast(t("serviceUnexpectedError"), "error");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [activeTabId, addToast, i18n.language, serviceId, renameTab, t]);

  const title = useMemo(() => service ? `${car?.plateNumber ?? "-"} · ${dateOnly(service.applicationDate, locale)}` : `#${serviceId}`, [car, service, serviceId, locale]);
  const brandName = car?.brandId ? brandMap.get(car.brandId) ?? "-" : "-";
  const fuelTypeName = car?.fuelType ? fuelTypeMap.get(car.fuelType) ?? "-" : "-";
  const bodyTypeName = car?.bodyType ? bodyTypeMap.get(car.bodyType) ?? "-" : "-";
  const vehicleTitle = [brandName !== "-" ? brandName : "", car?.model ?? ""].filter(Boolean).join(" ") || "-";
  const customerPhone = customer?.phones?.[0] ? `${customer.phones[0].countryCode} ${customer.phones[0].number}`.trim() : "-";
  const customerEmail = customer?.emails?.[0]?.address ?? "-";

  if (loading) return <div className={styles.loading}>{t("serviceLoading")}</div>;
  if (!service) return <div className={styles.loading}>{t("serviceNotFound")}</div>;

  const remove = async () => {
    if (deleting) return;
    setDeleting(true);
    const result = await window.electron.ipcRenderer.invoke("delete-service", serviceId);
    if (!result.success) {
      addToast(t("serviceUnexpectedError"), "error");
      setDeleting(false);
      return;
    }
    addToast(t("serviceDeleted"), "success");
    closeTab(activeTabId);
  };

  const openCar = () => car?.carId && openTab({ type: "car", title: car.plateNumber || t("carProfileTitle"), entityId: car.carId, isProfile: true });
  const openCustomer = () => customer?.id && openTab({ type: "customer", title: customer.fullName, entityId: customer.id, isProfile: true });

  const printableHtml = printOpen ? buildServicePrintHtml(service, car, customer, parts, brandName, includeAdvisorNotes) : '';
  const printAction = async (action: 'pdf' | 'print') => {
    setPrintBusy(true);
    try {
      const filename = `${car?.plateNumber || 'Arac'} ${t('serviceRecordFilename')}.pdf`;
      const result = await window.electron.ipcRenderer.invoke('service-document', {html: printableHtml, filename, action});
      if (!result.success) addToast(t('serviceUnexpectedError'), 'error');
      else if (!result.canceled) setPrintOpen(false);
    } catch (error) { addToast(t('serviceUnexpectedError'), 'error'); }
    finally { setPrintBusy(false); }
  };

  return <div className={styles.container}>
    {printOpen && <div className={styles.printOverlay} role="presentation" onMouseDown={event => {if (event.target===event.currentTarget) setPrintOpen(false);}}>
      <section className={styles.printDialog} role="dialog" aria-modal="true" aria-label={t('printRecord')}>
        <div className={styles.printToolbar}>
          <strong><PrinterGlyph/> {t('printRecord')}</strong>
          <label><input type="checkbox" checked={includeAdvisorNotes} onChange={event=>setIncludeAdvisorNotes(event.target.checked)}/> {t('includeAdvisorNotes')}</label>
          <button type="button" disabled={printBusy} onClick={()=>void printAction('pdf')}>{t('printSavePDF')}</button>
          <button type="button" disabled={printBusy} onClick={()=>void printAction('print')}>{t('printPrinter')}</button>
          <button type="button" disabled={printBusy} onClick={()=>setPrintOpen(false)} aria-label={t('cancel')}>✕</button>
        </div>
        <iframe title={t('printRecord')} className={styles.printFrame} srcDoc={printableHtml} sandbox="allow-same-origin" />
      </section>
    </div>}
    <div className={styles.header}>
      <div className={styles.headerInfo}>
        <div className={styles.kicker}>{t("serviceProfileTitle")}</div>
        <h1>{title}</h1>
        <div className={styles.subtitle}>{service.complaints?.trim() || t("serviceNoComplaint")}</div>
      </div>
      <div className={styles.headerActions}>
        <button type="button" onClick={() => setPrintOpen(true)} className={styles.printButton} title={t('printRecord')} aria-label={t('printRecord')}><PrinterGlyph/></button>
        <ProfileActions compact
          onEdit={() => openTab({ type: "service", title: `${car?.plateNumber || t("serviceProfileTitle")} · ${t("serviceEditShort")}`, entityId: serviceId })}
          onDelete={() => setDeleteOpen(true)}
          deleteLabel={t("serviceDeleteTitle")}
        />
      </div>
    </div>

    <div className={styles.summaryGrid}>
      <section className={styles.card}>
        <h3>{t("serviceBasicSection")}</h3>
        <div className={styles.infoGrid}>
          <Info
            label={t("serviceCar")}
            value={car?.plateNumber ?? "-"}
            onClick={openCar}
            preview={car ? (
              <CarPreviewCard
                plate={car.plateNumber ?? "-"}
                title={vehicleTitle}
                brand={brandName}
                model={car.model || "-"}
                year={car.year ?? "-"}
                mileage={km(car.km)}
                fuelType={fuelTypeName}
                bodyType={bodyTypeName}
                engineVolume={car.engineVolumeCc ? `${car.engineVolumeCc} cc` : "-"}
                vin={car.vinNumber || "-"}
                brandLabel={t("carBrand")}
                modelLabel={t("carModel")}
                yearLabel={t("carYear")}
                mileageLabel={t("carKm")}
                fuelTypeLabel={t("carFuelType")}
                bodyTypeLabel={t("carBodyType")}
                engineVolumeLabel={t("carEngineVolume")}
                vinLabel={t("carVin")}
              />
            ) : undefined}
          />
          <Info
            label={t("serviceCustomer")}
            value={customer?.fullName ?? "-"}
            onClick={openCustomer}
            preview={customer ? (
              <CustomerPreviewCard
                fullName={customer.fullName}
                phone={customerPhone}
                email={customerEmail}
              />
            ) : undefined}
          />
          <Info label={t("serviceApplicationDate")} value={dateTime(service.applicationDate, locale)} />
          <Info label={t("serviceAppointmentDate")} value={dateTime(service.appointmentDate, locale)} />
          <Info label={t("serviceKm")} value={km(service.km)} />
          <Info label={t("serviceJobDuration")} value={service.jobDuration == null ? "-" : new Intl.NumberFormat(locale, { style: "unit", unit: "minute", unitDisplay: "short" }).format(service.jobDuration)} />
        </div>
      </section>

      <section className={styles.card}>
        <h3>{t("serviceStatusSection")}</h3>
        <div className={styles.infoGrid}>
          <Info label={t("serviceTargetDelivery")} value={dateTime(service.targetDeliveryDate, locale)} />
          <Info label={t("serviceDeliveryDate")} value={dateTime(service.deliveryDate, locale)} />
          <Info label={t("serviceDelivered")} value={service.isDelivered ? t("serviceYes") : t("serviceNo")} />
          <Info label={t("serviceLaborCharge")} value={money(service.laborCharge)} />
          <Info label={t("serviceTotalCharge")} value={money(service.totalCharge)} />
        </div>
      </section>
    </div>

    <section className={`${styles.card} ${styles.notesCard}`}>
      <h3>{t("serviceComplaintSection")}</h3>
      <div className={styles.notePanels}>
        <TextPanel label={t("serviceComplaints")} text={service.complaints} important />
        <TextPanel label={t("serviceExtraRequests")} text={service.extraRequests} />
        <TextListPanel label={t("serviceFaults")} values={service.faults} />
        <TextPanel label={t("advisorNotes")} text={service.advisorNotes} />
      </div>
    </section>

    <div className={styles.bottomGrid}>
      <section className={styles.card}>
        <h3>{t("serviceDamageSection")}</h3>
        <div className={styles.damageGrid}>
          <TextListPanel label={t("serviceDamageOnReceive")} values={service.damageOnReceive} compact />
          <TextListPanel label={t("serviceDamageDuringRepair")} values={service.damageDuringRepair} compact />
        </div>
      </section>

      <section className={`${styles.card} ${styles.partsCard}`}>
        <h3>{t("servicePartsSection")}</h3>
        {parts.length ? (
          <div className={styles.partsTable}>
            <div className={`${styles.partRow} ${styles.partRowHeader}`}>
              <span>{t("servicePartName")}</span>
              <span>{t("servicePartQuantity")}</span>
              <span>{t("servicePartPrice")}</span>
              <span>{t("servicePartTotal")}</span>
            </div>
            {parts.map((part) => (
              <div className={styles.partRow} key={part.partId}>
                <span>{part.partName}</span>
                <span>{part.quantity}</span>
                <span>{money(part.unitPriceKurus / 100)}</span>
                <strong>{money((part.quantity * part.unitPriceKurus) / 100)}</strong>
              </div>
            ))}
            <div className={styles.partsSummary}>
              <span>{t("servicePartsSum")}</span>
              <strong>{money(parts.reduce((sum, part) => sum + part.quantity * part.unitPriceKurus, 0) / 100)}</strong>
            </div>
          </div>
        ) : <div className={styles.empty}>{t("serviceNoParts")}</div>}
      </section>
    </div>

    <ServicePhotoGallery serviceId={serviceId} />

    {deleteOpen && <DeleteConfirmDialog
      title={t("serviceDeleteTitle")}
      onCancel={() => { if (!deleting) setDeleteOpen(false); }}
      onConfirm={() => void remove()}
      busy={deleting}
    >{t("serviceDeleteConfirmation")}</DeleteConfirmDialog>}
  </div>;
};

const PrinterGlyph: React.FC = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{verticalAlign:'middle'}}><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/><path d="M18 12h.01"/></svg>;

const Info: React.FC<{ label: string; value: React.ReactNode; onClick?: () => void; preview?: React.ReactNode }> = ({ label, value, onClick, preview }) => onClick ? (
  <button className={`${styles.infoBox} ${preview ? styles.infoBoxWithPreview : ""}`} onClick={onClick} type="button">
    <span>{label}</span>
    <strong>{value}</strong>
    <i>›</i>
    {preview && <div className={styles.hoverPreview} aria-hidden="true">{preview}</div>}
  </button>
) : (
  <div className={styles.infoBox}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const CarPreviewCard: React.FC<{
  plate: string;
  title: string;
  brand: string;
  model: string;
  year: string | number;
  mileage: string;
  fuelType: string;
  bodyType: string;
  engineVolume: string;
  vin: string;
  brandLabel: string;
  modelLabel: string;
  yearLabel: string;
  mileageLabel: string;
  fuelTypeLabel: string;
  bodyTypeLabel: string;
  engineVolumeLabel: string;
  vinLabel: string;
}> = ({ plate, title, brand, model, year, mileage, fuelType, bodyType, engineVolume, vin, brandLabel, modelLabel, yearLabel, mileageLabel, fuelTypeLabel, bodyTypeLabel, engineVolumeLabel, vinLabel }) => (
  <div className={styles.carPreviewCard}>
    <div className={styles.carPreviewHeader}>
      <strong>{plate}</strong>
      <span>{title}</span>
    </div>
    <div className={styles.carPreviewGrid}>
      <PreviewItem label={brandLabel} value={brand} />
      <PreviewItem label={modelLabel} value={model} />
      <PreviewItem label={yearLabel} value={String(year)} />
      <PreviewItem label={mileageLabel} value={mileage} />
      <PreviewItem label={fuelTypeLabel} value={fuelType} />
      <PreviewItem label={bodyTypeLabel} value={bodyType} />
      <PreviewItem label={engineVolumeLabel} value={engineVolume} />
      <PreviewItem label={vinLabel} value={vin} />
    </div>
  </div>
);

const PreviewItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className={styles.previewItem}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const CustomerPreviewCard: React.FC<{ fullName: string; phone: string; email: string }> = ({ fullName, phone, email }) => (
  <div className={styles.userPreviewCard}>
    <div className={styles.userPreviewAvatar}>{fullName.charAt(0).toUpperCase()}</div>
    <div className={styles.userPreviewMain}>
      <strong>{fullName}</strong>
      <span>{phone}</span>
      <span>{email}</span>
    </div>
  </div>
);

const TextPanel: React.FC<{ label: string; text?: string | null; important?: boolean }> = ({ label, text, important = false }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const value = text?.trim() || "-";
  const canExpand = value.length > (important ? 280 : 220);

  return (
    <div className={`${styles.textPanel} ${important ? styles.textPanelImportant : ""}`}>
      <div className={styles.panelHeader}>
        <span>{label}</span>
        {canExpand && <button type="button" className={styles.toggleButton} onClick={() => setExpanded((prev) => !prev)}>{expanded ? t("showLess") : t("showMore")}</button>}
      </div>
      <div className={`${styles.panelBody} ${expanded ? styles.expanded : ""}`}>
        <p>{value}</p>
      </div>
    </div>
  );
};

const TextListPanel: React.FC<{ label: string; values?: string[] | null; compact?: boolean }> = ({ label, values, compact = false }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const list = values?.filter(Boolean) ?? [];
  const canExpand = list.length > (compact ? 4 : 6);

  return (
    <div className={styles.textPanel}>
      <div className={styles.panelHeader}>
        <span>{label}</span>
        {canExpand && <button type="button" className={styles.toggleButton} onClick={() => setExpanded((prev) => !prev)}>{expanded ? t("showLess") : t("showEverything")}</button>}
      </div>
      <div className={`${styles.panelBody} ${expanded ? styles.expanded : ""}`}>
        {list.length ? <ul>{list.map((value, index) => <li key={`${value}-${index}`}>{value}</li>)}</ul> : <p>-</p>}
      </div>
    </div>
  );
};

export default ServiceProfile;
