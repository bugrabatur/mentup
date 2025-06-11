import React, { useState } from 'react';
import "./Login.css";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Çerezleri göndermek için
      });

      const data = await response.json();

      if (!response.ok) {
      // 🔴 errorCode'lara göre frontend mesajı ayarla
      if (data.errorCode === "validation_error") {
        setMessage("Lütfen geçerli bir e-posta ve şifre giriniz.");
      } else if (data.errorCode === "user_not_found") {
        setMessage("Böyle bir kullanıcı bulunamadı.");
      } else if (data.errorCode === "wrong_password") {
        setMessage("Şifreniz hatalı.");
      } else {
        setMessage("Bilinmeyen bir hata oluştu.");
      }
      return;
    }

      setMessage(data.message || "Giriş başarılı!");

      if (data.token) {
        console.log("Kullanıcı rolü:", data.user.role); // Debug için
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role); // Rolü kaydediyoruz
        localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/adminpanel");
      } else if (data.user.role === "mentee") {
        navigate("/home");
      } else if (data.user.role === "mentor") {
        navigate("/home");
      } else {
        setMessage("Bilinmeyen kullanıcı rolü!");
      }
      } else {
        setMessage("Token alınamadı.");
      }
    } catch (error) {
      setMessage(error.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      const response = await fetch("http://localhost:5001/user/role", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const roleData = await response.json();
      console.log("Doğrulanan rol:", roleData.role);
    } catch (error) {
      console.error("Rol doğrulama hatası:", error);
    }
  };

  return (
    <div>
      <div className="login-container">
        <div className='login-logo-name'>
          <a href='/home'>MentUp</a>
        </div>
        <div className="login-box">
          <h1 className="login-title">Tekrar Hoşgeldin</h1>
          <h2>Hesabına giriş yap</h2>
          <form>
            <div className="input-group">
              <label htmlFor="email">E-posta</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@example.com"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Şifre</label>
              <div className="password-wrapper-login-page">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon icon={faEye} style={{ fontSize: '18px', color: 'grey'}} />
                </button>
              </div>
            </div>
            <div className="options">
              <label className="remember-me">
                <input type="checkbox" /> Beni Hatırla
              </label>
              <a href="/forgotpassword" className="forgot-password">Şifremi unuttum?</a>
            </div>
            <button
              onClick={handleSubmit}
              type="submit"
              className="login-button-login-page"
              disabled={isLoading}
            >
              {isLoading ? "Yükleniyor..." : "Giriş Yap"}
            </button>
            <div className='login-page-signup-div'>
              <span>Hesabın yok mu? </span>
              <a href='/signup'> Hemen kaydol</a>
            </div>
            {message && <p className="message">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
