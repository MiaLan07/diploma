// src/pages/AuthPage.jsx  (или src/components/AuthPage.jsx)
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AuthPage.css';
import { ReactComponent as IconEyeOpen } from '../../assets/eye-opened1.svg';
import { ReactComponent as IconEyeClose } from '../../assets/eye-closed1.svg';
import Footer from '../../components/ui/Footer'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // true = авторизация, false = регистрация
  const [activeTab, setActiveTab] = useState('email'); // только для логина
  // ── Поля для логина 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // ── Поля для регистрации 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [bgImageLogin, setBgImageLogin] = useState('/fallback-login.jpg');
  const [bgImageRegister, setBgImageRegister] = useState('/fallback-register.jpg');

  useEffect(() => {
    const loadBackgrounds = async () => {
      // Изображение для авторизации
      try {
        const resLogin = await axios.get(`${API_URL}/images/hero-login.jpg`, {
          responseType: 'blob',
        });
        setBgImageLogin(URL.createObjectURL(resLogin.data));
      } catch (err) {
        console.warn('Не удалось загрузить login-hero.jpg', err);
      }

      // Изображение для регистрации
      try {
        const resReg = await axios.get(`${API_URL}/images/hero-register.jpg`, {
          responseType: 'blob',
        });
        setBgImageRegister(URL.createObjectURL(resReg.data));
      } catch (err) {
        console.warn('Не удалось загрузить register-hero.jpg', err);
      }
    };
    loadBackgrounds();
    return () => {
      if (bgImageLogin.startsWith('blob:')) URL.revokeObjectURL(bgImageLogin);
      if (bgImageRegister.startsWith('blob:')) URL.revokeObjectURL(bgImageRegister);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'phone') {
      setError('Вход по номеру телефона пока не реализован');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка авторизации');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (regPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        firstName,
        lastName,
        email: regEmail,
        password: regPassword,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (<>
    <div className="auth-container"
    style={{
        backgroundImage: `url(${isLogin ? bgImageLogin : bgImageRegister})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.6s ease-in-out', // плавная смена фона
      }}>
      <div className="auth-card">

        {/* ── Главные вкладки Регистрация / Авторизация  */}
        <div className="main-tabs">
          <button
            className={`main-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Регистрация
          </button>
          <button
            className={`main-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Авторизация
          </button>
          <div className="active-underline" style={{ left: isLogin ? '50%' : '0%' }} />
        </div>

        {isLogin ? (
          // ── Форма входа 
          <form onSubmit={handleLogin}>
            <div className="tabs secondary-tabs">
              <button
                type="button"
                className={`tab ${activeTab === 'email' ? 'active' : ''}`}
                onClick={() => setActiveTab('email')}
              >
                ПОЧТА
              </button>
              <button
                type="button"
                className={`tab ${activeTab === 'phone' ? 'active' : ''}`}
                onClick={() => setActiveTab('phone')}
              >
                ТЕЛЕФОН
              </button>
            </div>

            {activeTab === 'email' ? (
              <>
                <div className="form-group">
                  <label>Электронная почта</label>
                  <input
                    type="email"
                    placeholder="Чтобы вспомнить вас"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group password-group">
                  <label>Пароль</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Проверить точно ли вы"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <IconEyeOpen /> : <IconEyeClose />}
                    </button>
                  </div>
                </div>

                {isLogin && activeTab === 'email' && (
                  <div className="forgot-password-wrapper">
                    <button
                      type="button"
                      className="forgot-password-btn"
                      onClick={() => {
                        // Здесь будет переход на страницу восстановления или открытие модалки
                        navigate('/forgot-password');
                        // или: setShowForgotModal(true);
                      }}
                    >
                      Забыли пароль?
                    </button>
                  </div>
                )}

              </>
            ) : (
              <p className="placeholder-text">Вход по телефону временно недоступен</p>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn">
              <p>ВОЙТИ</p>
            </button>
          </form>
        ) : (
          // ── Форма регистрации
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Имя</label>
              <input
                type="text"
                placeholder="Как к вам обращаться"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value.trim())}
                required
              />
            </div>

            <div className="form-group">
              <label>Фамилия</label>
              <input
                type="text"
                placeholder="Что мы будем видеть в обращениях, помимо имени"
                value={lastName}
                onChange={(e) => setLastName(e.target.value.trim())}
                required
              />
            </div>

            <div className="form-group">
              <label>Электронная почта</label>
              <input
                type="email"
                placeholder="Куда пришлём ответ и выборку"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value.trim())}
                required
              />
            </div>

            <div className="form-group password-group">
              <label>Пароль</label>
              <div className="password-wrapper">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="8+ символов, с заглавными буквами и цифрами"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                >
                  {showRegPassword ? <IconEyeOpen /> : <IconEyeClose />}
                </button>
              </div>
            </div>

            <div className="form-group password-group">
              <label>Повтор пароля</label>
              <div className="password-wrapper">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Проверяем вас"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <IconEyeOpen /> : <IconEyeClose />}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn">
              <p>ЗАРЕГИСТРИРОВАТЬСЯ</p>
            </button>
          </form>
        )}

        <p className="switch-link">
            {isLogin ? (
                <>
                Нет аккаунта?{" "}
                <button
                    type="button"
                    className="link-button"
                    onClick={() => setIsLogin(false)}
                >
                    Зарегистрироваться
                </button>
                </>
            ) : (
                <>
                Уже есть аккаунт?{" "}
                <button
                    type="button"
                    className="link-button"
                    onClick={() => setIsLogin(true)}
                >
                    Войти
                </button>
                </>
            )}
            </p>
      </div>
    </div>
    <Footer backForm={true} />
    </>
  );
}