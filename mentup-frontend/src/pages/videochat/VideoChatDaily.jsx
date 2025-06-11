import React, { useState, useEffect } from "react";

const VideoChatDaily = () => {
  const [roomName, setRoomName] = useState("");
  const [showJitsi, setShowJitsi] = useState(false);
  const [canGenerate, setCanGenerate] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleStartMeeting = () => {
    if (roomName.trim() !== "") {
      setShowJitsi(true);
      setCountdown(30);
    } else {
      alert("Lütfen bir oda ismi girin.");
    }
  };

  // 30 saniyelik sayaç
  useEffect(() => {
    let timer;
    if (showJitsi && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    if (countdown === 0) {
      setCanGenerate(true);
    }

    return () => clearInterval(timer);
  }, [showJitsi, countdown]);

  const handleCreateCertificate = async () => {
    if (!user) {
      alert("Kullanıcı bilgisi bulunamadı.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/certificates/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("✅ Sertifika başarıyla oluşturuldu!");
        window.open(`${process.env.REACT_APP_BACKEND_URL}${data.file}`, "_blank");
      } else {
        alert("❌ Sertifika oluşturulamadı: " + data.message);
      }
    } catch (error) {
      console.error("Hata:", error);
      alert("❌ Sunucuya bağlanılamadı.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      {!showJitsi ? (
        <>
          <h2>Görüntülü Görüşme Başlat</h2>
          <input
            type="text"
            placeholder="Oda ismi girin"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            style={{ padding: "10px", fontSize: "16px", width: "250px" }}
          />
          <br />
          <button
            onClick={handleStartMeeting}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            Görüşmeyi Başlat
          </button>
        </>
      ) : (
        <>
          <iframe
            src={`https://meet.jit.si/${roomName}`}
            allow="camera; microphone; fullscreen; display-capture"
            style={{
              width: "100%",
              height: "75vh",
              border: "0px",
              marginTop: "20px",
            }}
            title="Jitsi Meet"
          />

          {!canGenerate && (
            <p style={{ marginTop: "10px", color: "#666" }}>
              Sertifika için kalan süre: <strong>{countdown} saniye</strong>
            </p>
          )}

          <button
            onClick={handleCreateCertificate}
            disabled={!canGenerate}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "18px",
              backgroundColor: canGenerate ? "#28a745" : "#888",
              color: "white",
              cursor: canGenerate ? "pointer" : "not-allowed",
              opacity: canGenerate ? 1 : 0.6,
            }}
          >
            Sertifikayı Oluştur
          </button>
        </>
      )}
    </div>
  );
};

export default VideoChatDaily;
