import React, { useState } from "react";
import { LanguageStep } from "./steps/LanguageStep";
import { EulaStep } from "./steps/EulaStep";
import { DataDirStep } from './steps/DataDirStep';
import { FinishStep } from "./steps/FinishStep";

export const SetupWizard = () => {
  const [step, setStep] = useState(1);
  const [configData, setConfigData] = useState({
    language: "en",
    eulaAccepted: false,
    savePath: "",
    theme: "light",
  });

  const updateData = (newData: any) => {
    setConfigData((prev) => {
      const updated = { ...prev, ...newData };
      console.log("Güncel Ayar Verisi:", updated);
      return updated;
    });
  };

  const finishSetup = async () => {
    try {
      const dbPathResult = await (window as any).electron.ipcRenderer.invoke(
        "setup-new-data-structure",
        configData.savePath
      );

      if (!dbPathResult) {
        alert("Veritabanı oluşturulurken bir hata meydana geldi!");
        return; 
      }

      const finalConfig = { ...configData, savePath: dbPathResult };

      const success = await (window as any).electron.ipcRenderer.invoke(
        "save-config",
        finalConfig 
      );

      if (success) {
        window.location.reload();
      } else {
        alert("Ayarlar kaydedilirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Kurulum sırasında beklenmeyen hata:", error);
      alert("Kurulum tamamlanamadı.");
    }
  };

  return (
    <div className="wizard-main-container">
      
      {step === 1 && (
        <LanguageStep onNext={() => setStep(2)} updateData={updateData} />
      )}
      
      {step === 2 && (
        <EulaStep
          language={configData.language}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
          updateData={updateData}
        />
      )}
      
      {step === 3 && (
        <DataDirStep
          language={configData.language}
          onNext={() => setStep(4)} 
          onBack={() => setStep(2)}
          updateData={updateData}
        />
      )}
      
      {step === 4 && (
        <FinishStep 
          configData={configData} 
          language={configData.language} 
          onComplete={finishSetup} 
          onBack={() => setStep(3)} 
        />
      )}
      
    </div>
  );
};