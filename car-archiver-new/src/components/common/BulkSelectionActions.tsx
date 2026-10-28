import { useTranslation } from 'react-i18next';
import styles from "./BulkSelectionActions.module.css";

interface Props {
  active: boolean;
  selectedCount: number;
  onToggle: () => void;
  onDelete: () => void;
  deleting?: boolean;
  entityLabel: string;
}

/** Selection controls only; every list owns its original search box and placeholder. */
export function BulkSelectionActions({ active, selectedCount, onToggle, onDelete, deleting = false, entityLabel }: Props) {
  const { t } = useTranslation();
  return <div className={styles.actions}>
    {active ? <>
      {selectedCount > 0 && <button type="button" className={`${styles.button} ${styles.deleteButton}`}
        disabled={deleting} onClick={onDelete} title={t("bulkDeleteSelected")}
        aria-label={`${t("bulkDeleteSelected")} · ${entityLabel}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        <span className={styles.count}>{selectedCount}</span>
      </button>}
      <button type="button" className={`${styles.button} ${styles.cancelButton}`}
        disabled={deleting} onClick={onToggle} title={t("bulkCloseSelection")} aria-label={t("bulkCloseSelection")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
        </svg>
      </button>
    </> : <button type="button" className={styles.button} onClick={onToggle}
      title={t("bulkEnableSelection")} aria-label={t("bulkEnableSelection")}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    </button>}
  </div>;
}
