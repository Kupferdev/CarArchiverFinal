import React, { useState } from "react";
import { LanguageStep } from "./steps/LanguageStep";
import { EulaStep } from "./steps/EulaStep";
import { FinishStep } from "./steps/FinishStep";
import { DataDirStep } from './steps/DataDirStep';

export const SetupWizard = () => {
  const [step, setStep] = useState(1);
  const [configData, setConfigData] = useState({
    language: "en",
    eulaAccepted: false,
    savePath: "",
    theme: "light",
  });

  // Verileri üst üste ekleyerek günceller
  const updateData = (newData: any) => {
    setConfigData((prev) => {
      const updated = { ...prev, ...newData };
      console.log("Güncel Ayar Verisi:", updated); // <-- Bunu ekle
      return updated;
    });
  };

  const nextStep = () => setStep(step + 1);

  const finishSetup = async () => {
    // configData: { language: 'tr', eulaAccepted: true, savePath: '...', isNewSetup: true }
    const success = await (window as any).electron.ipcRenderer.invoke(
      "save-config",
      configData,
    );

    if (success) {
      // Uygulamayı tazele, App.tsx tekrar çalışacak ve config dosyasını bulacak
      window.location.reload();
    } else {
      alert("Ayarlar kaydedilirken bir hata oluştu!");
    }
  };

  return (
    <div className="wizard-main-container">
      {" "}
      {/* Arka plan burada tanımlı */}
      {step === 1 && (
        <LanguageStep onNext={() => setStep(2)} updateData={updateData} />
      )}
      {step === 2 && (
        <EulaStep
          language={configData.language}
          onNext={() => setStep(3)} // Eula bitince ADIM 3'e (Klasör Seçimi) gitmeli
          onBack={() => setStep(1)}
          updateData={updateData}
        />
      )}
      {step === 3 && (
        <DataDirStep
          language={configData.language}
          onNext={() => setStep(4)} // Klasör seçince ADIM 4'e (Bitiş) gitmeli
          onBack={() => setStep(2)}
          updateData={updateData}
        />
      )}
      {step === 4 && (
        <FinishStep configData={configData} language={configData.language} />
      )}
    </div>
  );
};
