import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./CarProfile.module.css";
import { useTabStore } from "../../store/tabStore";
import { useToastStore } from "../../store/toastStore";
import type { Car } from "../../shared/types/car";
import type { CustomerViewDto } from "../../shared/dtos/customerDtos";
import type { BodyTypeOption, FuelTypeOption } from "../../shared/ipcApi";
import type { Service } from "../../shared/types/service";

const formatKm = (value: number | null | undefined) =>
  value === null || value === undefined
    ? "-"
    : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);

const getCustomerPhone = (customer: CustomerViewDto) => {
  const phone = customer.phones?.[0];
  return phone ? `${phone.countryCode} ${phone.number}` : null;
};

const getCustomerEmail = (customer: CustomerViewDto) => customer.emails?.[0]?.address ?? null;

const CarProfile: React.FC<{ carId: number }> = ({ carId }) => {
  const { t } = useTranslation();
  const { openTab, activeTabId, renameTab } = useTabStore();
  const { addToast } = useToastStore();

  const [car, setCar] = useState<Car | null>(null);
  const [brand, setBrand] = useState("-");
  const [customer, setCustomer] = useState<CustomerViewDto | null>(null);
  const [customers, setCustomers] = useState<CustomerViewDto[]>([]);
  const [fuelType, setFuelType] = useState("-");
  const [bodyType, setBodyType] = useState("-");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [carRes, brandRes, customerRes, fuelRes, bodyRes, serviceRes] = await Promise.all([
          window.electron.ipcRenderer.invoke("get-car", carId),
          window.electron.ipcRenderer.invoke("get-all-brands"),
          window.electron.ipcRenderer.invoke("get-all-customers"),
          window.electron.ipcRenderer.invoke("get-all-fuel-types"),
          window.electron.ipcRenderer.invoke("get-all-body-types"),
          window.electron.ipcRenderer.invoke("get-services-by-car", carId),
        ]);

        if (!carRes.success || !carRes.data) {
          addToast(carRes.message, "error");
          setLoading(false);
          return;
        }

        const data = carRes.data;
        const customerList = customerRes ?? [];
        setCar(data);
        setCustomers(customerList);

        if (brandRes.success) {
          setBrand(brandRes.data?.find((b) => b.brandId === data.brandId)?.brandName ?? "-");
        }

        setCustomer(customerList.find((item: CustomerViewDto) => item.id === data.customerId) ?? null);

        if (fuelRes.success) {
          setFuelType(
            fuelRes.data?.find((item: FuelTypeOption) => item.fuelTypeId === data.fuelType)?.fuelTypeName ?? "-",
          );
        }

        if (bodyRes.success) {
          setBodyType(
            bodyRes.data?.find((item: BodyTypeOption) => item.bodyTypeId === data.bodyType)?.bodyTypeName ?? "-",
          );
        }

        if (serviceRes.success) setServices(serviceRes.data ?? []);

        if (data.plateNumber) {
          renameTab(activeTabId, data.plateNumber);
        }
      } catch (error) {
        console.error("Araç profili yüklenemedi:", error);
        addToast(t("carUnexpectedError"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [activeTabId, addToast, carId, renameTab, t]);

  const oldUsers = useMemo(() => {
    if (!car?.oldCustomerId) return [];

    const oldIds = new Set(
      car.oldCustomerId
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    );

    return customers.filter((item) => oldIds.has(item.id) && item.id !== car.customerId);
  }, [car, customers]);

  const openCustomerProfile = (selectedCustomer: CustomerViewDto) => {
    openTab({
      type: "customer",
      title: `${selectedCustomer.fullName} Profili`,
      entityId: selectedCustomer.id,
      isProfile: true,
    });
  };

  if (loading) return <div className={styles.loading}>{t("carLoading")}</div>;
  if (!car) return <div className={styles.loading}>{t("carNotFound")}</div>;

  const vehicleName = `${brand} ${car.model ?? ""}`.trim() || t("carProfileTitle");
  const currentPhone = customer ? getCustomerPhone(customer) : null;
  const currentEmail = customer ? getCustomerEmail(customer) : null;

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.vehicleHeader}>
          <div className={styles.vehicleTitle}>{car.plateNumber || t("carProfileTitle")}</div>
          <div className={styles.vehicleSubtitle}>{vehicleName}</div>
        </div>

        <div className={styles.vehicleInfoGrid}>
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>{t("carBrand")}</div>
            <div className={styles.infoValue}>{brand}</div>
          </div>
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>{t("carModel")}</div>
            <div className={styles.infoValue}>{car.model || "-"}</div>
          </div>
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>{t("carYear")}</div>
            <div className={styles.infoValue}>{car.year || "-"}</div>
          </div>
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>{t("carKm")}</div>
            <div className={styles.infoValue}>{formatKm(car.km)}</div>
          </div>
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>{t("carFuelType")}</div>
            <div className={styles.infoValue}>{fuelType}</div>
          </div>
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>{t("carBodyType")}</div>
            <div className={styles.infoValue}>{bodyType}</div>
          </div>
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>{t("carEngineVolume")}</div>
            <div className={styles.infoValue}>{car.engineVolumeCc ? `${car.engineVolumeCc} cc` : "-"}</div>
          </div>
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>{t("carVin")}</div>
            <div className={styles.infoValue}>{car.vinNumber || "-"}</div>
          </div>
        </div>

        {car.notes && (
          <div className={styles.notes}>
            <div className={styles.infoLabel}>{t("carNotes")}</div>
            <div className={styles.notesValue}>{car.notes}</div>
          </div>
        )}

        <div className={styles.currentUserSection}>
          <div className={styles.currentUserTitle}>{t("carCurrentUser")}</div>
          {customer ? (
            <button className={styles.currentUserCard} onClick={() => openCustomerProfile(customer)} type="button">
              <div className={styles.avatar}>{customer.fullName.charAt(0).toLocaleUpperCase("tr-TR")}</div>
              <div className={styles.userMain}>
                <div className={styles.userName}>{customer.fullName}</div>
                <div className={styles.userContacts}>
                  {currentPhone && <span>{currentPhone}</span>}
                  {currentEmail && <span>{currentEmail}</span>}
                  {!currentPhone && !currentEmail && <span>{t("carNoContactInfo")}</span>}
                </div>
              </div>
              <svg className={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ) : (
            <div className={styles.emptyState}>{t("carNoCurrentUser")}</div>
          )}
        </div>

        <button
          className={styles.editButton}
          onClick={() => openTab({ type: "car", title: t("carEditTitle"), entityId: carId })}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          {t("carEdit")}
        </button>
      </aside>

      <main className={styles.mainContent}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>{t("carOldUsers")}</div>
              <div className={styles.cardHint}>{t("carOldUsersProfileHint")}</div>
            </div>
            <span className={styles.countBadge}>{oldUsers.length}</span>
          </div>

          {oldUsers.length > 0 ? (
            <div className={styles.usersScroll}>
              <div className={styles.usersGrid}>
                {oldUsers.map((oldUser) => {
                  const phone = getCustomerPhone(oldUser);
                  const email = getCustomerEmail(oldUser);

                  return (
                    <button
                      key={oldUser.id}
                      className={styles.userCard}
                      onClick={() => openCustomerProfile(oldUser)}
                      type="button"
                    >
                      <div className={styles.avatar}>{oldUser.fullName.charAt(0).toLocaleUpperCase("tr-TR")}</div>
                      <div className={styles.userMain}>
                        <div className={styles.userName}>{oldUser.fullName}</div>
                        <div className={styles.userContacts}>
                          {phone && <span>{phone}</span>}
                          {email && <span>{email}</span>}
                          {!phone && !email && <span>{t("carNoContactInfo")}</span>}
                        </div>
                      </div>
                      <svg className={styles.chevron} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>{t("carNoOldUsersProfile")}</div>
          )}
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>{t("carServiceHistory")}</div>
            <button className={styles.historyAddButton} type="button" onClick={() => openTab({ type: "service", title: t("serviceNewTitle"), entityId: 999, parentEntityId: carId })}>+ {t("serviceNewButton")}</button>
          </div>
          {services.length > 0 ? (
            <div className={styles.serviceList}>
              {[...services].sort((a, b) => (b.applicationDate ? new Date(b.applicationDate).getTime() : 0) - (a.applicationDate ? new Date(a.applicationDate).getTime() : 0)).map((service) => (
                <button
                  key={service.serviceId}
                  className={styles.serviceItem}
                  type="button"
                  onClick={() => service.serviceId && openTab({ type: "service", title: `#${service.serviceId}`, entityId: service.serviceId, isProfile: true })}
                >
                  <div className={styles.serviceDate}>{service.applicationDate ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "short" }).format(new Date(service.applicationDate)) : "-"}</div>
                  <div className={styles.serviceMain}>
                    <strong>{service.complaints}</strong>
                    <span>{service.km == null ? "-" : `${formatKm(service.km)} km`}{service.totalCharge != null ? ` · ${new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(service.totalCharge)}` : ""}</span>
                  </div>
                  <span className={styles.serviceChevron}>›</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <span>{t("carNoServiceHistory")}</span>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CarProfile;
