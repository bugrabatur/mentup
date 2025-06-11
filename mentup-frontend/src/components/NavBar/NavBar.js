import React, { useState } from "react";
import './NavBar.css';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

const NavBar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoginClick = () => navigate('/login');
  const handleSignupClick = () => navigate('/signup');

  return (
    <nav className="navbar-first">
      <div className="navbar-first-content">
        <div className='navbar-first-logo-name'>
          <div className='navbar-secondary-logo-image'/>
          <Link to='/home'>MentUp</Link>
        </div>
        {/* Hamburger icon (mobile only) */}
        {!mobileMenuOpen && (
          <button
            className="navbar-hamburger"
            onClick={() => setMobileMenuOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} size="3g" />
          </button>
        )}
        {mobileMenuOpen && (
          <button
            className="navbar-mobile-close navbar-hamburger"
            onClick={() => setMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faTimes} size="2g" />
          </button>
        )}
        {/* Normal menu (desktop) */}
        <div className='navbar-first-apply-mentorship navbar-desktop-only'>
          <Link to="/applymentorship">Mentorluk İçin Başvur</Link>
        </div>
        <div className='navbar-first-items-right-col navbar-desktop-only'>
          <div className="navbar-first-items">
            <Link to="/browsementors">Mentorlara Göz At</Link>
            <Link to="/contact">İletişim</Link>
            <Link to="/aboutus">Hakkımızda</Link>
          </div>
          <div className="navbar-first-auth-buttons">
            <button className="navbar-first-login-button" onClick={handleLoginClick}>Giriş Yap</button>
            <button className="navbar-first-register-button" onClick={handleSignupClick}>Kayıt Ol</button>
          </div>
        </div>
      </div>
      {/* Mobil menü paneli */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <div className="navbar-mobile-links">
            <Link to="/applymentorship" onClick={() => setMobileMenuOpen(false)}>Mentorluk İçin Başvur</Link>
            <Link to="/browsementors" onClick={() => setMobileMenuOpen(false)}>Mentorlara Göz At</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>İletişim</Link>
            <Link to="/aboutus" onClick={() => setMobileMenuOpen(false)}>Hakkımızda</Link>
            <button className="navbar-first-login-button" onClick={() => { setMobileMenuOpen(false); handleLoginClick(); }}>Giriş Yap</button>
            <button className="navbar-first-register-button" onClick={() => { setMobileMenuOpen(false); handleSignupClick(); }}>Kayıt Ol</button>
          </div>
        </div>
      )}
    </nav>
  );
};
export default NavBar;