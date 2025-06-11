import React, { useState, useEffect } from 'react';
import './Navbar2.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faBell, faAngleDown, faGear, faArrowRightFromBracket, faCircleUser, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

const NavBar2 = () => {  
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [userSurname, setUserSurname] = useState('');
  const [photo_url, setPhoto_url] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(response.data.name);
        setUserSurname(response.data.surname);
        setPhoto_url(response.data.profile?.photo_url || null); // Profil resmi yoksa null olarak ayarla
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchTotalUnread = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch("http://localhost:5001/message/unread-counts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTotalUnread(data.totalUnread || 0);
    };
    fetchTotalUnread();

    // Event ile güncelle
    const handler = () => fetchTotalUnread();
    window.addEventListener("refreshUnreadCount", handler);
    return () => window.removeEventListener("refreshUnreadCount", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:5001/auth/logout',
        {}, // Boş bir body gönderiyoruz
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Token'ı temizle ve kullanıcıyı giriş sayfasına yönlendir
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      navigate('/login');
    } catch (e) {
      console.warn('Server logout hatası (yine de devam ediyoruz):', e);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible((prevState) => !prevState);
  };

  const closeDropdown = (event) => {
    if (!event.target.closest('.navbar-secondary-profile')) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeDropdown);
    return () => {
      document.removeEventListener('click', closeDropdown);
    };
  }, []);

  const handleOpenChatWidget = () => {
    window.dispatchEvent(new Event("openChatWidget"));
  };

  return (
    <nav className="navbar-secondary">
      <div className="navbar-secondary-content">
        <div className="navbar-secondary-logo-name">
          <a href="/home" className="navbar-secondary-logo-link">
            <div className="navbar-secondary-logo-image" />
            <span>MentUp</span>
          </a>
        </div>
        {/* Mobilde hamburger/options iconu */}
        <button
          className="navbar-secondary-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} size="2g" />
        </button>
        {/* Masaüstü menü */}
        <div className="navbar-secondary-apply-mentorship navbar-secondary-desktop-only">
          <Link to="/applymentorship">Mentorluk İçin Başvur</Link>
        </div>
        <div className="navbar-secondary-items-right-col navbar-secondary-desktop-only">
          <div className="navbar-secondary-items">
            <Link to="/browsementors">Mentorlara Göz At</Link>
            <a href="/appointments">Görüşmelerim</a>
            <a href="/appointmentrequests">Görüşme Taleplerim</a>
            <a href="/contact">İletişim</a>
            <a href="/aboutus">Hakkımızda</a>
          </div>
          <div className="navbar-secondary-options">
            <button className="navbar-secondary-messages-button" onClick={handleOpenChatWidget} style={{ position: "relative" }}>
              <FontAwesomeIcon icon={faMessage} style={{ color: "white" }} />
              {totalUnread > 0 && (
                <span className="navbar-unread-badge">{totalUnread}</span>
              )}
            </button>
            <button className="navbar-secondary-notifications-button">
              <FontAwesomeIcon icon={faBell} style={{ color: "white" }} />
            </button>
            <div className="navbar-secondary-profile">
              <button
                className="navbar-secondary-profile-button"
                onClick={toggleDropdown}
              >
                <div className="navbar-secondary-profile-icon">
                  {photo_url ? (
                    <img
                      src={photo_url}
                      alt=""
                      className="navbar-secondary-profile-image"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faCircleUser} style={{ color: "white", fontSize: "24px" }} />
                  )}
                </div>
                <div className="navbar-secondary-arrow-down-icon">
                  <FontAwesomeIcon
                    icon={faAngleDown}
                    style={{ color: "white" }}
                  />
                </div>
              </button>
              {isDropdownVisible && (
                <ul className="navbar-secondary-dropdown-menu">
                  <li>
                    <a 
                      className="navbar-secondary-profile-info"
                      href='/menteeprofile'
                    >
                      <div
                        className="navbar-secondary-profile-dropdown-image"
                        style={{
                          backgroundImage: photo_url
                            ? `url(${photo_url})`
                            : "none",
                        }}
                      >
                        {!photo_url && (
                          <FontAwesomeIcon
                            icon={faCircleUser}
                            style={{ color: "grey", fontSize: "40px" }}
                          />
                        )}
                      </div>
                      <div className="navbar-profile-details">
                        <span className="navbar-profile-name">{userName} {userSurname}</span>
                        <p className="navbar-view-profile-link">Profili Görüntüle</p>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a
                      className="navbar-secondary-dropdown-menu-settings"
                      href="/accountsettings"
                    >
                      <FontAwesomeIcon
                        icon={faGear}
                        style={{ color: "white", marginRight: "10px" }}
                      />
                      Hesap Ayarları
                    </a>
                  </li>
                  <li>
                    <a
                      className="navbar-secondary-dropdown-menu-logout"
                      onClick={handleLogout}
                    >
                      <FontAwesomeIcon
                        icon={faArrowRightFromBracket}
                        style={{ color: "white", marginRight: "10px" }}
                      />
                      Çıkış Yap
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
        {/* Mobilde sağdaki ikonlar */}
        <div className="navbar-secondary-options navbar-secondary-mobile-icons">
          <button className="navbar-secondary-messages-button" onClick={handleOpenChatWidget} style={{ position: "relative" }}>
            <FontAwesomeIcon icon={faMessage} style={{ color: "white" }} />
            {totalUnread > 0 && (
              <span className="navbar-unread-badge">{totalUnread}</span>
            )}
          </button>
          <button className="navbar-secondary-notifications-button">
            <FontAwesomeIcon icon={faBell} style={{ color: "white" }} />
          </button>
          <div className="navbar-secondary-profile">
            <button
              className="navbar-secondary-profile-button"
              onClick={toggleDropdown}
            >
              <div className="navbar-secondary-profile-icon">
                {photo_url ? (
                  <img
                    src={photo_url}
                    alt=""
                    className="navbar-secondary-profile-image"
                  />
                ) : (
                  <FontAwesomeIcon icon={faCircleUser} style={{ color: "white", fontSize: "24px" }} />
                )}
              </div>
              <div className="navbar-secondary-arrow-down-icon">
                <FontAwesomeIcon
                  icon={faAngleDown}
                  style={{ color: "white" }}
                />
              </div>
            </button>
            {isDropdownVisible && (
              <ul className="navbar-secondary-dropdown-menu">
                <li>
                  <a 
                    className="navbar-secondary-profile-info"
                    href='/menteeprofile'
                  >
                    <div
                      className="navbar-secondary-profile-dropdown-image"
                      style={{
                        backgroundImage: photo_url
                          ? `url(${photo_url})`
                          : "none",
                      }}
                    >
                      {!photo_url && (
                        <FontAwesomeIcon
                          icon={faCircleUser}
                          style={{ color: "grey", fontSize: "40px" }}
                        />
                      )}
                    </div>
                    <div className="navbar-profile-details">
                      <span className="navbar-profile-name">{userName} {userSurname}</span>
                      <p className="navbar-view-profile-link">Profili Görüntüle</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    className="navbar-secondary-dropdown-menu-settings"
                    href="/accountsettings"
                  >
                    <FontAwesomeIcon
                      icon={faGear}
                      style={{ color: "white", marginRight: "10px" }}
                    />
                    Hesap Ayarları
                  </a>
                </li>
                <li>
                  <a
                    className="navbar-secondary-dropdown-menu-logout"
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon
                      icon={faArrowRightFromBracket}
                      style={{ color: "white", marginRight: "10px" }}
                    />
                    Çıkış Yap
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
      {/* Mobil menü paneli */}
      {mobileMenuOpen && (
        <div className="navbar-secondary-mobile-menu">
          <div className="navbar-secondary-mobile-links">
            <Link to="/menteeprofile" onClick={() => setMobileMenuOpen(false)}>Profilimi Görüntüle</Link>
            <Link to="/applymentorship" onClick={() => setMobileMenuOpen(false)}>Mentorluk İçin Başvur</Link>
            <Link to="/browsementors" onClick={() => setMobileMenuOpen(false)}>Mentorlara Göz At</Link>
            <a href="/appointments" onClick={() => setMobileMenuOpen(false)}>Görüşmelerim</a>
            <a href="/appointmentrequests" onClick={() => setMobileMenuOpen(false)}>Görüşme Taleplerim</a>
            <a href="/contact" onClick={() => setMobileMenuOpen(false)}>İletişim</a>
            <a href="/aboutus" onClick={() => setMobileMenuOpen(false)}>Hakkımızda</a>
            <Link to="/accountsettings" onClick={() => setMobileMenuOpen(false)}>Hesap Ayarları</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar2;
