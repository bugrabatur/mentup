import React, { useState, useEffect } from "react";
import axios from "axios";
import "./mentorAvailabilitySettings.css";
import Calendar from "../../components/Calendar/calendar";

const MentorAvailabilitySettings = () => {
  const [slots, setSlots] = useState([]);

  // Sayfa açılırken mevcut slotları çek
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5001/mentor/availability/getAvailability",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // DB'den gelen slotları Calendar'ın beklediği formata çevir
        setSlots(
          res.data.slots.map((slot) => ({
            start: new Date(`${slot.date}T${slot.start_time}`),
            end: new Date(`${slot.date}T${slot.end_time}`),
          }))
        );
      } catch (err) {
        console.error("Slotlar alınamadı:", err);
      }
    };
    fetchSlots();
  }, []);

  // Takvimden slotlar değiştikçe güncelle
  // Sadece bugünden sonraki slotları al
  // const handleSlotsChange = (updatedSlots) => {
  //   const now = new Date();

  //   const filtered = updatedSlots.filter(
  //     (slot) => slot.start > now && slot.end > now
  //   );
  //   setSlots(filtered);
  // };

  const handleSlotsChange = (updatedSlots) => {
    setSlots(updatedSlots);
  };

  // Kaydet butonuna basınca API'ye gönder
  const handleSave = async () => {
    // Slotları backend formatına çevir
    const formattedSlots = slots.map((slot) => ({
      date: slot.start.toISOString().slice(0, 10),
      start_time: slot.start.toTimeString().slice(0, 5),
      end_time: slot.end.toTimeString().slice(0, 5),
    }));

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/mentor/availability/save",
        { slots: formattedSlots },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Müsaitlikler kaydedildi!");
    } catch (err) {
      alert("Kayıt sırasında hata oluştu!");
      console.error(err);
    }
  };

  return (
    <div className="mentor-availability-settings-container">
      <div className="mentor-availability-settings-title-div">
        <h1 className="mentor-availability-settings-title">
          Uygunluk Ayarları
        </h1>
      </div>
      <Calendar slots={slots} onSlotsChange={handleSlotsChange} />
      <div className="mentor-availability-settings-button-div">
        <button
          className="mentor-availability-settings-button"
          onClick={handleSave}
        >
          Kaydet
        </button>
      </div>
    </div>
  );
};

export default MentorAvailabilitySettings;
