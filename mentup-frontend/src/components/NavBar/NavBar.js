import React from "react";
import './NavBar.css';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
      navigate('/login');
  };

  const handleSignupClick = () => {
      navigate('/signup');
  };

  return (

    <nav className="navbar-first">
      <div className="navbar-first-content">
        <div className='navbar-first-logo-name'>
          <div className='navbar-secondary-logo-image'/>
          <Link to='/home'>MentUp</Link>
        </div>
        <div className='navbar-first-apply-mentorship'>
          <Link to="/applymentorship">Mentorluk İçin Başvur</Link>
        </div>
        <div className='navbar-first-items-right-col'>
          <div className="navbar-first-items">
            <Link className="navbar-first-items-browse-mentors" to="/browsementors">Mentorlara Göz At</Link>
            {/* <a className="navbar-first-itemss-mentors" href="/mentors">Mentorlarımız</a> */}
            <Link className="navbar-first-items-contact" to="/contact">İletişim</Link>
            <Link className="navbar-first-items-about-us" to="/aboutus">Hakkımızda</Link>
          </div>
          <div className="navbar-first-auth-buttons">
            <button className="navbar-first-login-button" onClick={handleLoginClick}>Giriş Yap</button>
            <button className="navbar-first-register-button" onClick={handleSignupClick}>Kayıt Ol</button>
          </div>
        </div>
      </div>   
    </nav>

  );
};
export default NavBar;