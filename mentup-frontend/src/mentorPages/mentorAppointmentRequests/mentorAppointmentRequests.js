import React, { useEffect, useState } from "react";
import axios from "axios";
import "./mentorAppointmentRequests.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

const MentorAppointmentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [modalReq, setModalReq] = useState(null);
  const [showRejected, setShowRejected] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5001/appointments/getMentorAppointmentRequest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Gelen talepler (pending)
        const filtered = res.data.filter(item => item.status === "pending");
        const formatted = filtered.map((item) => ({
          request_id: item.id,
          mentee: {
            name: item.mentee?.name || "",
            surname: item.mentee?.surname || "",
            skills: item.mentee?.profile?.skills
              ? JSON.parse(item.mentee.profile.skills)
              : [],
            photo_url: item.mentee?.profile?.photo_url || "/images/mentee.png",
            bio: item.mentee?.profile?.bio || "",
          },
          slot: {
            date: item.scheduled_date,
            start_time: item.start_time,
            end_time: item.end_time,
          },
          meeting_reason: item.description,
        }));
        setRequests(formatted);

        // Reddedilen talepler (rejected)
        const rejected = res.data.filter(item => item.status === "rejected");
        const rejectedFormatted = rejected.map((item) => ({
          request_id: item.id,
          mentee: {
            name: item.mentee?.name || "",
            surname: item.mentee?.surname || "",
            skills: item.mentee?.profile?.skills
              ? JSON.parse(item.mentee.profile.skills)
              : [],
            photo_url: item.mentee?.profile?.photo_url || "/images/mentee.png",
            bio: item.mentee?.profile?.bio || "",
          },
          slot: {
            date: item.scheduled_date,
            start_time: item.start_time,
            end_time: item.end_time,
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

  const openModal = (req) => setModalReq(req);
  const closeModal = () => setModalReq(null);

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/appointments/confirmMentorAppointment/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests((prev) => prev.filter((r) => r.request_id !== requestId));
      setModalReq(null);
    } catch (err) {
      alert("Talep onaylanamadı.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/appointments/rejectMentorAppointment/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests((prev) => prev.filter((r) => r.request_id !== requestId));
      setModalReq(null);
    } catch (err) {
      alert("Talep reddedilemedi.");
    }
  };

  return (
    <div className="appointment-requests-container">
      <div className="ar-toggle-container">
        <div className="ar-toggle-tabs">
          <div
            className="ar-toggle-slider"
            style={{
              left: !showRejected ? 0 : "50%",
              transition: "left 0.25s cubic-bezier(.4,0,.2,1)"
            }}
          />
          <button
            className={`ar-toggle-tab${!showRejected ? " active" : ""}`}
            onClick={() => setShowRejected(false)}
            type="button"
          >
            Gelen Talepler
          </button>
          <button
            className={`ar-toggle-tab${showRejected ? " active" : ""}`}
            onClick={() => setShowRejected(true)}
            type="button"
          >
            Reddedilen Talepler
          </button>
        </div>
      </div>

      <div className="appointment-requests-content-div">
        <h1 className="appointment-requests-title">
          {showRejected ? "Reddedilen Görüşme Talepleri" : "Gelen Görüşme Talepleri"}
        </h1>
        <div className="appointment-requests-cards">
          {showRejected
            ? (
              rejectedRequests.length === 0
                ? <div style={{ color: "#fff", marginTop: "32px" }}>Reddedilen görüşme talebi yok.</div>
                : rejectedRequests.map((req) => (
                  <div
                    className="appointment-requests-card"
                    key={req.request_id}
                    style={{ cursor: "default", opacity: 0.7 }}
                  >
                    <div
                      className="appointment-requests-image"
                      style={{
                        backgroundImage: req.mentee.photo_url && req.mentee.photo_url !== "/images/mentee.png"
                          ? `url(${req.mentee.photo_url})`
                          : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {(!req.mentee.photo_url || req.mentee.photo_url === "/images/mentee.png") && (
                        <FontAwesomeIcon icon={faCircleUser} style={{ fontSize: 130, color: "#ccc" }} />
                      )}
                    </div>
                    <div className="appointment-requests-info-content">
                      <h2 className="appointment-requests-info-title">
                        {req.meeting_reason || "Görüşme Sebebi Yok"}
                      </h2>
                      <h3 className="appointment-requests-name">
                        {req.mentee.name} {req.mentee.surname}
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
                          {req.slot.start_time?.slice(0, 5)} - {req.slot.end_time?.slice(0, 5)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            )
            : (
              requests.length === 0
                ? <div style={{ color: "#fff", marginTop: "32px" }}>Henüz görüşme talebi yok.</div>
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
                        backgroundImage: req.mentee.photo_url && req.mentee.photo_url !== "/images/mentee.png"
                          ? `url(${req.mentee.photo_url})`
                          : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {(!req.mentee.photo_url || req.mentee.photo_url === "/images/mentee.png") && (
                        <FontAwesomeIcon icon={faCircleUser} style={{ fontSize: 130, color: "#ccc" }} />
                      )}
                    </div>
                    <div className="appointment-requests-info-content">
                      <h2 className="appointment-requests-info-title">
                        {req.meeting_reason || "Görüşme Sebebi Yok"}
                      </h2>
                      <h3 className="appointment-requests-name">
                        {req.mentee.name} {req.mentee.surname}
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
                          {req.slot.start_time?.slice(0, 5)} - {req.slot.end_time?.slice(0, 5)}
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
                {modalReq.mentee.name} {modalReq.mentee.surname}
              </p>
            </div>
            <div className="mar-modal-form-item">
              <label>Biyografi</label>
              <input
                className="mar-modal-text"
                value={modalReq.mentee.bio || "Biyografi bulunamadı."}
                readOnly
                style={{ background: "#232323", color: "#fff", border: "1px solid #444" }}
              />
            </div>
            <div className="mar-modal-form-item">
              <label>Yazılım Dilleri</label>
              <p className="mar-modal-text">
                {modalReq.mentee.skills?.join(", ")}
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
                {modalReq.slot.start_time?.slice(0, 5)} - {modalReq.slot.end_time?.slice(0, 5)}
              </p>
            </div>
            <div className="mar-modal-action-buttons">
              <button
                className="mar-modal-button reject"
                onClick={() => handleReject(modalReq.request_id)}
              >
                Talebi Reddet
              </button>
              <button
                className="mar-modal-button approve"
                onClick={() => handleApprove(modalReq.request_id)}
              >
                Talebi Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorAppointmentRequests;