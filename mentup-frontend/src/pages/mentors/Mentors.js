import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Mentors.css';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get('http://localhost:5001/mentor/getMentors', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setMentors(res.data))
      .catch(err => console.error("Mentorlar alınamadı:", err));
  }, []);

  return (
    <div className='mentors-container'>
      <header></header>
      <main>
        <div className='mentors-section'>
          <h1 className='mentors-section-title'>Mentorlarımız</h1>
          <div className='mentor-cards'>
            {mentors.map((mentor) => (
              <div className='mentor-card' key={mentor.user_id}>
                <div
                  className='mentor-card-image'
                  style={{
                    backgroundImage: mentor.profile?.photo_url
                      ? `url(${mentor.profile.photo_url})`
                      : undefined,
                  }}
                />
                <h2 className='mentor-name'>{mentor.name} {mentor.surname}</h2>
                <p className='mentor-info'>{mentor.bio}</p>
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
