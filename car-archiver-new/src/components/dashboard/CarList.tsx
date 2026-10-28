import { BulkSelectionActions } from "../common/BulkSelectionActions";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./CarList.module.css";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import type { Car } from "../../shared/types/car";
import type { Brand } from "../../shared/types/brand";
import type { CustomerViewDto } from "../../shared/dtos/customerDtos";
import { useTabStore } from "../../store/tabStore";
import { useToastStore } from "../../store/toastStore";

const CarList: React.FC<{ customerId?: number; contextLabel?: string }> = ({ customerId, contextLabel }) => {
  const { t } = useTranslation();
  const { openTab } = useTabStore();
  const { addToast } = useToastStore();

  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [customers, setCustomers] = useState<CustomerViewDto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Müşteri listesindeki çoklu seçim davranışı araç listesinde de aynı.
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteTargets, setDeleteTargets] = useState<number[]>([]);

  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [carsRes, brandsRes, customerRes] = await Promise.all([
        window.electron.ipcRenderer.invoke("get-all-cars"),
        window.electron.ipcRenderer.invoke("get-all-brands"),
        window.electron.ipcRenderer.invoke("get-all-customers"),
      ]);

      if (carsRes.success) setCars(carsRes.data ?? []);
      else addToast(t("carUnexpectedError"), "error");

      if (brandsRes.success) setBrands(brandsRes.data ?? []);
      if (customerRes) setCustomers(customerRes);

      setSelectedIds([]);
    } catch {
      addToast(t("carUnexpectedError"), "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const brandMap = useMemo(
    () => new Map(brands.map((b) => [b.brandId, b.brandName])),
    [brands]
  );

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c.fullName])),
    [customers]
  );

  const filtered = useMemo(() => {
    const term = search.toLocaleLowerCase("tr-TR");

    return cars.filter((car) => {
      if (customerId && car.customerId !== customerId) return false;
      if (!term) return true;

      const text = [
        car.plateNumber ?? "",
        car.vinNumber ?? "",
        car.model ?? "",
        car.year?.toString() ?? "",
        car.brandId ? brandMap.get(car.brandId) ?? "" : "",
        car.customerId ? customerMap.get(car.customerId) ?? "" : "",
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      return text.includes(term);
    });
  }, [cars, search, brandMap, customerMap, customerId]);

  const getCarTitle = (car: Car) => car.plateNumber || t("carProfileTitle");

  const handleViewCar = (car: Car) => {
    if (!car.carId) return;
    openTab({
      type: "car",
      title: getCarTitle(car),
      entityId: car.carId,
      isProfile: true,
    });
  };

  const handleEditCar = (car: Car) => {
    if (!car.carId) return;
    openTab({
      type: "car",
      title: t("carEditTitle"),
      entityId: car.carId,
    });
  };

  const handleAddCar = () => {
    openTab({
      type: "car",
      title: t("carNewTitle"),
      parentEntityId: customerId,
      entityId: 999,
    });
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode((current) => !current);
    setSelectedIds([]);
  };

  const toggleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(
        filtered
          .map((car) => car.carId)
          .filter((id): id is number => typeof id === "number")
      );
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  };

  const deleteCar = (car: Car) => {
    if (!car.carId) return;
    setDeleteTargets([car.carId]);

  };
  const deleteSelectedCars = () => {
    if (!selectedIds.length) return;
    setDeleteTargets([...selectedIds]);

  };
  const confirmCarDelete = async () => {
    if (!deleteTargets.length || deleting) return;
    setDeleting(true);
    try {
      const result = deleteTargets.length === 1
        ? await window.electron.ipcRenderer.invoke('delete-car', { id: deleteTargets[0], deleteRelated: true })
        : await window.electron.ipcRenderer.invoke('delete-cars-bulk', { ids: deleteTargets, deleteRelated: true });
      if (result.success) {
        addToast(t("carDeletedCount", { count: deleteTargets.length }), 'success');
        setDeleteTargets([]); setSelectedIds([]); setIsSelectionMode(false);
        await load();
      } else addToast(t("carUnexpectedError"), "error");
    } catch { addToast(t('carUnexpectedError'), 'error'); }
    finally { setDeleting(false); }
  };

  const allFilteredSelected =
    filtered.length > 0 &&
    filtered.every(
      (car) => typeof car.carId === "number" && selectedIds.includes(car.carId)
    );

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.title}>{contextLabel ? `${contextLabel} ${t("carListTitle")}` : t("carListTitle")}</div>

        <div className={styles.toolbarRight}>
          <BulkSelectionActions active={isSelectionMode} selectedCount={selectedIds.length}
            onToggle={toggleSelectionMode} onDelete={() => void deleteSelectedCars()} entityLabel={t("carLabel")} />

          <input
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("carSearchPlaceholder")}
          />

          <button className={styles.addNewBtn} onClick={handleAddCar} type="button">
            + {t("carNewButton")}
          </button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {isSelectionMode && (
                <th className={styles.checkboxHeader}>
                  <input
                    type="checkbox"
                    className={styles.rowCheckbox}
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              <th>{t("carPlate")}</th>
              <th>{t("carCustomer")}</th>
              <th>{t("carBrand")}</th>
              <th>{t("carModel")}</th>
              <th>{t("carYear")}</th>
              <th className={styles.actionsHeader}>{t("carActions")}</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={isSelectionMode ? 8 : 7}
                  className={styles.emptyState}
                >
                  {t("carLoading")}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={isSelectionMode ? 8 : 7}
                  className={styles.emptyState}
                >
                  {t("carNoRecords")}
                </td>
              </tr>
            ) : (
              filtered.map((car) => (
                <tr
                  key={car.carId}
                  className={`${styles.tableRow} ${
                    typeof car.carId === "number" && selectedIds.includes(car.carId)
                      ? styles.selectedRow
                      : ""
                  }`}
                  onDoubleClick={() => handleViewCar(car)}
                >
                  {isSelectionMode && (
                    <td
                      className={styles.checkboxCell}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {typeof car.carId === "number" && (
                        <input
                          type="checkbox"
                          className={styles.rowCheckbox}
                          checked={selectedIds.includes(car.carId)}
                          onChange={() => toggleSelectOne(car.carId as number)}
                        />
                      )}
                    </td>
                  )}

                  <td>{car.plateNumber || "-"}</td>
                  <td>{car.customerId ? customerMap.get(car.customerId) ?? "-" : "-"}</td>
                  <td>{brandMap.get(car.brandId ?? 0) ?? "-"}</td>
                  <td>{car.model || "-"}</td>
                  <td>{car.year || "-"}</td>
                  <td className={styles.actionsCell} onClick={(event) => event.stopPropagation()}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleViewCar(car)}
                      title={t("carView")}
                      type="button"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    </button>

                    <button
                      className={styles.actionBtn}
                      onClick={() => handleEditCar(car)}
                      title={t("carEdit")}
                      type="button"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>

                    <button
                      className={`${styles.actionBtn} ${styles.deleteIconBtn}`}
                      onClick={() => void deleteCar(car)}
                      title={t("carDelete")}
                      type="button"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {deleteTargets.length > 0 && <DeleteConfirmDialog
        title={deleteTargets.length === 1 ? t("carDeleteTitle") : t("carDeleteSelectedTitle")}

        onCancel={() => { if (!deleting) setDeleteTargets([]); }}
        onConfirm={() => void confirmCarDelete()}
        busy={deleting}
      >{t('carDeleteRelated')} — {deleteTargets.length === 1 ? t('carDeleteConfirmation', { plate: cars.find(car => car.carId === deleteTargets[0])?.plateNumber ?? t('carLabel') }) : t("carDeleteSelectedPrompt", { count: deleteTargets.length })}</DeleteConfirmDialog>}
    </div>
  );
};

export default CarList;
