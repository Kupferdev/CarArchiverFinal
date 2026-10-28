import { useTranslation } from 'react-i18next';
import type { ReactNode } from "react";
import styles from "./DeleteConfirmDialog.module.css";

interface Props {
  title: string;
  children: ReactNode;
  option?: string;
  checked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
}
export function DeleteConfirmDialog({ title, children, option, checked, onCheckedChange, onCancel, onConfirm, busy = false }: Props) {
  const { t } = useTranslation();
  return <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
    <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
      <h3 className={styles.title} id="delete-dialog-title">{title}</h3>
      <p className={styles.description} id="delete-dialog-description">{children}</p>
      {option && <label className={styles.option}><input type="checkbox" checked={!!checked} onChange={(event) => onCheckedChange?.(event.target.checked)} disabled={busy}/><span>{option}</span></label>}
      <div className={styles.actions}><button type="button" className={styles.cancel} onClick={onCancel} disabled={busy}>{t("dialogCancel")}</button><button type="button" className={styles.confirm} onClick={onConfirm} disabled={busy}>{busy ? t("customerLoading") : t("customerDelete")}</button></div>
    </section>
  </div>;
}
