import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleGoHome = () => {
    if (role === 'admin') {
      navigate('/adminpanel');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404 - Sayfa Bulunamadı</h1>
      <p className="notfound-description">Bu sayfaya erişim izniniz yok.</p>
      <button className="notfound-button" onClick={handleGoHome}>
        {role === 'admin' ? 'Mentorluk Başvurularına Dön' : 'Ana Sayfaya Dön'}
      </button>
    </div>
  );
};

export default NotFound;