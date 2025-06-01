import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Mentors.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

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
      axios.get(`http://localhost:5001/reviews/mentor/${mentor.id}/averageRating`)
        .then(res => {
          setRatings(prev => ({ ...prev, [mentor.id]: res.data.rating }));
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
              <div className='mentor-card' key={mentor.id} style={{ position: "relative" }}>
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
                    {[...Array(5)].map((_, i) => {
                      const rating = ratings[mentor.id]; // <-- DÜZELTİLDİ
                      if (rating === null || rating === undefined) {
                        return (
                          <FontAwesomeIcon
                            key={i}
                            icon={faStarRegular}
                            style={{ color: "#ccc", marginRight: 2 }}
                          />
                        );
                      }
                      if (i < Math.floor(rating)) {
                        return (
                          <FontAwesomeIcon
                            key={i}
                            icon={faStar}
                            style={{ color: "#ff9800", marginRight: 2 }}
                          />
                        );
                      }
                      if (i < rating && rating < i + 1) {
                        return (
                          <FontAwesomeIcon
                            key={i}
                            icon={faStarHalfAlt}
                            style={{ color: "#ff9800", marginRight: 2 }}
                          />
                        );
                      }
                      return (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStarRegular}
                          style={{ color: "#ccc", marginRight: 2 }}
                        />
                      );
                    })}
                    <span style={{ marginLeft: 4, fontWeight: 500 }}>
                      {ratings[mentor.id] !== null && ratings[mentor.id] !== undefined
                        ? Number(ratings[mentor.id]).toFixed(1)
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
