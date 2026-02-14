import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
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
      const msg = err.response?.data?.message || 'Ошибка авторизации';
      setError(msg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            ПОЧТА
          </button>
          <button
            className={`tab ${activeTab === 'phone' ? 'active' : ''}`}
            onClick={() => setActiveTab('phone')}
          >
            ТЕЛЕФОН
          </button>
        </div>

        <h2 className="title">Авторизация</h2>

        <form onSubmit={handleSubmit}>
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

              <div className="form-group">
                <label>Пароль</label>
                <input
                  type="password"
                  placeholder="Проверить точно ли вы"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <p className="placeholder-text">Вход по телефону временно недоступен</p>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn"><p>ВОЙТИ</p></button>
        </form>

        <p className="switch-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;