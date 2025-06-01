import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './mentorAppointments.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

const MentorAppointments = () => {
  const navigate = useNavigate();
  const [isUpcoming, setIsUpcoming] = React.useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);

  const toggleView = () => {
    setIsUpcoming(!isUpcoming);
  };

  const handleJoinMeeting = () => {
    navigate('/videochat');
  };

  const handleReviewClick = (appointmentId) => {
    // İstersen appointmentId ile review sayfasına yönlendirebilirsin
    navigate('/mentorreview');
  };

  // Planlanan görüşmeleri çek
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5001/appointments/mentorUpcomingAppointments",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUpcomingAppointments(res.data);
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
        // Geçmiş görüşmeler için status: "completed" veya "done" gibi bir endpoint olmalı
        // Örnek: /appointments/mentorPastAppointments
        const res = await axios.get(
          "http://localhost:5001/appointments/mentorPastAppointments",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPastAppointments(res.data);
      } catch {
        setPastAppointments([]);
      }
    };
    fetchPast();
  }, []);

  return (
    <div className="mentor-appointments-container">
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

      <div className="mentor-appointments-content">
        {isUpcoming ? (
          <div className='mentor-appointments-content-div'>
            <h1>Planlanan Görüşmelerim</h1>
            <div className="mentor-appointments-form">
              <div className="mentor-appointments-cards">
                {upcomingAppointments.length === 0 ? (
                  <div style={{ color: "#fff", marginTop: "32px" }}>Planlanan görüşme yok.</div>
                ) : (
                  upcomingAppointments.map((appt) => (
                    <div className="mentor-appointments-card" key={appt.id}>
                      <div
                        className="mentor-appointments-image"
                        style={{
                          backgroundImage: appt.mentee?.profile?.photo_url
                            ? `url(${appt.mentee.profile.photo_url})`
                            : "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {(!appt.mentee?.profile?.photo_url) && (
                          <FontAwesomeIcon icon={faCircleUser} style={{ fontSize: 120, color: "#ccc" }} />
                        )}
                      </div>
                      <div className="mentor-appointments-info-content">
                        <h3 className="mentor-appointments-title">
                          {appt.description || "Görüşme"}
                        </h3>
                        <div className="mentor-appointments-mentor-details">
                          <p className="mentor-appointments-name">
                            {appt.mentee?.name} {appt.mentee?.surname}
                          </p>
                        </div>
                        <div className="mentor-appointments-description">
                          <p className="mentor-appointments-date">
                            {new Date(appt.scheduled_date).toLocaleDateString("tr-TR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              weekday: "long",
                            })}, {appt.start_time?.slice(0, 5)}-{appt.end_time?.slice(0, 5)}
                          </p>
                        </div>
                        <div className="mentor-appointments-button-div">
                          <button className="mentor-appointments-message-button">Mesaj At</button>
                          <button
                            className="mentor-appointments-join-button"
                            onClick={handleJoinMeeting}
                          >
                            Görüntülü Görüşmeye Katıl
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h1>Geçmiş Görüşmelerim</h1>
            <div className="mentor-appointments-form">
              <div className="mentor-appointments-cards">
                {pastAppointments.length === 0 ? (
                  <div style={{ color: "#fff", marginTop: "32px" }}>Geçmiş görüşme yok.</div>
                ) : (
                  pastAppointments.map((appt) => (
                    <div className="mentor-appointments-card" key={appt.id}>
                      <div
                        className="mentor-appointments-image"
                        style={{
                          backgroundImage: appt.mentee?.profile?.photo_url
                            ? `url(${appt.mentee.profile.photo_url})`
                            : "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {(!appt.mentee?.profile?.photo_url) && (
                          <FontAwesomeIcon icon={faCircleUser} style={{ fontSize: 60, color: "#ccc" }} />
                        )}
                      </div>
                      <div className="mentor-appointments-info-content">
                        <h3 className="mentor-appointments-title">
                          {appt.description || "Görüşme"}
                        </h3>
                        <div className="mentor-appointments-mentor-details">
                          <p className="mentor-appointments-name">
                            {appt.mentee?.name} {appt.mentee?.surname}
                          </p>
                        </div>
                        <div className="mentor-appointments-description">
                          <p className="mentor-appointments-date">
                            {new Date(appt.scheduled_date).toLocaleDateString("tr-TR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              weekday: "long",
                            })}, {appt.start_time?.slice(0, 5)}-{appt.end_time?.slice(0, 5)}
                          </p>
                        </div>
                        <div className="mentor-appointments-button-div">
                          <button
                            className="mentor-appointments-review-button"
                            onClick={() => handleReviewClick(appt.id)}
                          >
                            Görüşmeyi Değerlendir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorAppointments;
