// src/pages/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthPage.css';
import { ReactComponent as IconEyeOpen } from '../../assets/eye-opened1.svg';
import { ReactComponent as IconEyeClose } from '../../assets/eye-closed1.svg';
import Footer from '../../components/ui/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState('email');

  // Поля логина
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Поля регистрации
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Ошибки
  const [fieldErrors, setFieldErrors] = useState({}); // { regPassword: "Текст ошибки" }
  const [generalError, setGeneralError] = useState(''); // общая под кнопкой
  const navigate = useNavigate();

  // Фон (без изменений)
  const [bgImageLogin, setBgImageLogin] = useState('/fallback-login.jpg');
  const [bgImageRegister, setBgImageRegister] = useState('/fallback-register.jpg');

  useEffect(() => {
    const loadBackgrounds = async () => {
      try {
        const resLogin = await axios.get(`${API_URL}/images/hero-login.jpg`, { responseType: 'blob' });
        setBgImageLogin(URL.createObjectURL(resLogin.data));
      } catch {}
      try {
        const resReg = await axios.get(`${API_URL}/images/hero-register.jpg`, { responseType: 'blob' });
        setBgImageRegister(URL.createObjectURL(resReg.data));
      } catch {}
    };
    loadBackgrounds();
    return () => {
      if (bgImageLogin.startsWith('blob:')) URL.revokeObjectURL(bgImageLogin);
      if (bgImageRegister.startsWith('blob:')) URL.revokeObjectURL(bgImageRegister);
    };
  }, []);

  // Очистка ошибок при смене вкладки/таба
  useEffect(() => {
    setFieldErrors({});
    setGeneralError('');
  }, [isLogin, activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    if (activeTab === 'phone') {
      setGeneralError('Вход по номеру телефона пока не реализован');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      window.dispatchEvent(new Event('authChange'));
      navigate('/cabinet');
    } catch (err) {
      const errData = err.response?.data;

      if (errData?.errors && Array.isArray(errData.errors)) {
        const newErrors = {};
        errData.errors.forEach((e) => {
          // Маппим бэкенд-поле на фронт-поле
          let field = e.field;
          if (field === 'email') field = 'email';
          if (field === 'password') field = 'password';
          newErrors[field] = e.message;
        });
        setFieldErrors(newErrors);
      } else if (errData?.message) {
        setGeneralError(errData.message);
      } else {
        setGeneralError('Не удалось войти. Проверьте интернет или попробуйте позже.');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    if (regPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Пароли не совпадают' });
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        firstName,
        lastName,
        email: regEmail,
        password: regPassword,
      });
      localStorage.setItem('token', res.data.token);
      window.dispatchEvent(new Event('authChange'));
      navigate('/cabinet');
    } catch (err) {
      const errData = err.response?.data;

      if (errData?.errors && Array.isArray(errData.errors)) {
        const newErrors = {};
        errData.errors.forEach((e) => {
          let field = e.field;

          // Маппинг бэкенд-полей → фронт-поля
          if (field === 'firstName') field = 'firstName';
          if (field === 'lastName') field = 'lastName';
          if (field === 'email') field = 'regEmail';
          if (field === 'password') field = 'regPassword';

          newErrors[field] = e.message;
        });
        setFieldErrors(newErrors);
      } else if (errData?.message) {
        let assigned = false;
        const msgLower = errData.message.toLowerCase();

        if (msgLower.includes('email') || msgLower.includes('почт')) {
          setFieldErrors(prev => ({ ...prev, regEmail: errData.message }));
          assigned = true;
        }
        if (msgLower.includes('парол')) {
          setFieldErrors(prev => ({ ...prev, regPassword: errData.message }));
          assigned = true;
        }
        if (msgLower.includes('имя') || msgLower.includes('first')) {
          setFieldErrors(prev => ({ ...prev, firstName: errData.message }));
          assigned = true;
        }
        if (msgLower.includes('фамили') || msgLower.includes('last')) {
          setFieldErrors(prev => ({ ...prev, lastName: errData.message }));
          assigned = true;
        }

        if (!assigned) {
          setGeneralError(errData.message);
        }
      } else {
        setGeneralError('Не удалось зарегистрироваться. Попробуйте позже.');
      }
    }
  };

  return (
    <>
      <div
        className="auth-container"
        style={{
          backgroundImage: `url(${isLogin ? bgImageLogin : bgImageRegister})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transition: 'background-image 0.6s ease-in-out',
        }}
      >
        <div className="auth-card">
          <div className="main-tabs">
            <button className={`main-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>
              Регистрация
            </button>
            <button className={`main-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>
              Авторизация
            </button>
            <div className="active-underline" style={{ left: isLogin ? '50%' : '0%' }} />
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin}>
              <div className="tabs secondary-tabs">
                <button type="button" className={`tab ${activeTab === 'email' ? 'active' : ''}`} onClick={() => setActiveTab('email')}>
                  ПОЧТА
                </button>
                <button type="button" className={`tab ${activeTab === 'phone' ? 'active' : ''}`} onClick={() => setActiveTab('phone')}>
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFieldErrors(prev => ({ ...prev, email: '' }));
                      }}
                      required
                      className={fieldErrors.email ? 'input-error' : ''}
                    />
                    {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                  </div>

                  <div className="form-group password-group">
                    <label>Пароль</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Проверить точно ли вы"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setFieldErrors(prev => ({ ...prev, password: '' }));
                        }}
                        required
                        className={fieldErrors.password ? 'input-error' : ''}
                      />
                      <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                        {!showPassword ? <IconEyeClose /> : <IconEyeOpen />}
                      </button>
                    </div>
                    {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                  </div>

                  <div className="forgot-password-wrapper">
                    <button type="button" className="forgot-password-btn" onClick={() => navigate('/forgot-password')}>
                      Забыли пароль?
                    </button>
                  </div>
                </>
              ) : (
                <p className="placeholder-text">Вход по телефону временно недоступен</p>
              )}

              {generalError && <div className="general-error">{generalError}</div>}

              <button type="submit" className="submit-btn">
                ВОЙТИ
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Имя</label>
                <input
                  type="text"
                  placeholder="Как к вам обращаться"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value.trim());
                    setFieldErrors(prev => ({ ...prev, firstName: '' }));
                  }}
                  required
                  className={fieldErrors.firstName ? 'input-error' : ''}
                />
                {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
              </div>

              <div className="form-group">
                <label>Фамилия</label>
                <input
                  type="text"
                  placeholder="Что мы будем видеть в обращениях, помимо имени"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value.trim());
                    setFieldErrors(prev => ({ ...prev, lastName: '' }));
                  }}
                  required
                  className={fieldErrors.lastName ? 'input-error' : ''}
                />
                {fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}
              </div>

              <div className="form-group">
                <label>Электронная почта</label>
                <input
                  type="email"
                  placeholder="Куда пришлём ответ и выборку"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value.trim());
                    setFieldErrors(prev => ({ ...prev, regEmail: '' }));
                  }}
                  required
                  className={fieldErrors.regEmail ? 'input-error' : ''}
                />
                {fieldErrors.regEmail && <span className="field-error">{fieldErrors.regEmail}</span>}
              </div>

              <div className="form-group password-group">
                <label>Пароль</label>
                <div className="password-wrapper">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="8+ символов, с заглавными буквами и цифрами"
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      setFieldErrors(prev => ({ ...prev, regPassword: '' }));
                    }}
                    required
                    className={fieldErrors.regPassword ? 'input-error' : ''}
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowRegPassword(!showRegPassword)}>
                    {!showRegPassword ? <IconEyeClose /> : <IconEyeOpen />}
                  </button>
                </div>
                {fieldErrors.regPassword && <span className="field-error">{fieldErrors.regPassword}</span>}
              </div>

              <div className="form-group password-group">
                <label>Повтор пароля</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Проверяем вас"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    required
                    className={fieldErrors.confirmPassword ? 'input-error' : ''}
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowConfirm(!showConfirm)}>
                    {!showConfirm ? <IconEyeClose /> : <IconEyeOpen />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
              </div>

              {generalError && <div className="general-error">{generalError}</div>}

              <button type="submit" className="submit-btn">
                ЗАРЕГИСТРИРОВАТЬСЯ
              </button>
            </form>
          )}

          <p className="switch-link">
            {isLogin ? (
              <>
                Нет аккаунта?{' '}
                <button type="button" className="link-button" onClick={() => setIsLogin(false)}>
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button type="button" className="link-button" onClick={() => setIsLogin(true)}>
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