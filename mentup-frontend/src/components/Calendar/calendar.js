import React, { useState, useEffect } from "react";
import "./calendar.css";

const hours = Array.from({ length: 13 }, (_, i) => i + 8);
const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const Calendar = ({ slots = [], onSlotsChange }) => {
  const [selectedSlots, setSelectedSlots] = useState(slots);
  const [currentMonday, setCurrentMonday] = useState(getMondayOfWeek(new Date()));

  // Dışarıdan gelen slots değişirse local state'i güncelle
  useEffect(() => {
    setSelectedSlots(slots);
  }, [slots]);

  // Bugünün index'ini bul (0: Pazartesi, 6: Pazar)
  const today = new Date();
  const todayIdx = (() => {
    const monday = getMondayOfWeek(currentMonday);
    for (let i = 0; i < 7; i++) {
      const d = addDays(monday, i);
      if (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      ) {
        return i;
      }
    }
    return -1;
  })();

  // Haftalar arası geçiş
  const handlePrevWeek = () => setCurrentMonday(addDays(currentMonday, -7));
  const handleNextWeek = () => setCurrentMonday(addDays(currentMonday, 7));
  const handleToday = () => setCurrentMonday(getMondayOfWeek(new Date()));

  // Slot seçme
  const handleCellClick = (dayIdx, hour) => {
    const date = addDays(currentMonday, dayIdx);
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1);

    const exists = selectedSlots.some(
      (slot) =>
        slot.start.getTime() === start.getTime() &&
        slot.end.getTime() === end.getTime()
    );

    let updated;
    if (exists) {
      updated = selectedSlots.filter(
        (slot) =>
          !(
            slot.start.getTime() === start.getTime() &&
            slot.end.getTime() === end.getTime()
          )
      );
    } else {
      updated = [...selectedSlots, { start, end }];
    }
    setSelectedSlots(updated);
    if (onSlotsChange) onSlotsChange(updated);
  };

  const isSelected = (dayIdx, hour) => {
    const date = addDays(currentMonday, dayIdx);
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1);
    return selectedSlots.some(
      (slot) =>
        slot.start.getTime() === start.getTime() &&
        slot.end.getTime() === end.getTime()
    );
  };

  return (
    <div className="simple-calendar">
      <div className="calendar-controls">
        <button onClick={handlePrevWeek}>Önceki Hafta</button>
        <button onClick={handleToday}>Bugüne Dön</button>
        <button onClick={handleNextWeek}>Sonraki Hafta</button>
        <p className="calendar-info">
          Görüşmeler 60 dakika sürmektedir.
        </p>
      </div>
      <table>
        <thead>
          <tr>
            <th>
              {
                // Görüntülenen haftanın ayı
                currentMonday.toLocaleDateString("tr-TR", { month: "long" }).charAt(0).toUpperCase() +
                currentMonday.toLocaleDateString("tr-TR", { month: "long" }).slice(1)
              }
            </th>
            {days.map((d, i) => (
              <th
                key={i}
                className={i === todayIdx ? "today-column" : ""}
              >
                {d}
                <br />
                {addDays(currentMonday, i).toLocaleDateString("tr-TR")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <td className="simple-calendar-hours">{hour}:00</td>
              {days.map((_, dayIdx) => {
                const selected = isSelected(dayIdx, hour);
                // Şu anki saat ve gün ise
                const isNow =
                  dayIdx === todayIdx &&
                  hour === today.getHours();

                let content = null;
                if (selected) {
                  content = (
                    <div className="cell-content">
                      <div style={{ fontSize: 13 }}>{`${hour}:00 - ${hour + 1}:00`}</div>
                      <div style={{ fontSize: 10, marginTop: 2 }}>Uygun</div>
                    </div>
                  );
                }
                return (
                  <td
                    key={dayIdx}
                    className={[
                      selected ? "selected" : "",
                      dayIdx === todayIdx ? "today-column" : "",
                      isNow ? "now-cell" : ""
                    ].join(" ")}
                    onClick={() => handleCellClick(dayIdx, hour)}
                    style={{ cursor: "pointer", position: "relative", padding: 0 }}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="simple-calendar-selected-slots">
        <b>Seçili Slotlar:</b>
        <ul>
          {[...selectedSlots]
            .sort((a, b) => a.start - b.start)
            .map((slot, i) => {
              const start = slot.start;
              const end = slot.end;
              const dateStr = start.toLocaleDateString("tr-TR");
              const dayName = start.toLocaleDateString("tr-TR", { weekday: "long" });
              const startTime = start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
              const endTime = end.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
              return (
                <li key={i}>
                  {`${dateStr} ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${startTime}-${endTime}`}
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default Calendar;