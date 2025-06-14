import { useState, useEffect } from "react";
import axios from 'axios';
import "./mentorProfile.css";
import ProfileSettingsBar from "../../components/ProfileSettingsBar/ProfileSettingsBar";
import ProfilePhotoUpload from "../../components/ProfilePhotoUpload/ProfilePhotoUpload";

const CustomDropdown = ({ options, selectedOptions, setSelectedOptions, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleOutsideClick = (event) => {
    if (!event.target.closest(".mentor-profile-custom-dropdown")) {
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
    <div className="mentor-profile-custom-dropdown">
      <label className="mentor-profile-custom-dropdown-label">{label}</label>
      <div className="mentor-profile-custom-dropdown-input" onClick={toggleDropdown}>
        {selectedOptions.length > 0 ? selectedOptions.join(", ") : "Seçim yapın"}
      </div>
      {isOpen && (
        <div className="mentor-profile-custom-dropdown-menu">
          {options.map((option, index) => (
            <div
              key={index}
              className={`mentor-profile-custom-dropdown-option ${
                selectedOptions.includes(option) ? "selected" : ""
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SingleSelectDropdown = ({ options, selectedOption, setSelectedOption, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const handleOutsideClick = (event) => {
    if (!event.target.closest(".mentor-profile-custom-dropdown")) {
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
    <div className="mentor-profile-custom-dropdown">
      <label className="mentor-profile-custom-dropdown-label">{label}</label>
      <div className="mentor-profile-custom-dropdown-input" onClick={toggleDropdown}>
        {selectedOption || "Seçim yapın"}
      </div>
      {isOpen && (
        <div className="mentor-profile-custom-dropdown-menu">
          {options.map((option, index) => (
            <div
              key={index}
              className={`mentor-profile-custom-dropdown-option ${
                selectedOption === option ? "selected" : ""
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MentorProfile = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [college, setCollege] = useState("");
  const [location, setLocation] = useState("");
  const [languages, setLanguages] = useState([]);
  const [skills, setSkills] = useState([]);
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [industries, setIndustries] = useState([]);

  const cities = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
    "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
    "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri",
    "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
    "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
    "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
    "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
    "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye",
    "Düzce"
  ];

  const skillOptions = [
    "C", "C++", "C#", "CSS", "HTML", "Java", "JavaScript", "Kotlin", "PHP", "Python", "R", "TypeScript"
  ];

  const languageOptions = [
    "Almanca", "Arapça", "Çince (Mandarin)", "Fransızca", "Hintçe", "İngilizce", "İspanyolca",
    "İtalyanca", "Japonca", "Korece", "Portekizce", "Rusça", "Türkçe"
  ];

  // const industriesOptions = [
  //   "Yazılım Geliştirme", "Web Teknolojileri", "Mobil Teknolojiler", "Oyun Geliştirme",
  //   "Veritabanı ve Backend", "Yapay Zeka & Veri Bilimi", "Veri Analizi & BI",
  //   "Tasarım & UI/UX", "Pazarlama & İş Geliştirme"
  // ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get("http://localhost:5001/profile/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const user = res.data;
        const profile = user.profile || {};

        setName(user.name || "");
        setSurname(user.surname || "");
        setCollege(profile.college || "");
        setLocation(profile.location || "");
        setSkills(Array.isArray(profile.skills) ? profile.skills : JSON.parse(profile.skills || "[]"));
        setLanguages(Array.isArray(profile.languages) ? profile.languages : JSON.parse(profile.languages || "[]"));
        let industriesArr = [];
        if (user.documents && user.documents.length > 0 && user.documents[0].industries) {
          industriesArr = Array.isArray(user.documents[0].industries)
            ? user.documents[0].industries
            : JSON.parse(user.documents[0].industries || "[]");
        }
        setIndustries(industriesArr);
        setProfilePhoto(profile.photo_url || null); 
        setBio(profile.bio || "");
        setPhone(profile.phone || "");
        setTokenChecked(true);
      })
      .catch((err) => {
        console.error("Profil verisi alınamadı:", err);
      });
  }, []);

  if (!tokenChecked) return <p>Yükleniyor...</p>;

  const handlePhotoChange = async (newPhotoUrl) => {
    setProfilePhoto(newPhotoUrl);

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        "http://localhost:5001/profile/me",
        { photo_url: newPhotoUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Profil fotoğrafı güncellendi!");
    } catch (err) {
      console.error("Profil fotoğrafı güncellenemedi:", err);
    }
  };

  const handlePhoneChange = (e) => {
    let phoneNumber = e.target.value;
    phoneNumber = phoneNumber.replace(/\D/g, "");
    if (phoneNumber.length > 3 && phoneNumber.length <= 6) {
      phoneNumber = phoneNumber.replace(/(\d{3})(\d{1,3})/, "$1 $2");
    } else if (phoneNumber.length > 6) {
      phoneNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{1,4})/, "$1 $2 $3");
    }
    const phoneRegex = /^5\d{2} \d{3} \d{4}$/;
    if (!phoneRegex.test(phoneNumber) && phoneNumber.length === 12) {
      setPhoneError("Geçersiz telefon numarası formatı.");
    } else if (phoneNumber.length > 12) {
      setPhoneError("Telefon numarası 10 rakamla sınırlıdır.");
      phoneNumber = phoneNumber.slice(0, 12);
    } else {
      setPhoneError(""); 
    }
    setPhone(phoneNumber);
  };

  const handleSaveClick = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        "http://localhost:5001/profile/me",
        {
          name,
          surname,
          bio,
          photo_url: profilePhoto,
          phone,
          college,
          location,
          skills: JSON.stringify(skills),
          languages: JSON.stringify(languages),
          Industries: JSON.stringify(industries),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Profil güncellendi");
    } catch (err) {
      console.error("Profil güncelleme hatası:", err.response?.data || err.message);
      alert("Hata oluştu");
    }
  };

  return (
    <div className="mentor-profile-container">
      <header></header>
      <main>
        <div className="mentor-profile-form">
          <h1 className="mentor-profile-title">Ayarlar</h1>
          <div className="mentor-profile-all-settings-form">
            <div className="left-column">
              <div className="photo-settings-card">
                <ProfilePhotoUpload
                  onPhotoChange={handlePhotoChange}
                  profilePhoto={profilePhoto}
                />
              </div>
              <ProfileSettingsBar />
            </div>
            <div className="right-column">
              <div className="mentor-profile-settings-form">
                <h2 className="mentor-profile-settings-form-title">
                  Profil Ayarları
                </h2>
                <h6 className="mentor-profile-required-info-text">
                  Yanında * sembolü olan yerlerin doldurulması zorunludur.
                </h6>
                <div className="mentor-profile-settings-infos">
                  <div className="mentor-profile-settings-name-surname">
                    <div className="mentor-profile-settings-name">
                      <label className="mentor-profile-settings-name-label">
                        İsim
                      </label>
                      <span className="mentor-profile-span-required"> *</span>
                      <div className="mentor-profile-settings-name-input-div">
                        <input
                          type="text"
                          className="mentor-profile-settings-name-input"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John"
                        />
                      </div>
                    </div>
                    <div className="mentor-profile-settings-surname">
                      <label className="mentor-profile-settings-surname-label">
                        Soyisim
                      </label>
                      <span className="mentor-profile-span-required"> *</span>
                      <div className="mentor-profile-settings-surname-input-div">
                        <input
                          type="text"
                          className="mentor-profile-settings-surname-input"
                          value={surname}
                          onChange={(e) => setSurname(e.target.value)}
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio Field */}
                  <div className="mentor-profile-settings-bio">
                    <label className="mentor-profile-settings-bio-label">
                      Biyografi
                    </label>
                    <div className="mentor-profile-settings-bio-input-div">
                      <input
                        type="text"
                        className="mentor-profile-settings-bio-input"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Biyografi..."
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="mentor-profile-settings-phone">
                    <label className="mentor-profile-settings-phone-label">
                      Telefon Numarası
                    </label>
                    <span className="mentor-profile-span-required"> *</span>
                    <div className="mentor-profile-settings-phone-input-div">
                      <input
                        type="text"
                        className="mentor-profile-settings-phone-input"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="555 555 5555"
                      />
                      {phoneError && (
                        <p style={{ color: "red", marginBottom: "20px" }}>
                          {phoneError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mentor-profile-settings-college">
                    <label className="mentor-profile-settings-college-label">
                      Okuduğunuz/Mezun Olduğunuz Okul
                    </label>
                    <div className="mentor-profile-settings-college-input-div">
                      <input
                        type="text"
                        value={college}
                        className="mentor-profile-settings-college-input"
                        onChange={(e) => setCollege(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mentor-profile-settings-location">
                    <div className="mentor-profile-settings-location-div">
                      <SingleSelectDropdown
                        options={cities}
                        selectedOption={location}
                        setSelectedOption={setLocation}
                        label="Yaşadığınız Şehir"
                      />
                    </div>
                  </div>

                  {/* Beceri Alanları */}
                  {/* <div className="mentor-profile-settings-mentor-fields">
                    <CustomDropdown
                      options={industriesOptions}
                      selectedOptions={industries}
                      setSelectedOptions={setIndustries}
                      label="Beceri Alanları"
                    />
                  </div> */}
                  <div className="mentor-profile-settings-college">
                    <label className="mentor-profile-settings-college-label">
                      Beceri Alanları
                    </label>
                    <div className="mentor-profile-settings-college-input-div">
                      <input
                        type="text"
                        className="mentor-profile-settings-college-input"
                        value={industries.join(", ")}
                        readOnly
                        placeholder="Beceri alanlarınız burada gözükecek"
                      />
                    </div>
                  </div>

                  <div className="mentor-profile-settings-industries">
                    <CustomDropdown
                      options={skillOptions}
                      selectedOptions={skills}
                      setSelectedOptions={setSkills}
                      label="Yazılım Dilleri"
                    />
                  </div>
                  <div className="mentor-profile-settings-languages">
                    <CustomDropdown
                      options={languageOptions}
                      selectedOptions={languages}
                      setSelectedOptions={setLanguages}
                      label="Bilinen Diller"
                    />
                  </div>

                  <div className="mentor-profile-settings-button-save-div">
                    <button
                      type="button"
                      className="mentor-profile-settings-button-save"
                      onClick={handleSaveClick}
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentorProfile;