import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Mentors.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get('http://localhost:5001/mentor/getMentors', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setMentors(res.data))
      .catch(err => console.error("Mentorlar alınamadı:", err));
  }, []);

  useEffect(() => {
    mentors.forEach((mentor) => {
      axios.get(`http://localhost:5001/reviews/mentor/${mentor.user_id}/averageRating`)
        .then(res => {
          setRatings(prev => ({ ...prev, [mentor.user_id]: res.data.rating }));
        });
    });
  }, [mentors]);

  return (
    <div className='mentors-container'>
      <header></header>
      <main>
        <div className='mentors-section'>
          <h1 className='mentors-section-title'>Mentorlarımız</h1>
          <div className='mentor-cards'>
            {mentors.map((mentor) => (
              <div className='mentor-card' key={mentor.user_id} style={{ position: "relative" }}>
                <div
                  className='mentor-card-image'
                  style={{
                    backgroundImage: mentor.profile?.photo_url
                      ? `url(${mentor.profile.photo_url})`
                      : undefined,
                  }}
                >
                  {/* Sağ üst köşede rating ve yıldızlar */}
                  <div className="mentor-card-rating">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        style={{
                          color:
                            ratings[mentor.user_id] !== null &&
                            ratings[mentor.user_id] !== undefined &&
                            i < Math.round(ratings[mentor.user_id])
                              ? "#ff9800"
                              : "#ccc",
                          marginRight: 2,
                        }}
                      />
                    ))}
                    <span style={{ marginLeft: 4, fontWeight: 500 }}>
                      {ratings[mentor.user_id] !== null && ratings[mentor.user_id] !== undefined
                        ? Number(ratings[mentor.user_id]).toFixed(1)
                        : "Ratingi yok"}
                    </span>
                  </div>
                </div>
                <h2 className='mentor-name'>{mentor.name} {mentor.surname}</h2>
                <p className='mentor-info'>
                  {mentor.bio ? mentor.bio : "Biyografi bulunamadı."}
                </p>
                <div className='mentor-industries-skills-div'>
                  <p className='mentor-industries'>
                    <strong>Beceri Alanları:</strong>{" "}
                    {mentor.industries
                      ? JSON.parse(mentor.industries).join(", ")
                      : "Belirtilmemiş"}
                  </p>
                  <p className='mentor-skills'>
                    <strong>Yazılım Dilleri:</strong>{" "}
                    {mentor.skills
                      ? JSON.parse(mentor.skills).join(", ")
                      : "Belirtilmemiş"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mentors;
