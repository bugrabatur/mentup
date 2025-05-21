import React, { useEffect, useState } from "react";
import axios from "axios";
import "./appointmentRequests.css";

const AppointmentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [modalReq, setModalReq] = useState(null);
  const [showRejected, setShowRejected] = useState(false);

useEffect(() => {
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5001/appointments/getMenteeAppointmentRequest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Yaptığım talepler (sadece pending)
      const filtered = res.data.filter(item => item.status === "pending");
      const formatted = filtered.map((item) => ({
        request_id: item.id,
        mentor: {
          name: item.mentor?.name || "",
          surname: item.mentor?.surname || "",
          photo_url: item.mentor?.profile?.photo_url || "/images/mentor.png",
          skills: item.mentor?.profile?.skills
            ? JSON.parse(item.mentor.profile.skills)
            : [],
          bio: item.mentor?.profile?.bio || "",
        },
        slot: {
          date: item.scheduled_date,
          start_time: item.start_time?.slice(0, 5),
          end_time: item.end_time?.slice(0, 5),
        },
        meeting_reason: item.description,
        status: item.status,
      }));
      setRequests(formatted);

      // Reddedilen talepler
      const rejected = res.data.filter(item => item.status === "rejected");
      const rejectedFormatted = rejected.map((item) => ({
        request_id: item.id,
        mentor: {
          name: item.mentor?.name || "",
          surname: item.mentor?.surname || "",
          photo_url: item.mentor?.profile?.photo_url || "/images/mentor.png",
          skills: item.mentor?.profile?.skills
            ? JSON.parse(item.mentor.profile.skills)
            : [],
          bio: item.mentor?.profile?.bio || "",
        },
        slot: {
          date: item.scheduled_date,
          start_time: item.start_time?.slice(0, 5),
          end_time: item.end_time?.slice(0, 5),
        },
        meeting_reason: item.description,
      }));
      setRejectedRequests(rejectedFormatted); // <-- Bunu eklemen gerekiyor!
    } catch (err) {
      setRequests([]);
      setRejectedRequests([]);
    }
  };
  fetchRequests();
}, []);

  const handleCancelRequest = async (request_id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/appointments/cancelMenteeAppointment/${request_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests((prev) => prev.filter((r) => r.request_id !== request_id));
      setModalReq(null);
    } catch (err) {
      alert("Talep iptal edilemedi.");
    }
  };

  const openModal = (req) => setModalReq(req);
  const closeModal = () => setModalReq(null);

  // Slider mantığı
  const handleSlider = () => setShowRejected((prev) => !prev);

  return (
    <div className="appointment-requests-container">
      <div className="mentor-appointments-toggle-container">
        <span className={`mentor-appointments-tab-span ${!showRejected ? "active" : ""}`}>Yaptığım Görüşme Talepleri</span>
        <label className="mentor-appointments-switch">
          <input type="checkbox" checked={showRejected} onChange={handleSlider} />
          <span className="mentor-appointments-slider"></span>
        </label>
        <span className={`mentor-appointments-tab-span ${showRejected ? "active" : ""}`}>Reddedilen Görüşme Talepleri</span>
      </div>
      <div className="appointment-requests-content-div">
        <h1 className="appointment-requests-title">
          {showRejected ? "Reddedilen Görüşme Talepleri" : "Yaptığım Görüşme Talepleri"}
        </h1>
        <div className="appointment-requests-cards">
          {showRejected
            ? (
              rejectedRequests.length === 0
                ? <div style={{ color: "#fff", marginTop: "32px" }}>Reddedilen görüşme talebiniz yok.</div>
                : rejectedRequests.map((req) => (
                  <div
                    className="appointment-requests-card"
                    key={req.request_id}
                    style={{ cursor: "default", opacity: 0.7 }}
                  >
                    <div
                      className="appointment-requests-image"
                      style={{
                        backgroundImage: `url(${req.mentor.photo_url || "/images/mentor.png"})`,
                      }}
                    ></div>
                    <div className="appointment-requests-info-content">
                      <h2 className="appointment-requests-info-title">
                        {req.meeting_reason || "Görüşme Sebebi Yok"}
                      </h2>
                      <h3 className="appointment-requests-name">
                        {req.mentor.name} {req.mentor.surname}
                      </h3>
                      <div className="appointment-requests-description">
                        <p>
                          {new Date(req.slot.date).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            weekday: "long",
                          })}
                        </p>
                        <p>
                          {req.slot.start_time} - {req.slot.end_time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            )
            : (
              requests.length === 0
                ? <div style={{ color: "#fff", marginTop: "32px" }}>Henüz görüşme talebiniz yok.</div>
                : requests.map((req) => (
                  <div
                    className="appointment-requests-card"
                    key={req.request_id}
                    onClick={() => openModal(req)}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="appointment-requests-image"
                      style={{
                        backgroundImage: `url(${req.mentor.photo_url || "/images/mentor.png"})`,
                      }}
                    ></div>
                    <div className="appointment-requests-info-content">
                      <h2 className="appointment-requests-info-title">
                        {req.meeting_reason || "Görüşme Sebebi Yok"}
                      </h2>
                      <h3 className="appointment-requests-name">
                        {req.mentor.name} {req.mentor.surname}
                      </h3>
                      <div className="appointment-requests-description">
                        <p>
                          {new Date(req.slot.date).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            weekday: "long",
                          })}
                        </p>
                        <p>
                          {req.slot.start_time} - {req.slot.end_time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            )
          }
        </div>
      </div>
      {/* MODAL */}
      {!showRejected && modalReq && (
        <div
          className="mar-modal-overlay"
          onClick={(e) =>
            e.target.classList.contains("mar-modal-overlay") && closeModal()
          }
        >
          <div className="mar-modal-card">
            <button
              className="mar-modal-close-button"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="mar-modal-form-item">
              <label>İsim Soyisim</label>
              <p className="mar-modal-text">
                {modalReq.mentor.name} {modalReq.mentor.surname}
              </p>
            </div>
            <div className="mar-modal-form-item">
              <label>Biyografi</label>
              <input
                className="mar-modal-text"
                value={modalReq.mentor.bio || "Biyografi bulunamadı."}
                readOnly
                style={{ background: "#232323", color: "#fff", border: "1px solid #444" }}
              />
            </div>
            <div className="mar-modal-form-item">
              <label>Yazılım Dilleri</label>
              <p className="mar-modal-text">
                {modalReq.mentor.skills?.length
                  ? modalReq.mentor.skills.join(", ")
                  : "Yazılım dilleri bulunamadı."}
              </p>
            </div>
            <div className="mar-modal-form-item">
              <label>Görüşme Sebebi</label>
              <p className="mar-modal-text">
                {modalReq.meeting_reason || "Henüz eklenmedi"}
              </p>
            </div>
            <div className="mar-modal-form-item">
              <label>Görüşme Tarihi ve Saati</label>
              <p className="mar-modal-text">
                {new Date(modalReq.slot.date).toLocaleDateString("tr-TR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}{" "}
                <br />
                {modalReq.slot.start_time} - {modalReq.slot.end_time}
              </p>
            </div>
            <div className="mentee-appointment-requests-modal-cancel-row">
              <button
                className="mentee-appointment-requests-modal-cancel-button"
                onClick={() => handleCancelRequest(modalReq.request_id)}
              >
                Talebimi İptal Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentRequests;