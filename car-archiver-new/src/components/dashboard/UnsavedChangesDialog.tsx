import { useTranslation } from 'react-i18next';
import styles from './UnsavedChangesDialog.module.css';

interface Props {
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function UnsavedChangesDialog({ count, onCancel, onConfirm }: Props) {
  const { t } = useTranslation();
  return (
    <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="unsaved-title" aria-describedby="unsaved-description">
        <h3 id="unsaved-title">{t("unsavedTitle")}</h3>
        <p id="unsaved-description">{t("unsavedDescription", { count })}</p>
        <div className={styles.actions}>
          <button type="button" onClick={onCancel}>{t("unsavedCancel")}</button>
          <button type="button" className={styles.danger} onClick={onConfirm}>{t("unsavedDiscard")}</button>
        </div>
      </section>
    </div>
  );
}
