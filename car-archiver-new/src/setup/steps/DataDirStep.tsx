import React, { useState } from "react";
import { SetupInfoTexts } from "../../i18n/setupWizard";
import styles from "../../styles/setup/DataDitStep.module.css";

export const DataDirStep = ({ language, onNext, onBack, updateData }: any) => {
  const [subStep, setSubStep] = useState(1);
  const [setupMode, setSetupMode] = useState<"import" | "create" | null>(null);
  const [path, setPath] = useState("");
  const [error, setError] = useState("");

  const t =
    SetupInfoTexts.find((x) => x.languageCode === language) ||
    SetupInfoTexts[0];

  const getAsset = (name: string) =>
    new URL(`../../assets/cats/${name}`, import.meta.url).href;

  const getIcon = (name: string) =>
    new URL(`../../assets/icons/${name}`, import.meta.url).href;

  const handleBrowse = async () => {
    const selected = await (window as any).electron.ipcRenderer.invoke(
      "select-directory",
    );
    if (!selected) return;

    if (setupMode === "import") {
      const dbFile = await (window as any).electron.ipcRenderer.invoke(
        "verify-import-path",
        selected,
      );
      if (dbFile) {
        setPath(dbFile);
        setError("");
      } else {
        setError(
          language === "tr"
            ? "Hata: data_carArcihiver.sqlite bulunamadı!"
            : "Error: .sqlite file not found!",
        );
        setPath("");
      }
    } else {
      setPath(selected);
      setError("");
    }
  };

  const handleFinalStart = async () => {
    let finalDbPath = path;

    if (setupMode === "create") {
      finalDbPath = await (window as any).electron.ipcRenderer.invoke(
        "setup-new-data-structure",
        path,
      );
    }

    if (finalDbPath) {
      updateData({
        savePath: finalDbPath,
        isNewUser: setupMode === "create",
      });
      onNext();
    }
  };

  return (
    <div className={styles["setup-container"]}>
      {subStep === 1 && (
        <>
          <img
            src={getAsset("catDb.png")}
            className={styles["setup-cat-img"]}
            alt="Data Cat"
          />

          <h2 className={styles["setup-header"]}>{t.infoHeader}</h2>

          <div className={styles["scroll-area"]}>
            <p className={styles["setup-main-text"]}>{t.mainText}</p>
          </div>

          <div className={styles["footer-action"]}>
            <button
              className={`${styles["nav-arrow"]} ${styles["prev"]}`}
              onClick={onBack}
            >
              <img src={getIcon("left-arrow-grey.svg")} alt="back" />
            </button>
            <button
              className={`${styles["nav-arrow"]} ${styles["next"]}`}
              onClick={() => setSubStep(2)}
            >
              <img src={getIcon("right_arrow-blue.svg")} alt="next" />
            </button>
          </div>
        </>
      )}

      {subStep === 2 && (
        <>
          <img
            src={getAsset("catLift.png")}
            className={styles["setup-cat-img"]}
            alt="Forklift Cat"
          />

          <p className={styles["setup-option-text"]}>{t.optionText}</p>

          <div className={styles["opt-container"]}>
            <button
              className={`${styles["data-opt-btn"]} ${styles["white"]}`}
              onClick={() => {
                setSetupMode("import");
                setSubStep(3);
              }}
            >
              <img
                src={getIcon("arrow_downward.svg")}
                className={styles["btn-icon"]}
                alt="import"
              />
              {t.importButton}
            </button>

            <button
              className={`${styles["data-opt-btn"]} ${styles["blue"]}`}
              onClick={() => {
                setSetupMode("create");
                setSubStep(4);
              }}
            >
              <img
                src={getIcon("add_2.svg")}
                className={styles["btn-icon"]}
                alt="new"
              />
              {t.createNewButton}
            </button>
          </div>

          <div className={styles["footer-action"]}>
            <button
              className={`${styles["nav-arrow"]} ${styles["prev"]}`}
              onClick={() => setSubStep(1)}
            >
              <img src={getIcon("left-arrow-grey.svg")} alt="back" />
            </button>
            <div></div>
          </div>
        </>
      )}

      {(subStep === 3 || subStep === 4) && (
        <>
          <img
            src={getAsset("catLift.png")}
            className={styles["setup-cat-img"]}
            alt="Forklift Cat"
          />

          <h3 className={styles["setup-sub-header"]}>
            {subStep === 3 ? t.importText : t.createNewText}
          </h3>

          <div className={styles["path-selection-row"]}>
            <input
              type="text"
              readOnly
              value={path}
              className={styles["path-input"]}
              placeholder="C:\Users\Documents\..."
            />

            <button className={styles["browse-btn"]} onClick={handleBrowse}>
              {t.browseButton}
            </button>
          </div>

          {error && <p className={styles["error-text"]}>{error}</p>}

          <div className={styles["footer-action"]}>
            <button
              className={`${styles["nav-arrow"]} ${styles["prev"]}`}
              onClick={() => {
                setSubStep(2);
                setPath("");
                setError("");
              }}
            >
              <img src={getIcon("left-arrow-grey.svg")} alt="back" />
            </button>

            <button
              className={styles["start-btn"]}
              disabled={!path}
              onClick={handleFinalStart}
            >
              {t.continueText}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
