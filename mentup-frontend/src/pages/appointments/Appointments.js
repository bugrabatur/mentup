import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Appointments.css';

const Appointments = () => {
  const navigate = useNavigate();
  const [isUpcoming, setIsUpcoming] = React.useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);

  // Planlanan görüşmeleri çek
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:5001/appointments/menteeUpcomingAppointments",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setUpcomingAppointments(data);
      } catch {
        setUpcomingAppointments([]);
      }
    };
    fetchUpcoming();
  }, []);

  // Geçmiş görüşmeleri çek
  useEffect(() => {
    const fetchPast = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:5001/appointments/menteePastAppointments",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setPastAppointments(data);
      } catch {
        setPastAppointments([]);
      }
    };
    fetchPast();
  }, []);

  const handleJoinMeeting = () => {
    navigate('/videochat');
  };

  const handleReviewClick = (mentorId, appointmentId) => {
    navigate(`/mentorreview/${mentorId}/${appointmentId}`);
  };

  const handleMessageClick = async (mentorId) => {
    const token = localStorage.getItem("token");
    const user1_id = JSON.parse(atob(token.split('.')[1])).id;
    const user2_id = mentorId;

    const res = await fetch("http://localhost:5001/chatroom/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user1_id, user2_id, token }),
    });
    const data = await res.json();
    console.log("Chatroom response:", data); // <-- ekle

    // mentorId yerine mentor objesini gönder!
    window.dispatchEvent(new CustomEvent("openChatRoom", { detail: { chatroom: data.chatroom, mentor: data.mentor } }));
  };

  return (
    <div className="appointments-container">
      <div className="ar-toggle-container">
        <div className="ar-toggle-tabs">
          <div
            className="ar-toggle-slider"
            style={{
              left: isUpcoming ? 0 : "50%",
              transition: "left 0.25s cubic-bezier(.4,0,.2,1)"
            }}
          />
          <button
            className={`ar-toggle-tab${isUpcoming ? " active" : ""}`}
            onClick={() => setIsUpcoming(true)}
            type="button"
          >
            Planlanan Görüşmelerim
          </button>
          <button
            className={`ar-toggle-tab${!isUpcoming ? " active" : ""}`}
            onClick={() => setIsUpcoming(false)}
            type="button"
          >
            Geçmiş Görüşmelerim
          </button>
        </div>
      </div>

      <div className="appointment-content">
        {isUpcoming ? (
          <div className='appointment-content-div'>
            <h1>Planlanan Görüşmelerim</h1>
            <div className="appointment-form">
              {upcomingAppointments.length === 0 ? (
                <div style={{ color: "#fff", marginTop: "32px" }}>Planlanan görüşme yok.</div>
              ) : (
                <div className="appointment-cards">
                  {upcomingAppointments.map((appt) => (
                    <div className="appointment-card" key={appt.id}>
                      <div
                        className="appointment-image"
                        style={{
                          backgroundImage: appt.mentor?.profile?.photo_url
                            ? `url(${appt.mentor.profile.photo_url})`
                            : "none",
                        }}
                      ></div>
                      <div className="appointment-info-content">
                        <h3 className="appointment-title">
                          {appt.description || "Görüşme"}
                        </h3>
                        <div className="appointment-mentor-details">
                          <p className="appointment-name">
                            {appt.mentor?.name} {appt.mentor?.surname}
                          </p>
                        </div>
                        <div className="appointment-description">
                          <p className="appointment-date">
                            {new Date(appt.scheduled_date).toLocaleDateString("tr-TR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              weekday: "long",
                            })}, {appt.start_time?.slice(0, 5)}-{appt.end_time?.slice(0, 5)}
                          </p>
                        </div>
                        <div className="appointment-button-div">
                          <button 
                            className="message-button"
                            onClick={() => handleMessageClick(appt.mentor.id)}
                          >Mesaj At</button>
                          <button
                            className="appointment-button"
                            onClick={handleJoinMeeting}
                          >
                            Görüntülü Görüşmeye Katıl
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h1>Geçmiş Görüşmelerim</h1>
            <div className="appointment-form">
              {pastAppointments.length === 0 ? (
                <div style={{ color: "#fff", marginTop: "32px" }}>Geçmiş görüşme yok.</div>
              ) : (
                <div className="appointment-cards">
                  {pastAppointments.map((appt) => (
                    <div className="appointment-card" key={appt.id}>
                      <div
                        className="appointment-image"
                        style={{
                          backgroundImage: appt.mentor?.profile?.photo_url
                            ? `url(${appt.mentor.profile.photo_url})`
                            : "none",
                        }}
                      ></div>
                      <div className="appointment-info-content">
                        <h3 className="appointment-title">
                          {appt.description || "Görüşme"}
                        </h3>
                        <div className="appointment-mentor-details">
                          <p className="appointment-name">
                            {appt.mentor?.name} {appt.mentor?.surname}
                          </p>
                        </div>
                        <div className="appointment-description">
                          <p className="appointment-date">
                            {new Date(appt.scheduled_date).toLocaleDateString("tr-TR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              weekday: "long",
                            })}, {appt.start_time?.slice(0, 5)}-{appt.end_time?.slice(0, 5)}
                          </p>
                        </div>
                        <div className="appointment-button-div">
                          <button
                            className="appointment-review-button"
                            onClick={() => handleReviewClick(appt.mentor.id, appt.id)}
                          >
                            Görüşmeyi Değerlendir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
