import React, { useEffect, useState } from 'react';
import "./Home.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ChatWidget from '../../components/chatWidget/chatWidget';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [mentors, setMentors] = useState([]);
  const [ratings, setRatings] = useState({}); // ratingler için state
    const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5001/mentor/getMentors")
      .then(res => {
        setMentors(res.data);
      })
      .catch(() => setMentors([]));
  }, []);

  // Mentor ratinglerini çek
  useEffect(() => {
    mentors.forEach((mentor) => {
      axios.get(`http://localhost:5001/reviews/mentor/${mentor.id}/averageRating`)
        .then(res => {
          setRatings(prev => ({ ...prev, [mentor.id]: res.data.rating }));
        });
    });
  }, [mentors]);

// const sliderSettings = {
//   dots: false,
//   infinite: true,
//   speed: 2000,
//   slidesToShow: 3,
//   slidesToScroll: 1,
//   rtl: false, // SAĞDAN SOLA
//   autoplay: true, // OTOMATİK KAYMA
//   autoplaySpeed: 5000, // 2 saniyede bir kay
//   arrows: false
// };

const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 20000,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 0,
  cssEase: "linear",
  arrows: false,
  pauseOnHover: false,      // Eklendi
  pauseOnFocus: false,      // Eklendi
  pauseOnDotsHover: false   // Eklendi
};

  const handleSearch = () => {
    navigate("/browsementors");
  };
  
  return (
    <div className='home-container'> 
      <header>
      </header>
      <main>
        <section className="hero">
          <div className='hero-content'>
            <h1>Kariyer yolculuğunda bir adım öne çık</h1>
            <p>Alanında uzman mentorlarla hemen tanış, ücretsiz destek al.</p>
            <button className='hero-button' onClick={handleSearch}>Mentor Ara</button>
          </div>
        </section>
        <section className="home-mentor-slider-section">
          <div className="home-slider-fade-left"></div>
          <div className="home-slider-fade-right"></div>
          {/* <div className="home-slider-fade-bottom"></div> */}
          {/* <div className='shadow-overlay'></div> */}
          <Slider {...sliderSettings}>
            {mentors.map((mentor) => {
              if (!mentor.profile) return null;

              // Skills alanı bazen string olabiliyor, diziye çevir
              let skills = mentor.profile.skills;
              if (typeof skills === "string") {
                try {
                  skills = JSON.parse(skills);
                } catch {
                  skills = [skills];
                }
              }

              return (
                <div className='home-mentor-card-container' style={{width: "100%"}}>
                <div key={mentor.id} className="home-mentor-card" style={{position: "relative"}}>
                  {/* Rating sağ üst köşe */}
                  <div
                    className="mentor-rating-badge"
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      background: "#232323",
                      color: "#8e9291",
                      borderRadius: 8,
                      padding: "2px 10px 2px 8px",
                      fontWeight: "bold",
                      fontSize: 16,
                      zIndex: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      boxShadow: "0 2px 8px #00000022"
                    }}
                  >
                    {[...Array(5)].map((_, i) => {
                      const rating = ratings[mentor.id];
                      if (rating === null || rating === undefined) {
                        return (
                          <FontAwesomeIcon
                            key={i}
                            icon={faStarRegular}
                            style={{ color: "#ccc", marginRight: 1, fontSize: 20 }}
                          />
                        );
                      }
                      if (i < Math.floor(rating)) {
                        return (
                          <FontAwesomeIcon
                            key={i}
                            icon={faStar}
                            style={{ color: "#ff9800", marginRight: 1, fontSize: 20 }}
                          />
                        );
                      }
                      if (i < rating && rating < i + 1) {
                        return (
                          <FontAwesomeIcon
                            key={i}
                            icon={faStarHalfAlt}
                            style={{ color: "#ff9800", marginRight: 1, fontSize: 20 }}
                          />
                        );
                      }
                      return (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStarRegular}
                          style={{ color: "#ccc", marginRight: 1, fontSize: 20 }}
                        />
                      );
                    })}
                    <span style={{ marginLeft: 6, color: "#8e9291", fontWeight: 500, fontSize: 18 }}>
                      {ratings[mentor.id] !== undefined && ratings[mentor.id] !== null
                        ? Number(ratings[mentor.id]).toFixed(1)
                        : "0.0"}
                    </span>
                  </div>
                  {/* Profil resmi ve isim yan yana */}
                  <div style={{display: "flex", alignItems: "center", justifyContent: "center", marginTop: 20, marginBottom: 12, gap: 16}}>
                    <div
                      className="home-mentor-image"
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        border: "1px solid #8e9291",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundImage: mentor.profile.photo_url
                          ? `url(${mentor.profile.photo_url})`
                          : "none"
                      }}
                    >
                      {!mentor.profile.photo_url && (
                        <FontAwesomeIcon icon={faUser} style={{ color: "#8e9291", fontSize: 40 }} />
                      )}
                    </div>
                    <h3 style={{margin: 0, fontSize: 22, color: "#fff"}}>{mentor.name} {mentor.surname}</h3>
                  </div>
                  <div className="home-mentor-info" style={{textAlign: "center"}}>
                    <p className="home-mentor-description" >
                      {mentor.profile.bio || "Biyografi yok"}
                    </p>
                    {/* INDUSTRIES */}
                    <div className="home-mentor-industries" style={{display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginBottom: 8}}>
                      {(() => {
                        let industries = mentor.profile?.industries;
                        if (!industries && mentor.documents && mentor.documents.length > 0) {
                          industries = mentor.documents[0].industries;
                        }
                        if (typeof industries === "string") {
                          try {
                            industries = JSON.parse(industries);
                          } catch {
                            industries = [industries];
                          }
                        }
                        return industries && Array.isArray(industries)
                          ? industries.map((industry, i) => (
                              <span key={i} style={{
                                background: "#444",
                                color: "#fff",
                                borderRadius: 8,
                                padding: "3px 10px",
                                fontSize: 13,
                                margin: "2px"
                              }}>{industry}</span>
                            ))
                          : <span style={{
                              background: "#444",
                              color: "#fff",
                              borderRadius: 8,
                              padding: "3px 10px",
                              fontSize: 13
                            }}>Sektör yok</span>
                      })()}
                    </div>
                    {/* SKILLS */}
                    <div className="home-mentor-skills" style={{display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6}}>
                      {skills && Array.isArray(skills)
                        ? skills.map((skill, i) => (
                            <span key={i} style={{
                              background: "#6938ef",
                              color: "#fff",
                              borderRadius: 8,
                              padding: "3px 10px",
                              fontSize: 13,
                              margin: "2px"
                            }}>{skill}</span>
                          ))
                        : <span style={{
                            background: "#444",
                            color: "#fff",
                            borderRadius: 8,
                            padding: "3px 10px",
                            fontSize: 13
                          }}>Beceri yok</span>
                      }
                    </div>
                  </div>
                </div>
                </div>
              );
            })}
          </Slider>
        </section>
      </main>
      <ChatWidget/>
    </div>
  );
};

export default Home;
