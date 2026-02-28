import React, { useState, useRef } from "react";
import { eulas } from "../../i18n/eulas";

export const EulaStep = ({ language, onNext, onBack, updateData }: any) => {
  const [isRead, setIsRead] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const langData = eulas.find((e) => e.languageCode === language) || eulas[0];

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollHeight - scrollTop <= clientHeight + 10) {
        setIsRead(true);
      }
    }
  };

  const handleAccept = () => {
    updateData({ eulaAccepted: true });
    onNext();
  };

  return (
      <div className="setup-card">
        {" "}
        {/* İçerik bu kutunun içinde değişecek */}
        <h2>{langData.title}</h2>
        <div
          className="scroll-area"
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            height: "400px",
            overflowY: "auto",
            border: "1px solid #ddd",
            padding: "15px",
            backgroundColor: "#fff",
            borderRadius: "8px",
          }}
          dangerouslySetInnerHTML={{ __html: langData.eula }}
        />
        <div
          className="footer-action"
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "15px",
          }}
        >
          {/* KABUL ETMİYORUM BUTONU: Her zaman aktif olabilir veya isRead'e bağlanabilir */}
          <button
            className="decline-btn"
            onClick={onBack}
            style={{
              padding: "10px 20px",
              backgroundColor: "#f1f1f1",
              border: "1px solid #ccc",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {langData.declineText}
          </button>

          {/* KABUL EDİYORUM BUTONU: Sadece okuyunca aktif olur */}
          <button
            disabled={!isRead}
            className="accept-btn"
            onClick={handleAccept}
            style={{
              padding: "10px 20px",
              backgroundColor: isRead ? "#007AFF" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: isRead ? "pointer" : "not-allowed",
              transition: "background 0.3s ease",
            }}
          >
            {langData.acceptText}
          </button>
        </div>
      </div>
  );
};
