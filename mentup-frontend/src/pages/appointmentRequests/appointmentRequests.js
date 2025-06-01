import React, { useEffect, useState } from "react";
import axios from "axios";
import "./appointmentRequests.css";
import "../appointments/Appointments.css";

const AppointmentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [modalReq, setModalReq] = useState(null);
  const [isPending, setIsPending] = useState(true);

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
        setRejectedRequests(rejectedFormatted);
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

  return (
    <div className="ar-requests-container">
      <div className="ar-toggle-container">
        <div className="ar-toggle-tabs">
          <div
            className="ar-toggle-slider"
            style={{
              left: isPending ? 0 : "50%",
              transition: "left 0.25s cubic-bezier(.4,0,.2,1)"
            }}
          />
          <button
            className={`ar-toggle-tab${isPending ? " active" : ""}`}
            onClick={() => setIsPending(true)}
            type="button"
          >
            Bekleyen Taleplerim
          </button>
          <button
            className={`ar-toggle-tab${!isPending ? " active" : ""}`}
            onClick={() => setIsPending(false)}
            type="button"
          >
            Reddedilen Taleplerim
          </button>
        </div>
      </div>
      <div className="ar-content-div">
        <h1 className="ar-title">
          {isPending ? "Yaptığım Görüşme Talepleri" : "Reddedilen Görüşme Talepleri"}
        </h1>
        <div className="ar-content">
          {isPending ? (
            <div className="ar-cards">
              {requests.length === 0
                ? <div style={{ color: "#fff", marginTop: "32px" }}>Henüz görüşme talebiniz yok.</div>
                : requests.map((req) => (
                  <div
                    className="ar-card"
                    key={req.request_id}
                    onClick={() => openModal(req)}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="ar-image"
                      style={{
                        backgroundImage: `url(${req.mentor.photo_url || "/images/mentor.png"})`,
                      }}
                    ></div>
                    <div className="ar-info-content">
                      <h2 className="ar-info-title">
                        {req.meeting_reason || "Görüşme Sebebi Yok"}
                      </h2>
                      <h3 className="ar-name">
                        {req.mentor.name} {req.mentor.surname}
                      </h3>
                      <div className="ar-description">
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
              }
            </div>
          ) : (
            <div className="ar-cards">
              {rejectedRequests.length === 0
                ? <div style={{ color: "#fff", marginTop: "32px" }}>Reddedilen görüşme talebiniz yok.</div>
                : rejectedRequests.map((req) => (
                  <div
                    className="ar-card"
                    key={req.request_id}
                    style={{ cursor: "default", opacity: 0.7 }}
                  >
                    <div
                      className="ar-image"
                      style={{
                        backgroundImage: `url(${req.mentor.photo_url || "/images/mentor.png"})`,
                      }}
                    ></div>
                    <div className="ar-info-content">
                      <h2 className="ar-info-title">
                        {req.meeting_reason || "Görüşme Sebebi Yok"}
                      </h2>
                      <h3 className="ar-name">
                        {req.mentor.name} {req.mentor.surname}
                      </h3>
                      <div className="ar-description">
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
              }
            </div>
          )}
        </div>
      </div>
      {/* MODAL */}
      {isPending && modalReq && (
        <div
          className="ar-modal-overlay"
          onClick={(e) =>
            e.target.classList.contains("ar-modal-overlay") && closeModal()
          }
        >
          <div className="ar-modal-card">
            <button
              className="ar-modal-close-button"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="ar-modal-form-item">
              <label>İsim Soyisim</label>
              <p className="ar-modal-text">
                {modalReq.mentor.name} {modalReq.mentor.surname}
              </p>
            </div>
            <div className="ar-modal-form-item">
              <label>Biyografi</label>
              <input
                className="ar-modal-text"
                value={modalReq.mentor.bio || "Biyografi bulunamadı."}
                readOnly
                style={{ background: "#232323", color: "#fff", border: "1px solid #444" }}
              />
            </div>
            <div className="ar-modal-form-item">
              <label>Yazılım Dilleri</label>
              <p className="ar-modal-text">
                {modalReq.mentor.skills?.length
                  ? modalReq.mentor.skills.join(", ")
                  : "Yazılım dilleri bulunamadı."}
              </p>
            </div>
            <div className="ar-modal-form-item">
              <label>Görüşme Sebebi</label>
              <p className="ar-modal-text">
                {modalReq.meeting_reason || "Henüz eklenmedi"}
              </p>
            </div>
            <div className="ar-modal-form-item">
              <label>Görüşme Tarihi ve Saati</label>
              <p className="ar-modal-text">
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
            <div className="ar-modal-cancel-row">
              <button
                className="ar-modal-cancel-button"
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