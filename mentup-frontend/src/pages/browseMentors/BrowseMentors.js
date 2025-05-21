import React, { useState, useRef, useEffect } from "react";
import "./BrowseMentors.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

// Çoklu seçimli custom dropdown menu
const CustomDropdownMenu = ({ options, selectedOptions, setSelectedOptions }) => {
  const handleOptionClick = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  return (
    <div className="custom-dropdown-menu">
      {options.map((option, i) => (
        <div
          key={i}
          className={`custom-dropdown-option${selectedOptions.includes(option) ? " selected" : ""}`}
          onClick={() => handleOptionClick(option)}
        >
          {option}
        </div>
      ))}
    </div>
  );
};

// Tekli seçimli custom dropdown menu (BrowseMentors'a özel)
const BmSingleSelectDropdown = ({ options, selectedOption, setSelectedOption, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const handleOutsideClick = (event) => {
    if (!event.target.closest(".bm-custom-dropdown")) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className="bm-custom-dropdown">
      <label className="bm-custom-dropdown-label">{label}</label>
      <div className="bm-custom-dropdown-input" onClick={toggleDropdown}>
        {selectedOption?.label || "Seçim yapın"}
      </div>
      {isOpen && (
        <div className="bm-custom-dropdown-menu upwards">
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`bm-custom-dropdown-option ${
                selectedOption && selectedOption.value === option.value ? "selected" : ""
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BrowseMentors = () => {
  const [loading, setLoading] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allMentors, setAllMentors] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [modalMentor, setModalMentor] = useState(null);
  const [mentorSlots, setMentorSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [meetingReason, setMeetingReason] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  const menuRef = useRef(null);

  const menuData = [
    {
      label: "Beceri Alanları",
      options: [
        "Yazılım Geliştirme", "Web Teknolojileri", "Mobil Teknolojiler",
        "Oyun Geliştirme", "Veritabanı ve Backend", "Yapay Zeka & Veri Bilimi",
        "Veri Analizi & BI", "Tasarım & UI/UX", "Pazarlama & İş Geliştirme"
      ],
      type: "skills",
    },
    {
      label: "Yazılım Dilleri",
      options: [
        "C", "C++", "C#", "CSS", "HTML", "Java", "JavaScript", "Kotlin",
        "PHP", "Python", "R", "TypeScript"
      ],
      type: "languages",
    }
  ];

  // Menü açma/kapama
  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  // Menü dışına tıklanınca kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mentorları ilk yüklemede çek
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5001/mentor/filterMentors")
      .then((res) => {
        setAllMentors(res.data);
        setMentors(res.data);
        setLoading(false);
      })
      .catch(() => {
        setAllMentors([]);
        setMentors([]);
        setLoading(false);
      });
  }, []);

  // Dropdown veya arama değişince mentorları filtrele
  useEffect(() => {
    let filtered = allMentors;

    // İsim araması
    if (searchTerm.trim()) {
      filtered = filtered.filter((mentor) => {
        const fullName = `${mentor.name} ${mentor.surname}`.toLowerCase();
        return (
          mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mentor.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fullName.includes(searchTerm.toLowerCase())
        );
      });
    }

    // Beceri alanı (industries) filtresi
    if (selectedSkills.length > 0) {
      filtered = filtered.filter((mentor) => {
        if (!mentor.industries) return false;
        try {
          const industries = JSON.parse(mentor.industries);
          return selectedSkills.some((skill) => industries.includes(skill));
        } catch {
          return false;
        }
      });
    }

    // Yazılım dilleri (skills) filtresi
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter((mentor) => {
        if (!mentor.skills) return false;
        try {
          const skills = JSON.parse(mentor.skills);
          return selectedLanguages.some((lang) => skills.includes(lang));
        } catch {
          return false;
        }
      });
    }

    setMentors(filtered);
  }, [searchTerm, selectedSkills, selectedLanguages, allMentors]);

  // Arama kutusuna yazıldıkça searchTerm güncellenir
  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {};

  // Modal açma
  const openMentorModal = async (mentor) => {
    setModalMentor(mentor);
    setSelectedSlot("");
    setMeetingReason("");
    setLoadingSlots(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5001/mentor/availability/getMentorAvailability/${mentor.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMentorSlots(res.data.slots);
    } catch (err) {
      setMentorSlots([]);
    }
    setLoadingSlots(false);
  };

  const closeMentorModal = () => {
    setModalMentor(null);
    setMentorSlots([]);
    setSelectedSlot("");
    setMeetingReason("");
  };

  const handleModalConfirm = async () => {
    if (!selectedSlot) {
      alert("Lütfen bir müsaitlik seçin.");
      return;
    }
    if (!meetingReason.trim()) {
      alert("Lütfen görüşme sebebinizi yazın.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      // Seçilen slotun detaylarını bul
      const slot = mentorSlots.find(s => s.slot_id === selectedSlot);
      if (!slot) {
        alert("Seçilen slot bulunamadı.");
        return;
      }
      await axios.post(
        "http://localhost:5001/appointments/createAppointment",
        {
          mentor_id: modalMentor.user_id || modalMentor.id,
          scheduled_date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          description: meetingReason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Görüşme talebiniz gönderildi!");
      closeMentorModal();
    } catch (err) {
      alert("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  };

  useEffect(() => {
    if (modalMentor) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [modalMentor]);

  return (
    <div className="browse-mentors-container">
      <header></header>
      <main>
        <div className="browse-mentors-form-div">
          <div className="browse-mentors-form">
            <h2 className="browse-mentors-form-title">Mentor Ara</h2>
            <div className="browse-mentors-search-bar">
              <div className="browse-mentors-search-input-wrapper">
                <input
                  type="text"
                  placeholder="İsme göre arama yapın"
                  value={searchTerm}
                  onChange={handleSearchInput}
                />
                <button
                  className="browse-mentors-search-icon"
                  onClick={handleSearch}
                >
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    style={{ color: "black", fontSize: "16px" }}
                  />
                </button>
              </div>
              <div className="browse-mentors-search-filters" ref={menuRef}>
                <div className="browse-mentors-search-tags">
                  {menuData.map((menu, index) => (
                    <div key={index} className="browse-mentors-menu-filter">
                      <button
                        className={`browse-mentors-search-tag-${menu.type}`}
                        onClick={() => toggleMenu(index)}
                      >
                        <span>{menu.label}</span>
                        <span>
                          <FontAwesomeIcon icon={faAngleDown} />
                        </span>
                      </button>
                      {openMenuIndex === index && (
                        <div style={{ minWidth: 200 }}>
                          <CustomDropdownMenu
                            options={menu.options}
                            selectedOptions={
                              menu.type === "skills" ? selectedSkills : selectedLanguages
                            }
                            setSelectedOptions={
                              menu.type === "skills" ? setSelectedSkills : setSelectedLanguages
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mentor-list-container">
              {loading ? (
                <div style={{ color: "#fff", marginTop: "32px" }}>Yükleniyor...</div>
              ) : mentors.length === 0 && (selectedSkills.length > 0 || selectedLanguages.length > 0 || searchTerm) ? (
                <div style={{ color: "#fff", marginTop: "32px" }}>Mentor bulunamadı.</div>
              ) : (
                mentors.map((mentor, index) => (
                  <div
                    key={index}
                    className="mentor-card"
                    onClick={() => openMentorModal(mentor)}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="mentor-image"
                      style={{
                        backgroundImage:
                          mentor.profile && mentor.profile.photo_url
                            ? `url(${mentor.profile.photo_url})`
                            : mentor.short_photo_url
                            ? `url(${mentor.short_photo_url})`
                            : `url('/images/mentor.png')`,
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }}
                    ></div>
                    <div className="mentor-info">
                      <h3>{mentor.name} {mentor.surname}</h3>
                      <div className="mentor-info-industries-skills-div">
                        <p className="mentor-title">
                          {mentor.industries
                            ? JSON.parse(mentor.industries).join(", ")
                            : "Beceri alanları bulunamadı."}
                        </p>
                        <p className="mentor-title">
                          {mentor.skills
                            ? JSON.parse(mentor.skills).join(", ")
                            : "Yazılım dilleri bulunamadı."}
                        </p>
                        </div>
                      <p className="mentor-description">{mentor.bio || "Biyografi bulunamadı."}</p>
                    </div>
                    <div className="mentor-actions">
                      <div className="browse-mentors-mentor-buttons">
                        <button
                          onClick={e => { e.stopPropagation(); openMentorModal(mentor); }}
                          className="schedule-button"
                        >
                          Görüşme Planla
                        </button>
                        <button
                          className="browse-mentors-message-button"
                          onClick={e => e.stopPropagation()}
                        >
                          Mesaj At
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {modalMentor && (
        <div className="bm-modal-overlay" onClick={e => e.target.classList.contains('bm-modal-overlay') && closeMentorModal()}>
          <div className="bm-modal-card">
            <button className="bm-modal-close-button" onClick={closeMentorModal}>
              &times;
            </button>
            <div className="bm-modal-name-surname-div">
              <div className="bm-modal-name">
                <label className="bm-modal-name-label">İsim</label>
                <p className="bm-modal-name-text">{modalMentor.name}</p>
              </div>
              <div className="bm-modal-surname">
                <label className="bm-modal-surname-label">Soyisim</label>
                <p className="bm-modal-surname-text">{modalMentor.surname}</p>
              </div>
            </div>
            <div className="bm-modal-form-item">
              <label>Biyografi</label>
              <p className="bm-modal-bio-text">
                {(modalMentor.profile && modalMentor.profile.bio) 
                  ? modalMentor.profile.bio 
                  : (modalMentor.bio || "Biyografi bulunamadı.")}
              </p>
            </div>
            <div className="bm-modal-form-item">
              <label>Beceri Alanları</label>
              <p className="bm-modal-skills-text">
                {modalMentor.industries
                  ? JSON.parse(modalMentor.industries).join(", ")
                  : "Belirtilmemiş"}
              </p>
            </div>
            <div className="bm-modal-form-item">
              <label>Yazılım Dilleri</label>
              <p className="bm-modal-languages-text">
                {modalMentor.skills
                  ? JSON.parse(modalMentor.skills).join(", ")
                  : "Belirtilmemiş"}
              </p>
            </div>
            <div className="bm-modal-form-item">
              <label>Müsaitlik Seç</label>
              {loadingSlots ? (
                <p style={{ color: "#fff" }}>Yükleniyor...</p>
              ) : (
                <BmSingleSelectDropdown
                  label=""
                  options={mentorSlots.map((slot) => {
                    const date = new Date(`${slot.date}T${slot.start_time}`);
                    const dayName = date.toLocaleDateString("tr-TR", { weekday: "long" });
                    const dateStr = date.toLocaleDateString("tr-TR");
                    const startTime = slot.start_time.slice(0, 5);
                    const endTime = slot.end_time.slice(0, 5);
                    return {
                      value: slot.slot_id,
                      label: `${dateStr} ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${startTime}-${endTime}`,
                    };
                  })}
                  selectedOption={
                    mentorSlots
                      .map((slot) => {
                        const date = new Date(`${slot.date}T${slot.start_time}`);
                        const dayName = date.toLocaleDateString("tr-TR", { weekday: "long" });
                        const dateStr = date.toLocaleDateString("tr-TR");
                        const startTime = slot.start_time.slice(0, 5);
                        const endTime = slot.end_time.slice(0, 5);
                        return {
                          value: slot.slot_id,
                          label: `${dateStr} ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${startTime}-${endTime}`,
                        };
                      })
                      .find((opt) => opt.value === selectedSlot) || null
                  }
                  setSelectedOption={(option) => setSelectedSlot(option.value)}
                />
              )}
            </div>
            <div className="bm-modal-form-item">
              <label>Görüşme Sebebi</label>
              <textarea
                className="bm-modal-meeting-reason-textarea"
                placeholder="Görüşmek istediğiniz konuyu yazınız..."
                value={meetingReason}
                onChange={e => setMeetingReason(e.target.value)}
                style={{ background: "#232323", color: "#fff", border: "1px solid #444" }}
                rows={3}
              />
            </div>
            <div className="bm-modal-action-buttons">
              <button
                className="bm-modal-button reject"
                onClick={closeMentorModal}
              >
                Vazgeç
              </button>
              <button
                className="bm-modal-button approve"
                onClick={handleModalConfirm}
              >
                Görüşme Talebinde Bulun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseMentors;
