import { useTranslation } from 'react-i18next';
import styles from './ProfileActions.module.css';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
  deleteLabel: string;
  compact?: boolean;
}

export function ProfileActions({ onEdit, onDelete, deleteLabel, compact = false }: Props) {
  const { t } = useTranslation();
  return <div className={`${styles.actions} ${compact ? styles.compact : ''}`}>
    <button type="button" className={styles.edit} onClick={onEdit}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="m16 5 3 3M4 20l4-.8L20 7a2.12 2.12 0 0 0-3-3L4.8 16.2 4 20Z"/></svg>
      {t("profileEditInfo")}
    </button>
    <button type="button" className={styles.delete} onClick={onDelete}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/></svg>
      {deleteLabel}
    </button>
  </div>;
}
