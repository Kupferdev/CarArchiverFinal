import React, { useState } from 'react';
import styles from '../../styles/setup/DataDitStep.module.css'; 
import { SetupInfoTexts } from "../../i18n/setupWizard";

interface FinishStepProps {
    configData: any;
    language: string;
    onComplete: () => Promise<void> | void; 
    onBack: () => void;
}

export const FinishStep: React.FC<FinishStepProps> = ({ configData, language, onComplete, onBack }) => {
    
    const getAsset = (name: string) =>
        new URL(`../../assets/cats/${name}`, import.meta.url).href;

    const getIcon = (name: string) =>
        new URL(`../../assets/icons/${name}`, import.meta.url).href;

    const t = SetupInfoTexts.find((x) => x.languageCode === language) || SetupInfoTexts[0];

    const [isLoading, setIsLoading] = useState(false);

    const handleStart = async () => {
        setIsLoading(true); 
        await onComplete(); 
    };
    
    return (
        <div className={styles["setup-container"]}>
            
            {/* Kutlama Kedisi (260x260px) */}
            <img 
                src={getAsset("catConfeti.png")} 
                alt="Usta Kedi" 
                className={styles["setup-cat-img"]} 
            />
            
            {/* Başlık: Görseldeki gibi tam ortada */}
            <h2 
                className={styles["setup-header"]} 
                style={{ textAlign: 'center', marginBottom: '15px' }}
            >
                {t.youAreReady} 
            </h2>
            
            {/* Açıklamalar ve Dizin Yolu */}
            <div className={styles["scroll-area"]} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                <p 
                    className={styles["setup-option-text"]} 
                    style={{ marginBottom: '10px' }}
                >
                    {t.lastInfoText} 
                </p>
                
                {/* Kayıt Yolu (Path): Görseldeki gibi daha küçük, ince ve gri renkli */}
                <p 
                    className={styles["setup-main-text"]} 
                    style={{ 
                        textAlign: 'center', 
                        fontSize: '12px', 
                        color: '#999', 
                        wordBreak: 'break-all', 
                        maxWidth: '90%' 
                    }}
                >
                    {configData.savePath}
                </p>
            </div>

            {/* Alt Kontrol Alanı: Geri oku solda, Başla butonu sağda */}
            <div className={styles["footer-action"]}>
                
                <button 
                    onClick={onBack} 
                    className={`${styles["nav-arrow"]} ${styles["prev"]}`}
                    disabled={isLoading} 
                >
                    <img src={getIcon("left-arrow-grey.svg")} alt="back" />
                </button>

                <button 
                    onClick={handleStart} 
                    className={styles["start-btn"]}
                    disabled={isLoading} 
                >
                    {isLoading ? (language === "tr" ? "Kuruluyor..." : "Setting up...") : t.startButton}
                </button>
            </div>
            
        </div>
    );
};