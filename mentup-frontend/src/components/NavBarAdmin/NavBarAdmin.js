import React, { useState, useEffect } from 'react';
import './NavBarAdmin.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faArrowRightFromBracket, faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NavBarAdmin = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [userSurname, setUserSurname] = useState('');
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
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:5001/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (e) {
      console.warn('Server logout hatası (yine de devam ediyoruz):', e);
    }
  };

  const toggleDropdown = () => setDropdownVisible((prev) => !prev);

  const closeDropdown = (event) => {
    if (!event.target.closest('.navbar-admin-profile')) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeDropdown);
    return () => {
      document.removeEventListener('click', closeDropdown);
    };
  }, []);

  return (
    <nav className="navbar-admin">
      <div className="navbar-admin-content">
        <div className="navbar-admin-logo-name">
          <a href="/adminpanel" className="navbar-admin-logo-link">
            <div className="navbar-admin-logo-image" />
            <span>MentUp</span>
          </a>
        </div>
        <div className='navbar-admin-links'>
          <a href='/adminpanel' className='navbar-admin-link'>Mentorluk Başvuruları</a>
        </div>
        <div className="navbar-admin-profile">
          <button
            className="navbar-admin-profile-button"
            onClick={toggleDropdown}
          >
            <FontAwesomeIcon icon={faCircleUser} style={{ color: "gray", fontSize: "24px" }} />
            <FontAwesomeIcon icon={faAngleDown} style={{ color: "white"}} />
          </button>
          {isDropdownVisible && (
            <ul className="navbar-admin-dropdown-menu">
              <li>
                <div className="navbar-admin-profile-info">
                  <FontAwesomeIcon icon={faCircleUser} style={{ color: "grey", fontSize: "40px" }} />
                  <div className="navbar-admin-profile-details">
                    <span className="navbar-admin-profile-name">{userName} {userSurname}</span>
                  </div>
                </div>
              </li>
              <li>
                <a
                  className="navbar-admin-dropdown-menu-logout"
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
    </nav>
  );
};

export default NavBarAdmin;