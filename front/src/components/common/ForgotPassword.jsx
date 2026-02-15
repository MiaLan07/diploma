import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await axios.post('http://localhost:5000/api/user/forgot-password', { email });
      setMessage('Письмо с инструкцией отправлено на указанную почту (если она зарегистрирована)');
    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="title">Восстановление пароля</h2>
        <p style={{ textAlign: 'center', marginBottom: '24px', color: '#666' }}>
          Укажите email, привязанный к аккаунту
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Электронная почта</label>
            <input
              type="email"
              placeholder="Ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {message && <div style={{ color: 'green', textAlign: 'center', margin: '16px 0' }}>{message}</div>}
          {error && <div style={{ color: 'red', textAlign: 'center', margin: '16px 0' }}>{error}</div>}

          <button type="submit" className="submit-btn">
            Отправить
          </button>
        </form>

        <p className="switch-link" style={{ marginTop: '24px' }}>
          <button className="link-button" onClick={() => navigate(-1)}>
            ← Вернуться ко входу
          </button>
        </p>
      </div>
    </div>
  );
}